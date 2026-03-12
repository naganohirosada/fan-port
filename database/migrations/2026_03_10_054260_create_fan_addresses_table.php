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
        Schema::create('fan_addresses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('fan_id')->constrained()->onDelete('cascade');
            $table->foreignId('country_id')->constrained(); // IDで管理
            $table->foreignId('region_id')->constrained();  // IDで管理
            $table->string('zip_code');
            $table->string('address1');
            $table->string('address2')->nullable();
            $table->string('phone_number')->nullable();
            $table->boolean('is_default')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('fan_addresses');
    }
};
