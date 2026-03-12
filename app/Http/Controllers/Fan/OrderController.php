<?php

namespace App\Http\Controllers\Fan;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Order;
use Illuminate\Support\Facades\Auth;

class OrderController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|integer|min:1',
            'address' => 'required|string',
            'payment_method' => 'required|string',
        ]);

        $order = Order::create([
            'fan_id' => Auth::guard('fan')->id(),
            'product_id' => $validated['product_id'],
            'quantity' => $validated['quantity'],
            'address' => $validated['address'],
            'payment_method' => $validated['payment_method'],
            'status' => 'pending_payment', // 決済前ステータス
            'order_type' => 'individual', // GOではなく個別注文
        ]);

        return redirect()->route('fan.dashboard')->with('success', 'Order created! Proceeding to payment.');
    }
}
