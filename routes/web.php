<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ReservationController;
use App\Http\Controllers\UserController;
use App\Models\Product;
use App\Models\Reservation;
use App\Http\Controllers\Creator\DashboardController as CreatorDashboardController;
use App\Http\Controllers\Creator\Auth\LoginController as CreatorLoginController;
use App\Http\Controllers\Creator\Auth\RegisteredUserController as CreatorRegisteredUserController;
use App\Http\Controllers\Fan\Auth\RegisteredFansController as RegisteredFansController;
use App\Http\Controllers\Fan\Auth\FanAuthenticatedSessionController as FanAuthenticatedSessionController;
use App\Http\Controllers\WantController;
use App\Http\Controllers\WelcomeController;

// クリエイター認証用（既存のAuthとは別に管理する場合）
Route::prefix('creator')->name('creator.')->group(function () {
    Route::middleware('guest:web')->group(function () {
        Route::get('/register', [CreatorRegisteredUserController::class, 'create'])->name('register');
        Route::post('/register', [CreatorRegisteredUserController::class, 'store']);

        Route::get('/login', [CreatorLoginController::class, 'create'])->name('login');
        Route::post('/login', [CreatorLoginController::class, 'store']);
    });

    // クリエイター認証済みのみ
    Route::middleware('auth:web')->group(function () {
        Route::get('/dashboard', [CreatorDashboardController::class, 'index'])->name('dashboard');
        Route::post('/logout', [CreatorLoginController::class, 'destroy'])->name('logout');
        Route::get('/products/create', [ProductController::class, 'create'])->name('products.create');
        Route::post('/products', [ProductController::class, 'store'])->name('products.store');
        Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
        Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
        Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    });
});

// --- ファン用 ---
Route::prefix('fans')->name('fans.')->group(function () {
    Route::get('register', [RegisteredFansController::class, 'create'])->name('register');
    Route::post('register', [RegisteredFansController::class, 'store']);
    
    // ログイン
    Route::get('login', [FanAuthenticatedSessionController::class, 'create'])->name('login');
    Route::post('login', [FanAuthenticatedSessionController::class, 'store']);
    // ログアウト
    Route::post('logout', [FanAuthenticatedSessionController::class, 'destroy'])->name('logout');
    Route::post('/products/{product}/want', [WantController::class, 'store'])->name('products.want');

    Route::get('/dashboard', [App\Http\Controllers\Fan\DashboardController::class, 'index'])->name('dashboard')->middleware('auth:fan');
});

Route::get('/', WelcomeController::class)->name('welcome');


// 予約送信
Route::post('/reservations', [ReservationController::class, 'store'])->name('reservations.store');

// 作品詳細（誰でも見れる）
Route::get('/p/{slug}', [ProductController::class, 'show'])->name('products.show');

// クリエイターポートフォリオ用（ログイン不要で誰でも見れるページ）
Route::get('/creator/{id}', [UserController::class, 'show'])->name('creator.portfolio');
