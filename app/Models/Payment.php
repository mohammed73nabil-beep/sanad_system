<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    protected $fillable = [
        'invoice_id', 'customer_id', 'amount',
        'payment_method', 'payment_date', 'reference', 'notes', 'created_by',
    ];

    protected function casts(): array
    {
        return [
            'amount'       => 'decimal:2',
            'payment_date' => 'date',
        ];
    }

    // -------------------------------------------------------------------
    // العلاقات
    // -------------------------------------------------------------------

    public function invoice()
    {
        return $this->belongsTo(Invoice::class);
    }

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function receiptVoucher()
    {
        return $this->hasOne(ReceiptVoucher::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    // -------------------------------------------------------------------
    // Accessors
    // -------------------------------------------------------------------

    public function getPaymentMethodNameAttribute(): string
    {
        return match($this->payment_method) {
            'cash'  => 'نقدي',
            'bank'  => 'تحويل بنكي',
            'card'  => 'شبكة',
            'other' => 'أخرى',
            default => '—',
        };
    }
}
