<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            // Orderとの紐付け
            $table->foreignId('order_id')->constrained()->onDelete('cascade');
            $table->foreignId('fan_id')->constrained()->onDelete('cascade');

            // どの決済手段を使ったか (ポリモーフィック)
            $table->string('payment_instrument_type'); // 例: App\Models\FanCreditCard
            $table->unsignedBigInteger('payment_instrument_id');

            $table->decimal('total_amount', 12, 2); // 合計請求額
            $table->string('currency', 3)->default('JPY');
            $table->string('status')->default('paid'); // pending, paid, failed
            $table->string('transaction_id')->nullable();
            
            $table->timestamps();

            // インデックス
            $table->index(['payment_instrument_type', 'payment_instrument_id'], 'instrument_index');
        });

        Schema::create('payment_breakdowns', function (Blueprint $table) {
            $table->id();
            $table->foreignId('payment_id')->constrained()->onDelete('cascade');

            // 内訳のタイプ
            // item_price(商品代), service_fee(システム手数料), intl_shipping(国際送料), local_shipping(国内送料)
            $table->string('type'); 
            
            $table->decimal('amount', 12, 2); // その項目の金額
            $table->string('description')->nullable(); // 補足（例: "Quantity: 2" など）

            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('payments');
    }
};