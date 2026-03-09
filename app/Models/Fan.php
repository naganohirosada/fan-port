<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;

class Fan extends Authenticatable
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'email',
        'password',
        'name',
        'thumbnail_url',
        'country_code',
        'bio',
    ];

    /**
     * このファンが行った予約一覧
     */
    public function reservations()
    {
        return $this->hasMany(Reservation::class);
    }

    public function wantedProducts()
    {
        // FansテーブルとProductsテーブルをwantsテーブル（中間テーブル）でつなぐ
        return $this->belongsToMany(Product::class, 'wants', 'fan_id', 'product_id')
                    ->withTimestamps();
    }
}