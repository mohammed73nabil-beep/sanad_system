<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;

class Subscription extends Model
{
    const STATUS_TRIAL     = 'trial';
    const STATUS_ACTIVE    = 'active';
    const STATUS_EXPIRED   = 'expired';
    const STATUS_SUSPENDED = 'suspended';
    const STATUS_CANCELLED = 'cancelled';

    const STATUS_LABELS = [
        'trial'     => 'تجربة',
        'active'    => 'نشط',
        'expired'   => 'منتهي',
        'suspended' => 'معلق',
        'cancelled' => 'ملغى',
    ];

    protected $fillable = [
        'user_id',
        'plan_id',
        'start_date',
        'end_date',
        'status',
        'invoice_limit',
        'invoices_used',
        'price',
        'payment_status',
        'notes',
        'activated_at',
        'created_by',
    ];

    protected function casts(): array
    {
        return [
            'start_date'    => 'date',
            'end_date'      => 'date',
            'invoice_limit' => 'integer',
            'invoices_used' => 'integer',
            'price'         => 'decimal:2',
            'activated_at'  => 'datetime',
        ];
    }

    // -------------------------------------------------------------------
    // العلاقات
    // -------------------------------------------------------------------

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function plan()
    {
        return $this->belongsTo(Plan::class)->withTrashed();
    }

    public function payments()
    {
        return $this->hasMany(SubscriptionPayment::class);
    }

    public function renewals()
    {
        return $this->hasMany(SubscriptionRenewal::class);
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    // -------------------------------------------------------------------
    // Business Logic
    // -------------------------------------------------------------------

    /**
     * هل الاشتراك يسمح بإنشاء فاتورة جديدة؟
     * يتحقق من الحالة والتاريخ وحد الفواتير الحقيقي
     */
    public function canCreateInvoice(): bool
    {
        if (!in_array($this->status, [self::STATUS_ACTIVE, self::STATUS_TRIAL])) {
            return false;
        }

        if (Carbon::today()->gt($this->end_date)) {
            return false;
        }

        return $this->getRealInvoicesUsed() < $this->invoice_limit;
    }

    /**
     * الحصول على عدد الفواتير الحقيقي من قاعدة البيانات
     * (المصدر الحقيقي للحقيقة)
     */
    public function getRealInvoicesUsed(): int
    {
        return Invoice::where('created_by', $this->user_id)
            ->whereDate('created_at', '>=', $this->start_date)
            ->whereDate('created_at', '<=', $this->end_date)
            ->whereNotIn('status', [Invoice::STATUS_CANCELLED, Invoice::STATUS_DRAFT])
            ->count();
    }

    /**
     * الفواتير المتبقية المسموح بها
     */
    public function remainingInvoices(): int
    {
        return max(0, $this->invoice_limit - $this->getRealInvoicesUsed());
    }

    /**
     * هل الاشتراك سينتهي قريباً؟ (خلال N يوم)
     */
    public function expiresWithinDays(int $days = 7): bool
    {
        if (!$this->end_date) return false;
        $endDate = $this->end_date instanceof Carbon ? $this->end_date : Carbon::parse($this->end_date);
        return in_array($this->status, [self::STATUS_ACTIVE, self::STATUS_TRIAL])
            && Carbon::today()->diffInDays($endDate, false) <= $days
            && Carbon::today()->lte($endDate);
    }

    /**
     * الأيام المتبقية حتى انتهاء الاشتراك
     */
    public function daysRemaining(): int
    {
        if (!$this->end_date) return 0;
        $endDate = $this->end_date instanceof Carbon ? $this->end_date : Carbon::parse($this->end_date);
        return max(0, (int) Carbon::today()->diffInDays($endDate, false));
    }

    /**
     * التحقق من انتهاء الصلاحية وتحديث الحالة تلقائياً
     */
    public function checkAndExpire(): bool
    {
        if (!$this->end_date) return false;
        $endDate = $this->end_date instanceof Carbon ? $this->end_date : Carbon::parse($this->end_date);
        if (
            in_array($this->status, [self::STATUS_ACTIVE, self::STATUS_TRIAL])
            && Carbon::today()->gt($endDate)
        ) {
            $this->update(['status' => self::STATUS_EXPIRED]);
            return true;
        }
        return false;
    }

    public function getStatusLabelAttribute(): string
    {
        return self::STATUS_LABELS[$this->status] ?? $this->status;
    }
}
