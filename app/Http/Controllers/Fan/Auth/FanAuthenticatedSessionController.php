<?php

namespace App\Http\Controllers\Fan\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class FanAuthenticatedSessionController extends Controller
{
    public function create()
    {
        return Inertia::render('Fan/Auth/Login'); // 前に作ったファンのログイン画面
    }

    public function store(Request $request)
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required'],
        ]);

        if (Auth::guard('fan')->attempt($credentials, $request->remember)) {
            $request->session()->regenerate();

            return redirect()->intended(route('fans.dashboard'));
        }

        return back()->withErrors([
            'email' => 'The provided credentials do not match our records.',
        ])->onlyInput('email');
    }

    public function destroy(Request $request)
    {
        Auth::guard('fan')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}