<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\ProductImage;
use App\Services\TranslationService;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class ProductController extends Controller
{
    public function create()
    {
        return Inertia::render('Products/Create');
    }

    public function store(Request $request, TranslationService $translationService)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'estimated_price' => 'nullable|numeric',
            'target_locales' => 'array', // 配列であることを確認
        ]);

        // 1. Product 本体の作成
        $product = Product::create([
            'user_id' => auth()->id(),
            'slug' => Str::random(10),
            'estimated_price' => $request->estimated_price,
            'status' => 'published',
        ]);

        // 2. 画像のアップロード処理
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $index => $file) {
                $path = $file->store('products', 'public');
                $product->images()->create([
                    'image_url' => '/storage/' . $path,
                    'sort_order' => $index
                ]);
            }
        }

        // 3. 日本語データの保存
        $product->translations()->createMany([
            ['column_name' => 'title', 'locale' => 'ja', 'text' => $request->title],
            ['column_name' => 'description', 'locale' => 'ja', 'text' => $request->description],
        ]);

        // 4. 選択された各言語に対してAI翻訳を実行
        foreach ($request->target_locales as $locale) {
            $translationService->translateAndSave($product, 'title', $request->title, [$locale]);
            $translationService->translateAndSave($product, 'description', $request->description, [$locale]);
        }

        return redirect()->route('dashboard')->with('message', '作品画像と共に世界へ公開されました！');
    }

    /**
     * ファン向けの作品詳細ページ表示
     */
    public function show($slug)
    {
        $product = Product::where('slug', $slug)
            ->with(['images', 'translations' => function($q) {
                $q->where('locale', 'ja');
            }])
            ->withCount('fans as wants_count')
            ->firstOrFail();

        // ログイン中のファンがWant済みか
        $product->is_wanted = auth()->guard('fan')->check()
            ? $product->fans()->where('fan_id', auth()->guard('fan')->id())->exists()
            : false;

        // ★ この作品をWant!しているファンの国籍統計を取得
        $wantsByCountry = DB::table('wants')
            ->join('fans', 'wants.fan_id', '=', 'fans.id')
            ->where('wants.product_id', $product->id)
            ->select('fans.country_code', DB::raw('count(*) as count'))
            ->groupBy('fans.country_code')
            ->orderBy('count', 'desc')
            ->get();

        return Inertia::render('Products/Show', [
            'product' => $product,
            'wantsByCountry' => $wantsByCountry,
            'countries' => config('countries.list'),
        ]);
    }
}