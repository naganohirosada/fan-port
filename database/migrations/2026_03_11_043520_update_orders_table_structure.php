<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            // 1. カラムが存在する場合のみ削除する
            if (Schema::hasColumn('orders', 'address')) {
                $table->dropColumn('address');
            }
            if (Schema::hasColumn('orders', 'payment_method')) {
                $table->dropColumn('payment_method');
            }

            // 2. fan_address_id の追加（すでにある場合は飛ばす）
            if (!Schema::hasColumn('orders', 'fan_address_id')) {
                $table->foreignId('fan_address_id')
                    ->after('product_id')
                    ->constrained('fan_addresses')
                    ->onDelete('cascade');
            }
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            if (Schema::hasColumn('orders', 'fan_address_id')) {
                $table->dropForeign(['fan_address_id']);
                $table->dropColumn('fan_address_id');
            }
            
            // ロールバック時に念のため復活させる設定（必要に応じて）
            $table->text('address')->nullable();
            $table->string('payment_method')->nullable();
        });
    }
};
