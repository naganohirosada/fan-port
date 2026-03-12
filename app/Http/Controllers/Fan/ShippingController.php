<?php

namespace App\Http\Controllers\Fan;

use App\Http\Controllers\Controller;
use App\Models\FanAddress;
use App\Models\Country;
use App\Models\Region; // Regionをインポート
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class ShippingController extends Controller
{
    /**
     * 配送先の新規保存
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'country_id'   => 'required|exists:countries,id',
            'region_id'    => 'required|exists:regions,id',
            'zip_code'     => 'required|string|max:20',
            'address1'     => 'required|string|max:255',
            'address2'     => 'nullable|string|max:255',
            'phone_number' => 'nullable|string|max:20',
        ]);

        $fan = Auth::guard('fan')->user();

        $fan->addresses()->create(array_merge($validated, [
            'is_default' => $fan->addresses()->count() === 0
        ]));

        return redirect()->route('fans.dashboard', ['tab' => 'shipping'])
        ->with('message', 'New address added! 📦');
    }

    public function update(Request $request, FanAddress $address)
    {
        if ($address->fan_id !== Auth::guard('fan')->id()) abort(403);

        $validated = $request->validate([
            'country_id'   => 'required|exists:countries,id',
            'region_id'    => 'required|exists:regions,id',
            'zip_code'     => 'required|string|max:20',
            'address1'     => 'required|string|max:255',
            'address2'     => 'nullable|string|max:255',
            'phone_number' => 'nullable|string|max:20',
        ]);

        $address->update($validated);

        return redirect()->route('fans.dashboard', ['tab' => 'shipping'])
        ->with('message', 'Address updated! ✨');
    }

    /**
     * 配送先の削除
     */
    public function destroy(FanAddress $address)
    {
        if ($address->fan_id !== Auth::guard('fan')->id()) {
            abort(403);
        }

        $address->delete();

        return back()->with('success', 'Address removed.');
    }

    public function setDefault(FanAddress $address)
    {
        // 所有者チェック
        if ($address->fan_id !== Auth::guard('fan')->id()) {
            abort(403);
        }

        // トランザクションで一気に更新（安全のため）
        DB::transaction(function () use ($address) {
            // 1. 全ての住所のデフォルトフラグを落とす
            FanAddress::where('fan_id', $address->fan_id)
                ->update(['is_default' => false]);

            // 2. 指定した住所だけデフォルトにする
            $address->update(['is_default' => true]);
        });

        return redirect()->route('fans.dashboard', ['tab' => 'shipping'])
        ->with('message', 'Primary address updated! ✅');
    }
}