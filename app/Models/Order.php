<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    protected $fillable = [
        'fan_id',
        'product_id',
        'creator_id',
        'fan_address_id',
        'group_order_id',
        'quantity',
        'total_price',
        'status',
        'order_type',
        'tracking_number',
    ];
    public function payments()
    {
        return $this->hasMany(Payment::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function fan()
    {
        return $this->belongsTo(Fan::class);
    }

    public function fanAddress()
    {
        return $this->belongsTo(FanAddress::class, 'fan_address_id');
    }
}
