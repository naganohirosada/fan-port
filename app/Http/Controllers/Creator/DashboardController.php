<?php

namespace App\Http\Controllers\Creator;

use App\Models\Product;
use App\Models\Reservation;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Controller;

class DashboardController extends Controller
{
    public function index()
    {
        $userId = auth()->id();
        $myProductIds = Product::where('user_id', $userId)->pluck('id');

        // configからマッピングを取得
        $alpha3Map = config('country.map_mapping');

        $geoStats = Reservation::whereIn('product_id', $myProductIds)
            ->join('fans', 'reservations.fan_id', '=', 'fans.id')
            ->select('fans.country_code', DB::raw('count(*) as count'))
            ->groupBy('fans.country_code')
            ->get()
            ->map(function($stat) use ($alpha3Map) {
                // 定数ファイルに定義があれば変換、なければそのまま（Alpha-2）を返す
                $stat->map_key = $alpha3Map[$stat->country_code] ?? $stat->country_code;
                return $stat;
            });
        // 3. 統計カード用の数値
        $totalWants = $geoStats->sum('count');
        return Inertia::render('Creator/Dashboard', [
            'stats' => [
                ['name' => '登録作品数', 'value' => (string)$myProductIds->count()],
                ['name' => '総 Wants!', 'value' => (string)$totalWants],
                ['name' => 'リーチした国', 'value' => (string)$geoStats->count()],
            ],
            'myProducts' => Product::where('user_id', $userId)
                ->with(['translations' => fn($q) => $q->where('locale', 'ja')])
                ->withCount('reservations')
                ->latest()
                ->get(),
            'geoStats' => $geoStats,
        ]);
    }
}