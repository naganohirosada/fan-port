<?php

namespace App\Http\Controllers\Fan\Auth;

use App\Http\Controllers\Controller;
use App\Models\Fan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;

class RegisteredFansController extends Controller
{
    public function create()
    {
        return Inertia::render('Fan/Auth/FansRegister'); // 前に作ったファンの登録画面
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:fans',
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'country_code' => 'required|string|max:2',
            'avatar' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
        ]);

        if ($request->hasFile('avatar')) {
            // storage/app/public/fans に保存
            $path = $request->file('avatar')->store('fans', 'public');
            // ブラウザからアクセス可能なURLに変換 (/storage/fans/xxx.jpg)
            $thumbnailUrl = \Illuminate\Support\Facades\Storage::url($path);
        } else {
            // 画像がない場合は従来通りダイスベアの生成画像を使う
            $thumbnailUrl = 'https://api.dicebear.com/7.x/avataaars/svg?seed=' . $request->name;
        }

        $fan = Fan::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'country_code' => $request->country_code,
            'thumbnail_url' => $thumbnailUrl,
        ]);

        Auth::guard('fan')->login($fan);

        return redirect()->route('fans.dashboard');
    }
}