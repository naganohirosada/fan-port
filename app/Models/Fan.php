<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;

class Fan extends Authenticatable
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'email',
        'password',
        'name',
        'thumbnail_url',
        'country_code',
        'bio',
    ];

    public function creditCards() { return $this->hasMany(FanCreditCard::class); }
    public function paypalAccounts() { return $this->hasMany(FanPaypalAccount::class); }
    public function digitalWallets() { return $this->hasMany(FanDigitalWallet::class); }
    public function bnplAccounts() { return $this->hasMany(FanBnplAccount::class); }

    /**
     * このファンが行った予約一覧
     */
    public function reservations()
    {
        return $this->hasMany(Reservation::class);
    }

    public function wantedProducts()
    {
        // FansテーブルとProductsテーブルをwantsテーブル（中間テーブル）でつなぐ
        return $this->belongsToMany(Product::class, 'wants', 'fan_id', 'product_id')
                    ->withTimestamps();
    }

    public function orders() {
    return $this->hasMany(Order::class);
    }

    public function groupOrders()
    {
        return $this->belongsToMany(GroupOrder::class, 'group_order_participants')
                    ->withPivot(['role', 'status', 'payment_status', 'tracking_number'])
                    ->withTimestamps();
    }

    public function address()
    {
        // 1つのファンに対して1つのデフォルト住所を持つ構成
        return $this->hasOne(FanAddress::class)->where('is_default', true);
    }

    public function addresses()
    {
        return $this->hasMany(FanAddress::class);
    }

    /**
     * すべての決済方法を一つのコレクションで取得するヘルパー
     */
    public function allPaymentMethods()
    {
        return collect([])
            ->concat($this->creditCards)
            ->concat($this->paypalAccounts)
            ->concat($this->digitalWallets)
            ->concat($this->bnplAccounts);
    }

    /**
     * ファンが「WANT（お気に入り）」した商品一覧を取得
     */
    public function wants(): \Illuminate\Database\Eloquent\Relations\BelongsToMany
    {
        // wants テーブルを中間テーブルとして、Product モデルと多対多で紐付ける
        return $this->belongsToMany(Product::class, 'wants')
                    ->withTimestamps(); // created_at, updated_at も管理する場合
    }
}