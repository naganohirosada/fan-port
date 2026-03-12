<?php 

namespace App\Http\Controllers\Fan;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DirectOrderController extends Controller
{
    public function store(Request $request, Product $product)
    {
        // 1. バリデーション
        $request->validate([
            'quantity' => 'required|integer|min:1',
            'fan_address_id' => 'required|exists:fan_addresses,id',
            'payment_method_id' => 'required|integer',
            'payment_method_type' => 'required|string',
            'total' => 'required|numeric'
        ]);

        // 決済手段のモデルマッピング
        $methodMap = [
            'fan_credit_cards'   => \App\Models\FanCreditCard::class,
            'fan_paypal_accounts' => \App\Models\FanPaypalAccount::class,
            'fan_bnpl_accounts'   => \App\Models\FanBnplAccount::class,
            'fan_digital_wallets' => \App\Models\FanDigitalWallet::class,
        ];

        $fan = auth()->guard('fan')->user();
        $instrumentType = $methodMap[$request->payment_method_type] ?? null;

        if (!$instrumentType) {
            return back()->withErrors(['payment_method_type' => 'Invalid payment method.']);
        }

        // バックエンド側での再計算（セキュリティのため）
        $subtotal = $product->estimated_price * $request->quantity;
        $fee = floor($subtotal * 0.04); // 手数料4%
        $calculatedTotal = $subtotal + $fee;

        // 2. データベース保存（トランザクション開始）
        $order = DB::transaction(function () use ($fan, $product, $request, $instrumentType, $subtotal, $fee, $calculatedTotal) {
            // ① ordersテーブルに保存
            $order = Order::create([
                'fan_id'         => $fan->id,
                'product_id'     => $product->id,
                'fan_address_id' => $request->fan_address_id,
                'quantity'       => $request->quantity,
                'total_price'    => $calculatedTotal,
                'status'         => 'paid',
                'order_type'     => 'individual', // 直接購入
            ]);

            // ② paymentsテーブルに保存
            $payment = $order->payments()->create([
                'fan_id'                  => $fan->id,
                'payment_instrument_type' => $instrumentType,
                'payment_instrument_id'   => $request->payment_method_id,
                'total_amount'            => $calculatedTotal,
                'currency'                => 'JPY',
                'status'                  => 'paid',
            ]);

            // ③ payment_breakdownsテーブルに保存（内訳）
            // 商品代金の内訳
            $payment->breakdowns()->create([
                'type'        => 'item_price',
                'amount'      => $subtotal,
                'description' => "¥" . number_format($product->price) . " x {$request->quantity}",
            ]);

            // 手数料の内訳
            $payment->breakdowns()->create([
                'type'        => 'service_fee',
                'amount'      => $fee,
                'description' => "Processing fee (4%)",
            ]);

            return $order;
        });

        return redirect()->route('fans.dashboard', ['tab' => 'orders'])->with('message', 'Purchase completed! ✨');
    }
}