<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Invoice extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'invoice_number', 'type', 'status', 'customer_id',
        'issue_date', 'due_date',
        'subtotal', 'discount_amount', 'tax_amount', 'total_amount',
        'paid_amount', 'remaining_amount',
        'payment_method', 'notes', 'is_tax_inclusive',
        'qr_data', 'created_by',
    ];

    protected function casts(): array
    {
        return [
            'issue_date'      => 'date',
            'due_date'        => 'date',
            'subtotal'        => 'decimal:2',
            'discount_amount' => 'decimal:2',
            'tax_amount'      => 'decimal:2',
            'total_amount'    => 'decimal:2',
            'paid_amount'     => 'decimal:2',
            'remaining_amount'=> 'decimal:2',
            'is_tax_inclusive'=> 'boolean',
        ];
    }

    // -------------------------------------------------------------------
    // ثوابت الحالات
    // -------------------------------------------------------------------

    const STATUS_DRAFT          = 'draft';
    const STATUS_ISSUED         = 'issued';
    const STATUS_PARTIALLY_PAID = 'partially_paid';
    const STATUS_PAID           = 'paid';
    const STATUS_OVERDUE        = 'overdue';
    const STATUS_CANCELLED      = 'cancelled';

    const PAYMENT_CASH  = 'cash';
    const PAYMENT_BANK  = 'bank';
    const PAYMENT_CARD  = 'card';
    const PAYMENT_OTHER = 'other';

    // -------------------------------------------------------------------
    // العلاقات
    // -------------------------------------------------------------------

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function items()
    {
        return $this->hasMany(InvoiceItem::class);
    }

    public function payments()
    {
        return $this->hasMany(Payment::class);
    }

    public function receiptVouchers()
    {
        return $this->hasMany(ReceiptVoucher::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    // -------------------------------------------------------------------
    // Accessors
    // -------------------------------------------------------------------

    public function getStatusNameAttribute(): string
    {
        return match($this->status) {
            self::STATUS_DRAFT          => 'مسودة',
            self::STATUS_ISSUED         => 'صادرة',
            self::STATUS_PARTIALLY_PAID => 'مدفوعة جزئياً',
            self::STATUS_PAID           => 'مدفوعة',
            self::STATUS_OVERDUE        => 'متأخرة',
            self::STATUS_CANCELLED      => 'ملغاة',
            default                     => $this->status,
        };
    }

    public function getPaymentMethodNameAttribute(): string
    {
        return match($this->payment_method) {
            self::PAYMENT_CASH  => 'نقدي',
            self::PAYMENT_BANK  => 'تحويل بنكي',
            self::PAYMENT_CARD  => 'شبكة',
            self::PAYMENT_OTHER => 'أخرى',
            default             => '—',
        };
    }

    public function getIsOverdueAttribute(): bool
    {
        return $this->due_date
            && $this->due_date->isPast()
            && !in_array($this->status, [self::STATUS_PAID, self::STATUS_CANCELLED]);
    }

    // -------------------------------------------------------------------
    // Scopes
    // -------------------------------------------------------------------

    public function scopeIssued($query)
    {
        return $query->where('status', '!=', self::STATUS_DRAFT)
                     ->where('status', '!=', self::STATUS_CANCELLED);
    }

    public function scopeOverdue($query)
    {
        return $query->whereNotIn('status', [self::STATUS_PAID, self::STATUS_CANCELLED])
                     ->where('due_date', '<', now());
    }

    public function scopeSearch($query, string $term)
    {
        return $query->where(function ($q) use ($term) {
            $q->where('invoice_number', 'like', "%{$term}%")
              ->orWhereHas('customer', fn ($cq) => $cq->where('name', 'like', "%{$term}%"));
        });
    }
}
