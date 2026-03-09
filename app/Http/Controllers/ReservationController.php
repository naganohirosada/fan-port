<?php

namespace App\Http\Controllers;

use App\Models\Reservation;
use App\Models\Fan;
use Illuminate\Http\Request;

class ReservationController extends Controller
{
    public function store(Request $request)
    {
        // テスト用に、ファンがいなければダミーの「海外ファン」を作成または取得
        $fan = Fan::firstOrCreate(
            ['email' => 'test-fan@example.com'],
            [
                'name' => 'Global Fan',
                'password' => bcrypt('password'),
                'country_code' => collect(['US', 'FR', 'GB', 'DE', 'TH'])->random(),
            ]
        );

        Reservation::create([
            'fan_id' => $fan->id,
            'product_id' => $request->product_id,
            'quantity' => 1,
            'ip_address' => $request->ip(),
        ]);

        return back();
    }
}