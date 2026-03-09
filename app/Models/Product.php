<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Models\Translation;
use App\Models\ProductImage;
use App\Models\Reservation;
use App\Models\User;

class Product extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'slug',
        'estimated_price',
        'status',
    ];

    /**
     * ポリモーフィック関連: 翻訳データ
     */
    public function translations()
    {
        return $this->morphMany(Translation::class, 'translatable');
    }

    /**
     * 特定の言語のテキストを取得するヘルパー
     */
    public function getTranslation(string $column, string $locale = 'ja')
    {
        return $this->translations()
            ->where('column_name', $column)
            ->where('locale', $locale)
            ->first()?->text;
    }

    public function images()
    {
        return $this->hasMany(ProductImage::class);
    }

    public function reservations()
    {
        return $this->hasMany(Reservation::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function fans()
    {
        // Postは多くのFanからWant!される
        return $this->belongsToMany(Fan::class, 'wants');
    }
}