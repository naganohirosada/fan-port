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
        Schema::create('wants', function (Blueprint $table) {
            $table->id();
            $table->foreignId('fan_id')->constrained()->onDelete('cascade'); // どのファンが
            $table->foreignId('product_id')->constrained()->onDelete('cascade'); // どの作品を
            $table->timestamps();

            // 同じ人が同じ作品を二度Want!できないようにユニーク制約をかける
            $table->unique(['fan_id', 'product_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('wants');
    }
};
