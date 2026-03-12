<?php

namespace App\Http\Controllers\Fan;

use App\Http\Controllers\Controller;
use App\Models\GroupOrder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use App\Models\Payment;
use App\Models\Order;

class GroupOrderController extends Controller
{
    public function show($id)
    {
        $fan = auth()->guard('fan')->user();
        $locale = app()->getLocale();
        
        // 1. グループ情報を取得
        $group = \App\Models\GroupOrder::with([
                'participants',
                'product.translations', 
                'product.images', 
                'updates' => fn($q) => $q->latest()
            ])
            ->findOrFail($id);

        // 2. 自分自身の参加情報（中間テーブル）を取得
        $myParticipation = $fan->groupOrders()
            ->where('group_order_id', $id)
            ->firstOrFail();

        // 3. 🔥 【プロジェクト全体】の統計を計算
        $allOrders = \App\Models\Order::where('group_order_id', $id)->get();
        $projectTotalQuantity = $allOrders->sum('quantity');
        $projectTotalAmount = $allOrders->sum('total_price');

        // 4. 🔥 【ログインユーザー個人】の統計を計算（複数注文対応）
        $myOrders = $allOrders->where('fan_id', $fan->id);
        $myTotalQuantity = $myOrders->sum('quantity');
        $myTotalPaid = $myOrders->sum('total_price');

        // 5. 主催者の特定
        $organizer = $group->participants()
            ->wherePivot('role', 'organizer')
            ->first();

        // 6. 主催者用リスト（省略：前述のロジックと同じ）
        $participantList = [];
        if ($myParticipation->pivot->role === 'organizer') {
            // ...（リスト取得ロジック）
        }

        // 商品タイトル
        $productTitle = $group->product->translations
            ->where('locale', $locale)->where('column_name', 'title')->first()?->text 
            ?? $group->product->translations->where('locale', 'ja')->where('column_name', 'title')->first()?->text;

        $progressMap = ['ordered' => 25, 'warehouse' => 50, 'transit' => 75, 'delivered' => 100];

        // 決済明細のマスター計算
        $unitPrice = (int)$myParticipation->product->price;
        $shippingShared = (int)$myParticipation->shared_shipping_cost; 
        $itemTotal = $unitPrice * $myTotalQuantity; // 自分の合計個数ベース
        $subtotal = $itemTotal + $shippingShared;
        $fee = floor($subtotal * 0.04);
        $finalTotal = $subtotal + $fee;

        return Inertia::render('Fan/GroupOrder/Show', [
            'order' => [
                'id' => $group->id,
                'group_name' => $group->region_name,
                'product_title' => $productTitle,
                'thumbnail' => $group->product->images->where('sort_order', 0)->first()?->image_url,
                'gom' => [
                    'name' => $organizer?->name ?? 'Organizer',
                    'avatar' => $organizer?->thumbnail_url ?? '/images/default-avatar.png',
                ],
                'details' => [
                    'status' => $myParticipation->pivot->status,
                    'payment_status' => $myParticipation->pivot->payment_status,
                    'tracking_number' => $myParticipation->pivot->tracking_number,
                    'role' => $myParticipation->pivot->role,
                    'progress' => $progressMap[$myParticipation->pivot->status] ?? 10,
                    // --- 🛠️ ここを修正：計算した変数を割り当て ---
                    'my_quantity' => $myTotalQuantity,
                    'my_paid_amount' => $myTotalPaid,
                ],
                // 💰 プロジェクト全体の統計
                'project_stats' => [
                    'total_quantity' => $projectTotalQuantity,
                    'total_amount' => $projectTotalAmount,
                    'member_count' => $group->participants->count(),
                ],
                'participant_list' => $participantList,
                'price_breakdown' => [
                    'unit_price' => $unitPrice,
                    'quantity' => $myTotalQuantity,
                    'item' => $itemTotal,
                    'shipping_shared' => $shippingShared,
                    'service_fee' => $fee,
                    'total' => $finalTotal,
                ],
                'updates' => $group->updates->map(fn($u) => [
                    'id' => $u->id,
                    'title' => $u->title,
                    'content' => $u->content,
                    'date' => $u->created_at->format('M d, Y'),
                    'status_tag' => $u->status_tag,
                ])
            ]
        ]);
    }

