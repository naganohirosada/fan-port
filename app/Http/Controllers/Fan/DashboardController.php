<?php

namespace App\Http\Controllers\Fan;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
use App\Models\Country;
use Illuminate\Support\Facades\Storage;

class DashboardController extends Controller
{
    public function index()
    {
        $fan = Auth::guard('fan')->user();
        $locale = app()->getLocale();

        // 1. Wanted Products (集計用 & リスト用)
        $wantedProducts = $fan->wantedProducts()
            ->with([
                'images' => fn($q) => $q->where('sort_order', 0),
                'translations' => fn($q) => $q->where('locale', $locale)->orWhere('locale', 'ja')
            ])
            ->withCount('fans as wants_count')
            ->latest('wants.created_at')
            ->get();

        // フロント用のwantsデータ整形
        $wantsFormatted = $wantedProducts->map(function ($product) use ($locale) {
            return [
                'id' => $product->id,
                'title' => $product->translations->where('locale', $locale)->where('column_name', 'title')->first()?->text 
                        ?? $product->translations->where('locale', 'ja')->where('column_name', 'title')->first()?->text,
                'price' => $product->price,
                'thumbnail' => $product->images->first()?->image_url,
                'category' => $product->category_id,
            ];
        });

        // 2. Dashboard Stats
        $dashboardStats = [
            ['name' => 'Total Wants', 'value' => $wantedProducts->count()],
            ['name' => 'Collection Val.', 'value' => '¥' . number_format($wantedProducts->sum('price'))],
            ['name' => 'Support Rank', 'value' => $this->calculateFanRank($wantedProducts->count())],
        ];

        // 3. Payment Methods (統合)
        $paymentMethods = collect([])
            ->concat($fan->creditCards->map(fn($item) => [...$item->toArray(), 'm_type' => 'card', 'table' => 'fan_credit_cards']))
            ->concat($fan->paypalAccounts->map(fn($item) => [...$item->toArray(), 'm_type' => 'paypal', 'table' => 'fan_paypal_accounts']))
            ->concat($fan->digitalWallets->map(fn($item) => [...$item->toArray(), 'm_type' => 'wallet', 'table' => 'fan_digital_wallets']))
            ->concat($fan->bnplAccounts->map(fn($item) => [...$item->toArray(), 'm_type' => 'bnpl', 'table' => 'fan_bnpl_accounts']))
            ->sortByDesc('is_default')
            ->values(); // インデックスを振り直し

        // 4. Group Orders (共同購入)
        $activeGroups = $fan->groupOrders()
            ->with(['gom', 'product.translations', 'product.images'])
            ->get()
            ->map(function ($group) use ($locale) {
                $progressMap = ['ordered' => 25, 'warehouse' => 50, 'transit' => 75, 'delivered' => 100];
                return [
                    'id'              => $group->id,
                    'group_name'      => $group->region_name,
                    'product_title'   => $group->product->translations->where('locale', $locale)->where('column_name', 'title')->first()?->text 
                                        ?? $group->product->translations->where('locale', 'ja')->where('column_name', 'title')->first()?->text,
                    'thumbnail'       => $group->product->images->where('sort_order', 0)->first()?->image_url,
                    'gom_name'        => $group->gom->name ?? 'Unknown',
                    'role'            => $group->pivot->role,
                    'status'          => $group->pivot->status,
                    'payment_status'  => $group->pivot->payment_status,
                    'tracking_number' => $group->pivot->tracking_number,
                    'progress'        => $progressMap[$group->pivot->status] ?? 10,
                    'participants_count' => $group->pivot->role === 'organizer' ? $group->participants()->count() : null,
                ];
            });

        // 5. Direct Orders (直接注文)
        $orders = $fan->orders()
            ->with(['product.translations', 'product.images', 'payments'])
            ->latest()
            ->get()
            ->map(function ($order) use ($locale) {
                return [
                    'id'              => $order->id,
                    'group_order_id'  => $order->group_order_id,
                    'product_name'    => $order->product->translations->where('locale', $locale)->where('column_name', 'title')->first()?->text 
                                        ?? $order->product->translations->where('locale', 'ja')->where('column_name', 'title')->first()?->text,
                    'thumbnail'       => $order->product->images->where('sort_order', 0)->first()?->image_url,
                    'quantity'        => $order->quantity,
                    'total_price'     => $order->total_price,
                    'status'          => $order->status,
                    'order_type'      => $order->order_type,
                    'tracking_number' => $order->tracking_number,
                    'created_at'      => $order->created_at->format('M d, Y'),
                    'payment_status'  => $order->payments->first()?->status ?? 'pending',
                    'breakdowns'      => $order->payments->first()?->breakdowns ?? [],
                ];
            });
        return Inertia::render('Fan/Dashboard', [
            'auth' => [
                'fan' => $fan->load(['addresses.country', 'addresses.region']) 
            ],
            'fanStats' => [
                'rank' => $this->calculateFanRank($wantedProducts->count()),
            ],
            'wants' => $wantsFormatted,
            'activeGroups' => $activeGroups,
            'paymentMethods' => $paymentMethods,
            'countries' => Country::with('regions')->get(),
            'stats' => $dashboardStats,
            'orders' => $orders, // 整形したデータを渡す
        ]);
    }

    private function calculateProgress($status) {
        $map = ['ordered' => 25, 'warehouse' => 50, 'transit' => 75, 'delivered' => 100];
        return $map[$status] ?? 0;
    }

    private function calculateFanRank($count) {
        if ($count >= 50) return 'Legendary Otaku';
        if ($count >= 20) return 'Elite Supporter';
        return 'Rising Fan';
    }

    public function updateProfile(Request $request)
    {
        $fan = Auth::guard('fan')->user();

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:fans,email,' . $fan->id,
            'country_code' => 'nullable|string|size:2',
            'bio' => 'nullable|string|max:1000',
            'thumbnail_image' => 'nullable|image|max:2048', // 2MBまで
        ]);

        // 画像のアップロード処理
        if ($request->hasFile('thumbnail_image')) {
            // 古い画像を消す（任意）
            if ($fan->thumbnail_url) {
                Storage::disk('public')->delete(str_replace('/storage/', '', $fan->thumbnail_url));
            }
            
            $path = $request->file('thumbnail_image')->store('thumbnails', 'public');
            $validated['thumbnail_url'] = Storage::url($path);
        }

        $fan->update($validated);

        return back()->with('success', 'Profile updated!');
    }
}