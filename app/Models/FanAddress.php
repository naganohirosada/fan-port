<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FanAddress extends Model
{
    use HasFactory;

    protected $fillable = [
        'fan_id',
        'country_id',
        'country_code',
        'region_id',
        'state_region',
        'zip_code',
        'address1',
        'address2',
        'phone_number',
        'is_default'
    ];

    public function country() { return $this->belongsTo(Country::class); }
    public function region() { return $this->belongsTo(Region::class); }
}