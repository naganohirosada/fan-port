<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FanDigitalWallet extends Model
{
    protected $fillable = [
        'fan_id', 'type', 'stripe_pm_id', 'account_identifier', 'is_default'
    ];

    public function fan() { return $this->belongsTo(Fan::class); }
}