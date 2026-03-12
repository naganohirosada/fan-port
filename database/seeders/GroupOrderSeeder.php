<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class GroupOrderSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $product = \App\Models\Product::first(); // 既存の最初の商品に紐付け

        if ($product) {
            \App\Models\GroupOrder::create([
                'product_id' => $product->id,
                'region_name' => 'California, US',
                'country_code' => 'US',
                'max_members' => 20,
                'current_members' => 12,
                'shared_shipping_cost' => 1200,
                'status' => 'active',
            ]);

            \App\Models\GroupOrder::create([
                'product_id' => $product->id,
                'region_name' => 'Jakarta, ID',
                'country_code' => 'ID',
                'max_members' => 10,
                'current_members' => 8,
                'shared_shipping_cost' => 800,
                'status' => 'active',
            ]);
        }
    }
}
