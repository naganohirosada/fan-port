<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    protected $fillable = [
        'order_id',
        'fan_id',
        'payment_instrument_type',
        'payment_instrument_id',
        'total_amount',
        'currency',
        'status',
        'transaction_id',
    ];

    protected $casts = [
        'metadata' => 'array',
    ];

    /**
     * 支払い対象（Order または GroupOrderParticipant）を取得
     */
    public function payable()
    {
        return $this->morphTo();
    }

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function breakdowns()
    {
        return $this->hasMany(PaymentBreakdown::class);
    }

    // 決済手段へのポリモーフィックリレーション
    public function instrument()
    {
        return $this->morphTo('payment_instrument');
    }
}