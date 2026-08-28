<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Customer extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'name', 'type', 'phone', 'email', 'address', 'city',
        'tax_number', 'commercial_register', 'notes',
        'total_sales', 'total_paid', 'total_remaining', 'is_active',
    ];

    protected function casts(): array
    {
        return [
            'total_sales'     => 'decimal:2',
            'total_paid'      => 'decimal:2',
            'total_remaining' => 'decimal:2',
            'is_active'       => 'boolean',
        ];
    }

    // -------------------------------------------------------------------
    // العلاقات
    // -------------------------------------------------------------------

    public function invoices()
    {
        return $this->hasMany(Invoice::class);
    }

    public function payments()
    {
        return $this->hasMany(Payment::class);
    }

    public function receiptVouchers()
    {
        return $this->hasMany(ReceiptVoucher::class);
    }

    // -------------------------------------------------------------------
    // Accessors
    // -------------------------------------------------------------------

    public function getTypeNameAttribute(): string
    {
        return match($this->type) {
            'individual' => 'فرد',
            'business'   => 'منشأة تجارية',
            default      => $this->type,
        };
    }

    // -------------------------------------------------------------------
    // Scopes
    // -------------------------------------------------------------------

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeWithDebt($query)
    {
        return $query->where('total_remaining', '>', 0);
    }

    public function scopeSearch($query, string $term)
    {
        return $query->where(function ($q) use ($term) {
            $q->where('name', 'like', "%{$term}%")
              ->orWhere('phone', 'like', "%{$term}%")
              ->orWhere('tax_number', 'like', "%{$term}%");
        });
    }
}
