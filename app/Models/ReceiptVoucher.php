<?php

namespace App\Models;

use App\Models\Concerns\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ReceiptVoucher extends Model
{
    use SoftDeletes, BelongsToTenant;

    protected $fillable = [
        'user_id', 'voucher_number', 'customer_id', 'invoice_id', 'payment_id',
        'amount', 'payment_method', 'voucher_date',
        'amount_in_words', 'reference', 'description', 'created_by',
    ];

    protected function casts(): array
    {
        return [
            'amount'       => 'decimal:2',
            'voucher_date' => 'date',
        ];
    }

    // -------------------------------------------------------------------
    // العلاقات
    // -------------------------------------------------------------------

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function invoice()
    {
        return $this->belongsTo(Invoice::class);
    }

    public function payment()
    {
        return $this->belongsTo(Payment::class);
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