    public function join(Request $request, $id)
    {
        $groupOrder = GroupOrder::findOrFail($id);
        $fan = auth()->guard('fan')->user();
        $product = $groupOrder->product;

        // バリデーション
        $request->validate([
            'quantity' => 'required|integer|min:1',
            'fan_address_id' => 'required|exists:fan_addresses,id',
            'payment_method_id' => 'required|integer',
            'payment_method_type' => 'required|string',
        ]);

        // 金額マッピング（テーブル名 -> モデル名）
        $methodMap = [
            'fan_credit_cards' => \App\Models\FanCreditCard::class,
            'fan_paypal_accounts' => \App\Models\FanPaypalAccount::class,
            'fan_bnpl_accounts' => \App\Models\FanBnplAccount::class,
            'fan_digital_wallets' => \App\Models\FanDigitalWallet::class,
        ];

        $instrumentType = $methodMap[$request->payment_method_type];

        // 金額計算
        $subtotal = $product->price * $request->quantity;
        $shipping = $groupOrder->shared_shipping_cost; // GOの按分送料
        $fee = floor(($subtotal + $shipping) * 0.04);
        $total = $subtotal + $shipping + $fee;

        DB::transaction(function () use ($request, $fan, $groupOrder, $product, $instrumentType, $subtotal, $shipping, $fee, $total) {
            // ① 中間テーブル (group_order_participants) への登録
            // スクリーンショットの構造に合わせます
            $groupOrder->participants()->attach($fan->id, [
                'role' => 'participant',
                'status' => 'ordered',
                'payment_status' => 'paid',
                'quantity' => $request->quantity,
                'total_amount' => $total, // 手数料込みの総額
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            // ② orders テーブルへの登録 (個別注文と混ぜて管理)
            // order_type を 'group' にして差別化
            $order = Order::create([
                'fan_id' => $fan->id,
                'product_id' => $product->id,
                'fan_address_id' => $request->fan_address_id,
                'quantity' => $request->quantity,
                'group_order_id' => $groupOrder->id,
                'total_price' => $total,
                'status' => 'paid',
                'order_type' => 'group', // ここで「group」を指定！
            ]);

            // ③ payments テーブルへの登録
            $payment = $order->payments()->create([
                'fan_id' => $fan->id,
                'payment_instrument_type' => $instrumentType,
                'payment_instrument_id' => $request->payment_method_id,
                'total_amount' => $total,
                'currency' => 'JPY',
                'status' => 'paid',
            ]);

            // ④ payment_breakdowns テーブルへの登録
            $payment->breakdowns()->createMany([
                ['type' => 'item_price', 'amount' => $subtotal, 'description' => "Item Price x {$request->quantity}"],
                ['type' => 'intl_shipping', 'amount' => $shipping, 'description' => "GO Shared Shipping"],
                ['type' => 'service_fee', 'amount' => $fee, 'description' => "Processing Fee (4%)"],
            ]);

            // グループの現在の人数を更新
            $groupOrder->increment('current_members');
        });

        return back()->with('message', 'Successfully joined the Group Order! 🚢');
    }

    public function leave(Request $request, $id)
    {
        $groupOrder = GroupOrder::findOrFail($id);
        
        // カウントを減らす（最小0）
        if ($groupOrder->current_members > 0) {
            $groupOrder->decrement('current_members');
        }

        // ステータスを戻す（必要なら）
        if ($groupOrder->current_members < $groupOrder->max_members) {
            $groupOrder->update(['status' => 'active']);
        }

        return back()->with('success', "Left the {$groupOrder->region_name} group.");
    }

    public function store(Request $request)
    {
        $fan = auth()->guard('fan')->user();

        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'region_name' => 'required|string|max:255',
            'country_code' => 'required|string|size:2',
            'max_members' => 'required|integer|min:2|max:50',
        ]);

        // プロトタイプ用の暫定計算: 本来は配送ロジックに基づきます
        $sharedCost = 1500; // 仮の固定シェア送料

        $groupOrder = GroupOrder::create([
            'product_id' => $validated['product_id'],
            'region_name' => $validated['region_name'],
            'country_code' => $validated['country_code'],
            'max_members' => $validated['max_members'],
            'current_members' => 1, // 作成者は自動的に参加
            'shared_shipping_cost' => $sharedCost,
            'status' => 'active',
        ]);

        // 2. 作成した本人を「主催者(organizer)」として参加者テーブルに登録
        $groupOrder->participants()->attach($fan->id, [
            'role' => 'organizer',
            'status' => 'ordered',     // 主催者は当然注文済み
            'payment_status' => 'paid', // 主催者の支払いは管理不要（または決済済み扱い）
            'quantity' => 1,            // 自分の分も1つ確保する場合
        ]);

        return back()->with('success', 'Your group is live! Invite others to join! 🚀');
    }

    // タイムライン投稿
    public function storeUpdate(Request $request, $id)
    {
        $group = GroupOrder::findOrFail($id);
        $fan = auth()->guard('fan')->user();

        // 主催者チェック
        $isOrganizer = $group->participants()
            ->where('fan_id', $fan->id)
            ->wherePivot('role', 'organizer')
            ->exists();

        if (!$isOrganizer) abort(403);

        $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
        ]);

        $group->updates()->create([
            'title' => $request->title,
            'content' => $request->content,
            'status_tag' => $group->participants()->where('fan_id', $fan->id)->first()->pivot->status,
        ]);

        return back()->with('message', 'Update posted!');
    }

    // ステータス一括更新
    public function updateStatus(Request $request, $id)
    {
        $group = GroupOrder::findOrFail($id);
        $fan = auth()->guard('fan')->user();

        $isOrganizer = $group->participants()
            ->where('fan_id', $fan->id)
            ->wherePivot('role', 'organizer')
            ->exists();

        if (!$isOrganizer) abort(403);

        $request->validate(['status' => 'required|in:ordered,warehouse,transit,delivered']);

        // 参加者全員のステータスを一括更新！
        $group->participants()->updateExistingPivot(
            $group->participants->pluck('id'), 
            ['status' => $request->status]
        );

        return back()->with('message', "Status updated to {$request->status}!");
    }
}