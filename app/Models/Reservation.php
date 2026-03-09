<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Reservation extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * 複数代入可能な属性
     */
    protected $fillable = [
        'fan_id',
        'product_id',
        'quantity',
        'comment',
        'ip_address',
    ];

    /**
     * 予約したファンを取得
     */
    public function fan()
    {
        return $this->belongsTo(Fan::class);
    }

    /**
     * 対象の作品を取得
     */
    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}