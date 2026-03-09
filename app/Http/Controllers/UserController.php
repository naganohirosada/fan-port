<?php 

namespace App\Http\Controllers;
use App\Models\User;
use Inertia\Inertia;


class UserController extends Controller
{
    public function create()
    {
        return Inertia::render('Products/Create');
    }

    public function show($id)
    {
        // ユーザーと、そのユーザーに紐づく作品（画像、翻訳、予約数）を取得
        $creator = User::with([
            'products.images', 
            'products.translations' => function($query) {
                $query->where('locale', 'ja'); // 一覧では日本語（オリジナル）を表示
            }
        ])->withCount('products')->findOrFail($id);

        return Inertia::render('Creator/Portfolio', [
            'creator' => $creator,
            'products' => $creator->products,
        ]);
    }
}