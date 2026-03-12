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
        // 1. クレジットカード情報 (Stripe連携前提)
        Schema::create('fan_credit_cards', function (Blueprint $table) {
            $table->id();
            $table->foreignId('fan_id')->constrained()->onDelete('cascade');
            $table->string('stripe_pm_id')->unique(); // pm_xxx
            $table->string('brand');                 // Visa, Mastercard, Discover...
            $table->string('last4', 4);
            $table->integer('exp_month');
            $table->integer('exp_year');
            $table->boolean('is_default')->default(false);
            $table->timestamps();
        });

        // 2. PayPal アカウント情報
        Schema::create('fan_paypal_accounts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('fan_id')->constrained()->onDelete('cascade');
            $table->string('paypal_email');
            $table->string('paypal_payer_id')->nullable(); // PayPal側の一意識別子
            $table->boolean('is_default')->default(false);
            $table->timestamps();
        });

        // 3. デジタルウォレット (Apple Pay, Google Pay, Cash App Pay)
        Schema::create('fan_digital_wallets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('fan_id')->constrained()->onDelete('cascade');
            $table->enum('type', ['apple_pay', 'google_pay', 'cash_app']); 
            $table->string('stripe_pm_id')->unique(); // Stripe経由のトークン
            $table->string('account_identifier')->nullable(); // 表示用のアカウント名など
            $table->boolean('is_default')->default(false);
            $table->timestamps();
        });

        // 4. BNPL (Affirm, Klarnaなどの後払い)
        Schema::create('fan_bnpl_accounts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('fan_id')->constrained()->onDelete('cascade');
            $table->enum('provider', ['affirm', 'klarna', 'afterpay']);
            $table->string('external_id')->nullable(); // プロバイダー側のID
            $table->boolean('is_default')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('fan_bnpl_accounts');
        Schema::dropIfExists('fan_digital_wallets');
        Schema::dropIfExists('fan_paypal_accounts');
        Schema::dropIfExists('fan_credit_cards');
    }
};