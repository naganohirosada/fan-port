<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FanBnplAccount extends Model
{
    protected $fillable = [
        'fan_id', 'provider', 'external_id', 'is_default'
    ];

    public function fan() { return $this->belongsTo(Fan::class); }
}