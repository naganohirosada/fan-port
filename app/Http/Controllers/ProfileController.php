<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateRequest;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Inertia\Response;
use App\Models\Country;
use Illuminate\Support\Facades\Hash;

class ProfileController extends Controller
{
    /**
     * Display the user's profile form.
     */
    public function edit(Request $request): Response
    {
        return Inertia::render('Profile/Edit', [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status' => session('status'),
        ]);
    }

    /**
     * Update the user's profile information.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $fan = auth()->guard('fan')->user();

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:fans,email,' . $fan->id,
            'country_code' => 'nullable|string|exists:countries,code',
            'bio' => 'nullable|string|max:1000',
            'password' => 'nullable|string|min:8',
            'thumbnail_image' => 'nullable|image|max:2048', // 2MB limit
        ]);

        // 画像の処理
        if ($request->hasFile('thumbnail_image')) {
            $path = $request->file('thumbnail_image')->store('thumbnails', 'public');
            $fan->thumbnail_url = asset('storage/' . $path);
        }

        // 基本情報の更新
        $fan->name = $validated['name'];
        $fan->email = $validated['email'];
        $fan->country_code = $validated['country_code'];
        $fan->bio = $validated['bio'];

        // パスワードが入力されている場合のみ更新
        if ($request->filled('password')) {
            $fan->password = Hash::make($validated['password']);
        }

        $fan->save();

        return redirect()->route('fans.dashboard', ['tab' => 'profile'])->with('message', 'Profile updated successfully! ✨');
    }

    /**
     * Delete the user's account.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return Redirect::to('/');
    }
}
