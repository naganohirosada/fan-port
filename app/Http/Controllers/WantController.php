<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class WantController extends Controller
{
    /**
     * Want! の登録・解除を切り替える
     */
    public function store(Product $product)
    {
        // 1. ログイン中の「ファン」を取得
        $fan = Auth::guard('fan')->user();

        // 2. toggleメソッドで、既にあれば削除、なければ追加する
        // Fanモデルに wantedProducts() リレーションがある前提です
        $fan->wantedProducts()->toggle($product->id);

        // 3. 元のページにリダイレクト（Inertiaが差分だけを更新してくれます）
        return back();
    }
}