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
        Schema::create('group_order_participants', function (Blueprint $table) {
            $table->id();
            // 外部キー設定
            $table->foreignId('group_order_id')->constrained()->onDelete('cascade');
            $table->foreignId('fan_id')->constrained()->onDelete('cascade');

            // 個別のステータス管理
            $table->string('status')->default('ordered'); // ordered, warehouse, transit, delivered
            $table->string('payment_status')->default('unpaid'); // unpaid, partial, paid
            
            // 配送情報
            $table->string('tracking_number')->nullable(); // 国内配送の追跡番号
            $table->string('carrier_name')->nullable(); // USPS, FedEx, etc.

            // 注文内容（予備）
            $table->integer('quantity')->default(1);
            $table->decimal('total_amount', 10, 2)->default(0.00); // 支払額合計
            $table->text('internal_memo')->nullable(); // GOM(主催者)用のメモ

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('group_order_participants');
    }
};
