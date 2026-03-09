<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. users (Breezeのデフォルトを拡張)
        Schema::table('users', function (Blueprint $table) {
            $table->string('thumbnail_url')->nullable()->after('password');
            $table->string('website_url')->nullable()->after('thumbnail_url');
            $table->string('x_id')->nullable()->after('website_url');
            $table->softDeletes()->after('updated_at'); // 論理削除
        });

        // 2. products
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('slug')->unique();
            $table->integer('estimated_price')->nullable();
            $table->enum('status', ['draft', 'published', 'closed'])->default('draft');
            $table->timestamps();
            $table->softDeletes();
        });

        // 3. product_images
        Schema::create('product_images', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->onDelete('cascade');
            $table->string('image_url');
            $table->integer('sort_order')->default(0);
            $table->timestamps();
            $table->softDeletes();
        });

        // 4. fans
        Schema::create('fans', function (Blueprint $table) {
            $table->id();
            $table->string('email')->unique();
            $table->string('password');
            $table->string('name')->nullable(); // プロフィール機能用
            $table->string('thumbnail_url')->nullable();
            $table->string('country_code', 2);
            $table->text('bio')->nullable(); // プロフィール機能用
            $table->timestamps();
            $table->softDeletes();
        });

        // 5. translations (画像の定義に完全準拠)
        Schema::create('translations', function (Blueprint $table) {
            $table->id(); // PK
            $table->string('translatable_type'); // 紐づくテーブル名 (User, Product, Fan)
            $table->bigInteger('translatable_id'); // 紐づくレコードのID
            $table->string('column_name'); // circle_name, title, profile_text, bio等
            $table->string('locale', 5); // 言語コード
            $table->text('text'); // 翻訳テキスト
            $table->timestamps();
            $table->softDeletes();
        });

        // 6. reservations
        Schema::create('reservations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('fan_id')->constrained()->onDelete('cascade');
            $table->foreignId('product_id')->constrained()->onDelete('cascade');
            $table->integer('quantity')->default(1);
            $table->text('comment')->nullable();
            $table->string('ip_address')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reservations');
        Schema::dropIfExists('translations');
        Schema::dropIfExists('fans');
        Schema::dropIfExists('product_images');
        Schema::dropIfExists('products');
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['thumbnail_url', 'website_url', 'x_id', 'deleted_at']);
        });
    }
};