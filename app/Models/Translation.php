<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Translation extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'translatable_type',
        'translatable_id',
        'column_name',
        'locale',
        'text',
    ];

    public function translatable()
    {
        return $this->morphTo();
    }
}