<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FanPaypalAccount extends Model
{
    protected $fillable = [
        'fan_id', 'paypal_email', 'paypal_payer_id', 'is_default'
    ];

    public function fan() { return $this->belongsTo(Fan::class); }
}