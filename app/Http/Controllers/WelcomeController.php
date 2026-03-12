<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\DB;

class WelcomeController extends Controller
{
    public function __invoke(Request $request): Response
    {
        // 1. ログイン中のファン情報を取得
        $fanId = Auth::guard('fan')->id();
        $users = Auth::guard('fan')->user();

        // 2. 商品一覧とWant情報を取得
        $products = Product::with(['images', 'translations' => function($q) {
            $q->where('locale', 'ja');
        }])
        ->withCount('fans as wants_count') 
        ->withCount('reservations')
        ->latest()
        ->get()
        ->map(function ($product) use ($fanId) {
            // 3. 各商品ごとに「このファンがWant!済みか」を判定
            $product->is_wanted = $fanId 
                ? $product->fans()->where('fan_id', $fanId)->exists() 
                : false;
            return $product;
        });

        // 2. ★Want!数ランキング（上位5件）
        $ranking = Product::with(['images', 'translations' => function($q) { $q->where('locale', 'ja'); }])
            ->withCount('fans as wants_count')
            ->orderBy('wants_count', 'desc')
            ->take(5)
            ->get();

        // 3. ★国別統計（どの国から何件Want!されているか）
        // wantsテーブルとfansテーブルを結合して集計
        $countryStats = DB::table('wants')
            ->join('fans', 'wants.fan_id', '=', 'fans.id')
            ->join('products', 'wants.product_id', '=', 'products.id')
            ->select(
                'fans.country_code',
                DB::raw('count(wants.id) as total_wants'),
                DB::raw('MIN(products.id) as top_product_id') // 簡易的にその国の最新1件を出すロジック（本来は集計が必要）
            )
            ->groupBy('fans.country_code')
            ->orderBy('total_wants', 'desc')
            ->take(6) // 上位6カ国
            ->get()
            ->map(function($stat) {
                // 各国のNo.1商品を1件だけ取得
                $stat->top_product = \App\Models\Product::with('images')
                    ->withCount('fans as wants_count')
                    ->find($stat->top_product_id);
                return $stat;
            });

        return Inertia::render('Welcome', [
            'products' => $products,
            'ranking' => $ranking,
            'countryStats' => $countryStats,
            'countries' => config('countries.list'),
            'user' => $users,
        ]);
    }
}