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
        Schema::table('group_order_participants', function (Blueprint $table) {
            // statusの前に role カラムを追加。デフォルトは一般参加者(participant)
            $table->string('role')->default('participant')->after('fan_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('group_order_participants', function (Blueprint $table) {
            $table->dropColumn('role');
        });
    }
};
