<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SubscriptionPayment extends Model
{
    const STATUS_PAID     = 'paid';
    const STATUS_UNPAID   = 'unpaid';
    const STATUS_REFUNDED = 'refunded';

    const METHOD_CASH     = 'cash';
    const METHOD_BANK     = 'bank_transfer';
    const METHOD_OTHER    = 'other';

    const METHOD_LABELS = [
        'cash'          => 'نقدي',
        'bank_transfer' => 'تحويل بنكي',
        'other'         => 'أخرى',
    ];

    const STATUS_LABELS = [
        'paid'     => 'مدفوع',
        'unpaid'   => 'غير مدفوع',
        'refunded' => 'مسترد',
    ];

    protected $fillable = [
        'subscription_id',
        'user_id',
        'amount',
        'payment_date',
        'payment_method',
        'status',
        'reference_number',
        'notes',
        'recorded_by',
    ];

    protected function casts(): array
    {
        return [
            'payment_date' => 'date',
            'amount'       => 'decimal:2',
        ];
    }

    // -------------------------------------------------------------------
    // العلاقات
    // -------------------------------------------------------------------

    public function subscription()
    {
        return $this->belongsTo(Subscription::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function recordedBy()
    {
        return $this->belongsTo(User::class, 'recorded_by');
    }

    // -------------------------------------------------------------------
    // Accessors
    // -------------------------------------------------------------------

    public function getMethodLabelAttribute(): string
    {
        return self::METHOD_LABELS[$this->payment_method] ?? $this->payment_method;
    }

    public function getStatusLabelAttribute(): string
    {
        return self::STATUS_LABELS[$this->status] ?? $this->status;
    }
}
