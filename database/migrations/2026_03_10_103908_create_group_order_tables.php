<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        // 支払管理
        Schema::create('fan_group_order_payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('participant_id')->constrained('group_order_participants')->onDelete('cascade');
            $table->decimal('amount', 10, 2);
            $table->string('payment_type'); // item, intl_shipping, local_shipping, tax
            $table->string('status')->default('pending'); // pending, paid, refunded
            $table->timestamps();
        });

        // タイムライン/進捗報告
        Schema::create('group_order_updates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('group_order_id')->constrained()->onDelete('cascade');
            $table->string('title');
            $table->text('content');
            $table->string('status_tag')->nullable(); // 進捗バーを動かすトリガー
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('group_order_tables');
    }
};
