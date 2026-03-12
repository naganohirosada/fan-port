<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FanCreditCard extends Model
{
    protected $fillable = [
        'fan_id', 'stripe_pm_id', 'brand', 'last4', 'exp_month', 'exp_year', 'is_default'
    ];

    public function fan() { return $this->belongsTo(Fan::class); }
}