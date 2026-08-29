<?php

namespace App\Models;

use App\Models\Concerns\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;

class CompanySetting extends Model
{
    use BelongsToTenant;

    protected $fillable = [
        'user_id',
        'name', 'logo_path', 'commercial_register', 'tax_number',
        'phone', 'email', 'address', 'city', 'region',
        'postal_code', 'additional_number', 'currency', 'currency_symbol',
        'default_tax_rate', 'invoice_notes', 'invoice_prefix',
        'purchase_prefix', 'receipt_prefix',
        'invoice_counter', 'purchase_counter', 'receipt_counter',
    ];

    protected function casts(): array
    {
        return [
            'default_tax_rate'  => 'decimal:2',
            'invoice_counter'   => 'integer',
            'purchase_counter'  => 'integer',
            'receipt_counter'   => 'integer',
        ];
    }

    /**
     * جلب إعدادات المنشأة (للمستخدم الحالي)
     */
    public static function current(): ?self
    {
        return static::first();
    }

    /**
     * جلب إعدادات المنشأة أو إنشاؤها بالقيم الافتراضية
     */
    public static function getOrCreate(): self
    {
        return static::firstOrCreate([], [
            'name'             => 'منشأتي التجارية',
            'currency'         => 'SAR',
            'currency_symbol'  => 'ر.س',
            'default_tax_rate' => 15.00,
            'invoice_prefix'   => 'INV',
            'purchase_prefix'  => 'PUR',
            'receipt_prefix'   => 'RCV',
        ]);
    }
}
