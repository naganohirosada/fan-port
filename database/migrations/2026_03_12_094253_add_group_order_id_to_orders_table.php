<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            // group_ordersテーブルへの外部キーを追加
            // 直接注文(individual)の場合はNULLを許容する
            $table->foreignId('group_order_id')
                ->after('product_id') // product_idの後ろに配置（見やすさのため）
                ->nullable()
                ->constrained('group_orders')
                ->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            // 外部キー制約を削除してからカラムを削除
            $table->dropForeign(['group_order_id']);
            $table->dropColumn('group_order_id');
        });
    }
};