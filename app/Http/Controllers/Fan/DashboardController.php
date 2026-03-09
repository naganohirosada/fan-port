<?php

namespace App\Http\Controllers\Fan;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index()
    {
        $fan = Auth::guard('fan')->user();

        $wantedProducts = $fan->wantedProducts()
            ->with(['images', 'translations' => function($q) { $q->where('locale', 'ja'); }])
            ->withCount('fans as wants_count')
            ->latest('wants.created_at')
            ->get();

        $dashboardStats = [
            ['name' => 'Total Wants', 'value' => $wantedProducts->count()],
            ['name' => 'Collection Val.', 'value' => '¥' . number_format($wantedProducts->sum('estimated_price'))],
            ['name' => 'Support Rank', 'value' => $this->calculateFanRank($wantedProducts->count())],
        ];

        return Inertia::render('Fan/Dashboard', [
            'products' => $wantedProducts,
            'stats' => $dashboardStats,
            'fanStats' => [
                'rank' => $this->calculateFanRank($wantedProducts->count()),
            ],
        ]);
    }

    private function calculateFanRank($count) {
        if ($count >= 50) return 'Legendary Otaku';
        if ($count >= 20) return 'Elite Supporter';
        return 'Rising Fan';
    }
}