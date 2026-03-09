<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ProductImage extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * 複数代入可能な属性
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'product_id',
        'image_url',
        'sort_order',
    ];

    /**
     * この画像が属する作品（Product）を取得
     */
    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}