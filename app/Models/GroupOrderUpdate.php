<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class GroupOrderUpdate extends Model
{
    use HasFactory;

    // ここに一括保存を許可するカラムを指定します
    protected $fillable = [
        'group_order_id',
        'title',
        'content',
        'status_tag',
    ];

    /**
     * 紐付いているグループオーダーを取得
     */
    public function groupOrder()
    {
        return $this->belongsTo(GroupOrder::class);
    }
}