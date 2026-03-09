<?php

namespace App\Http\Controllers\Creator\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use App\Providers\RouteServiceProvider;

class LoginController extends Controller
{
    public function create()
    {
        return Inertia::render('Creator/Auth/Login');
    }

    public function store(Request $request)
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required'],
        ]);

        // クリエイター（通常のUserモデルと想定）としてログイン
        if (Auth::guard('web')->attempt($credentials, $request->remember)) {
            $request->session()->regenerate();

            // ログイン後はクリエイターダッシュボードへ
            return redirect()->intended(route('creator.dashboard'));
        }

        return back()->withErrors([
            'email' => '認証情報が記録と一致しません。',
        ])->onlyInput('email');
    }

    public function destroy(Request $request)
    {
        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('creator.login');
    }
}