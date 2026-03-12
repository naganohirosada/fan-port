<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PaymentBreakdown extends Model
{
    use HasFactory;

    /**
     * 一括割り当て可能な属性
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'payment_id',
        'type',        // 例: 'item_price', 'service_fee', 'intl_shipping'
        'amount',      // 内訳金額
        'description', // 補足（例: "¥1,500 x 3 units"）
    ];

    /**
     * データの型キャスト
     *
     * @var array<string, string>
     */
    protected $casts = [
        'amount' => 'decimal:2',
    ];

    /**
     * この内訳が属する決済情報を取得
     * * @return BelongsTo
     */
    public function payment(): BelongsTo
    {
        return $this->belongsTo(Payment::class);
    }
}