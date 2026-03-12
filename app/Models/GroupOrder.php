<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Models\Product;
use App\Models\Fan;
use App\Models\GroupOrderUpdate;

class GroupOrder extends Model
{
    use HasFactory;

    // 一括代入を許可するカラムを指定
    protected $fillable = [
        'product_id',
        'region_name',
        'country_code',
        'max_members',
        'current_members',
        'shared_shipping_cost',
        'status'
    ];

    /**
     * どの商品に属しているか
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * このGroup Orderの主催者 (GOM) を取得
     */
    public function gom(): BelongsTo
    {
        // 第二引数にカラム名 'gom_id' を明示的に指定します
        return $this->belongsTo(Fan::class, 'gom_id');
    }

    public function participants()
    {
        return $this->belongsToMany(Fan::class, 'group_order_participants')
                    ->withPivot(['status', 'payment_status', 'tracking_number', 'quantity'])
                    ->withTimestamps();
    }

    public function updates()
    {
        // 作成日時が新しい順に並べる
        return $this->hasMany(GroupOrderUpdate::class)->latest();
    }
}