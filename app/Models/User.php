<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'phone',
        'password',
        'avatar_path',
        'role',
        'is_active',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password'          => 'hashed',
            'is_active'         => 'boolean',
        ];
    }

    // -------------------------------------------------------------------
    // Role Helpers
    // -------------------------------------------------------------------

    public function isSuperAdmin(): bool
    {
        return $this->role === 'super_admin';
    }

    public function isCustomer(): bool
    {
        return in_array($this->role, ['owner', 'admin', 'staff']);
    }

    // -------------------------------------------------------------------
    // العلاقات
    // -------------------------------------------------------------------

    public function invoices()
    {
        return $this->hasMany(Invoice::class, 'created_by');
    }

    public function purchases()
    {
        return $this->hasMany(Purchase::class, 'created_by');
    }

    public function auditLogs()
    {
        return $this->hasMany(AuditLog::class);
    }

    public function companySetting()
    {
        return $this->hasOne(CompanySetting::class);
    }

    public function subscriptions()
    {
        return $this->hasMany(Subscription::class)->orderByDesc('created_at');
    }

    public function activeSubscription()
    {
        return $this->hasOne(Subscription::class)
            ->whereIn('status', ['active', 'trial'])
            ->where('end_date', '>=', now()->toDateString())
            ->latest('created_at');
    }

    public function latestSubscription()
    {
        return $this->hasOne(Subscription::class)->latestOfMany();
    }

    // -------------------------------------------------------------------
    // Subscription Business Logic
    // -------------------------------------------------------------------

    /**
     * جلب الاشتراك النشط الحالي (مع تحديث الحالة تلقائياً)
     */
    public function getCurrentSubscription(): ?Subscription
    {
        $sub = $this->subscriptions()
            ->whereIn('status', ['active', 'trial', 'expired'])
            ->latest('created_at')
            ->first();

        if ($sub) {
            $sub->checkAndExpire();
            $sub->refresh();
        }

        return $sub;
    }

    /**
     * هل يستطيع المستخدم إنشاء فاتورة جديدة؟
     */
    public function canCreateInvoice(): bool
    {
        if ($this->isSuperAdmin()) {
            return true; // Super Admin لا يخضع للقيود
        }

        $sub = $this->getCurrentSubscription();
        return $sub && $sub->canCreateInvoice();
    }

    // -------------------------------------------------------------------
    // Scopes
    // -------------------------------------------------------------------

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeCustomers($query)
    {
        return $query->whereIn('role', ['owner', 'admin', 'staff']);
    }

    public function scopeSuperAdmins($query)
    {
        return $query->where('role', 'super_admin');
    }
}
