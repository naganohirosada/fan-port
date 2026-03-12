<?php

namespace App\Http\Controllers\Fan;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\FanPaypalAccount;
use App\Models\FanCreditCard;
use App\Models\FanDigitalWallet;
use App\Models\FanBnplAccount;
use Illuminate\Support\Str;
use Stripe\Stripe;
use Stripe\SetupIntent;
use Stripe\Customer;

class PaymentController extends Controller
{
    public function createSetupIntent(Request $request)
    {
        $fan = Auth::guard('fan')->user();

        // 1. Stripe APIキーをセット
        // Stripe::setApiKey(config('cashier.secret') ?? env('STRIPE_SECRET'));

        // // 2. Stripe Customer ID がない場合は作成（重要！）
        // if (!$fan->stripe_id) {
        //     $customer = Customer::create([
        //         'email' => $fan->email,
        //         'name'  => $fan->name,
        //         'metadata' => ['fan_id' => $fan->id]
        //     ]);
        //     $fan->update(['stripe_id' => $customer->id]);
        // }

        // // 3. SetupIntent を作成
        // // 北米向けの決済方法をここで許可します
        // $intent = SetupIntent::create([
        //     'customer' => $fan->stripe_id,
        //     'payment_method_types' => [
        //         'card', 
        //         'paypal', 
        //         'cashapp', 
        //         'klarna'
        //     ],
        //     'usage' => 'off_session', // 将来的な自動決済（サブスク等）を可能にする設定
        // ]);
        // return response()->json([
        //     'client_secret' => $intent->client_secret
        // ]);

        return response()->json([
            'client_secret' => 'seti_dummy_secret_' . bin2hex(random_bytes(16))
        ]);
    }

    // app/Http/Controllers/Fan/PaymentController.php

    public function storeMock(Request $request)
    {
        $fan = auth()->guard('fan')->user();
        $type = $request->type;

        // デフォルト設定をリセット（全テーブル分）
        $fan->creditCards()->update(['is_default' => false]);
        $fan->paypalAccounts()->update(['is_default' => false]);
        $fan->digitalWallets()->update(['is_default' => false]);
        $fan->bnplAccounts()->update(['is_default' => false]);

        switch ($type) {
            case 'card':
                $fan->creditCards()->create([
                    'stripe_pm_id' => 'pm_mock_card_' . Str::random(5),
                    'brand' => $request->brand, 'last4' => '4242', 'exp_month' => 12, 'exp_year' => 2028, 'is_default' => true
                ]);
                break;
            case 'paypal':
                $fan->paypalAccounts()->create([
                    'paypal_email' => $request->email,
                    'is_default' => true,
                    'paypal_payer_id' => 'paypal_mock_' . Str::random(5)
                ]);
                break;
            case 'wallet':
                $fan->digitalWallets()->create([
                    'type' => $request->wallet_device, // apple_pay or google_pay
                    'stripe_pm_id' => 'pm_mock_wallet_' . Str::random(5),
                    'account_identifier' => $request->wallet_device === 'apple_pay' ? 'My iPhone' : 'Chrome Wallet',
                    'is_default' => true
                ]);
                break;
            case 'cashapp':
                $fan->digitalWallets()->create([
                    'type' => 'cash_app',
                    'stripe_pm_id' => 'pm_mock_cashapp_' . Str::random(5),
                    'account_identifier' => '$' . $request->cashtag,
                    'is_default' => true
                ]);
                break;
            case 'bnpl':
                $fan->bnplAccounts()->create([
                    'provider' => 'klarna', // Affirmなども同様に
                    'external_id' => $request->email,
                    'is_default' => true
                ]);
                break;
        }

        return redirect()->route('fans.dashboard', ['tab' => 'payments'])->with('message', 'Payment method added successfully!');
    }

    public function setDefault(Request $request)
    {
        $fan = auth()->guard('fan')->user();
        $id = $request->id;
        $type = $request->type; // 'card', 'paypal', 'wallet', 'bnpl'

        // 1. 全てのテーブルのデフォルト設定を一斉解除
        FanCreditCard::where('fan_id', $fan->id)->update(['is_default' => false]);
        FanPaypalAccount::where('fan_id', $fan->id)->update(['is_default' => false]);
        FanDigitalWallet::where('fan_id', $fan->id)->update(['is_default' => false]);
        FanBnplAccount::where('fan_id', $fan->id)->update(['is_default' => false]);

        // 2. 指定された決済手段をデフォルトに設定
        switch ($type) {
            case 'card':
                FanCreditCard::where('id', $id)->where('fan_id', $fan->id)->update(['is_default' => true]);
                break;
            case 'paypal':
                FanPaypalAccount::where('id', $id)->where('fan_id', $fan->id)->update(['is_default' => true]);
                break;
            case 'wallet':
                FanDigitalWallet::where('id', $id)->where('fan_id', $fan->id)->update(['is_default' => true]);
                break;
            case 'bnpl':
                FanBnplAccount::where('id', $id)->where('fan_id', $fan->id)->update(['is_default' => true]);
                break;
        }

        return redirect()->back()->with('message', 'Primary payment method updated!');
    }

    public function process(Request $request, $group_order_id)
    {
        $request->validate([
            'quantity' => 'required|integer|min:1',
            'payment_method' => 'required|string',
            'total' => 'required|numeric'
        ]);

        $fan = auth()->guard('fan')->user();
        $groupOrder = $fan->groupOrders()->findOrFail($group_order_id);

        DB::transaction(function () use ($groupOrder, $request) {
            // 1. 中間テーブルを更新（注文個数を反映させるために pivot に quantity カラムがあると良い）
            $groupOrder->pivot->update([
                'payment_status' => 'paid',
                'status' => 'ordered',
                // 'quantity' => $request->quantity, // もしあれば
            ]);

            // 2. 支払詳細を記録
            $groupOrder->payments()->create([
                'participant_id' => $groupOrder->pivot->id,
                'amount' => $request->total,
                'payment_type' => 'item_price',
                'payment_method' => $request->payment_method, // stripe / paypal
                'status' => 'paid',
                'metadata' => json_encode([
                    'quantity' => $request->quantity,
                    'fee' => $request->fee,
                    'subtotal' => $request->subtotal
                ])
            ]);
        });

        return back()->with('message', 'Thank you! Your order for ' . $request->quantity . ' item(s) is confirmed.');
    }
}