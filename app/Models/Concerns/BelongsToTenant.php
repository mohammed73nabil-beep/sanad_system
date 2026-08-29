<?php

namespace App\Models\Concerns;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;

/**
 * BelongsToTenant Trait
 *
 * يُضاف هذا الـ Trait لأي Model يجب أن تكون بياناته
 * معزولة بين المستخدمين (Multi-Tenant Row-Level Isolation).
 *
 * الآلية:
 * - Global Scope يُصفّي تلقائياً بـ user_id = auth()->id()
 * - عند الإنشاء يُعيَّن user_id تلقائياً
 * - Super Admin يستطيع تجاوز الـ Scope عبر withoutTenantScope()
 */
trait BelongsToTenant
{
    /**
     * اسم العمود المستخدم كـ tenant key
     * يمكن تجاوزه في الـ Model: protected string $tenantKey = 'created_by';
     */
    protected function getTenantKeyName(): string
    {
        return property_exists($this, 'tenantKey') ? $this->tenantKey : 'user_id';
    }

    /**
     * Boot the trait — تُسجَّل عند تحميل الـ Model
     */
    public static function bootBelongsToTenant(): void
    {
        // ─── Global Scope: تصفية تلقائية بـ user_id ─────────────────────────
        static::addGlobalScope('tenant', function (Builder $query) {
            $user = Auth::user();

            // Super Admin: يرى كل البيانات (في سياق الـ Admin Panel)
            // نتحقق من session flag لأن السياق مهم
            if ($user && $user->isSuperAdmin()) {
                // إذا كان الـ Super Admin يُحاكي عميلاً (Impersonation) فنُصفّي
                if (session()->has('impersonating_user_id')) {
                    $query->where(
                        (new static())->qualifyColumn((new static())->getTenantKeyName()),
                        session('impersonating_user_id')
                    );
                }
                // وإلا لا نُصفّي — Super Admin يرى الكل
                return;
            }

            // المستخدم العادي (owner / admin / staff): يرى بيانات المنشأة الخاصة به
            if ($user) {
                // الـ admin/staff يرون بيانات الـ owner الذي ينتمون إليه
                $ownerId = static::resolveTenantOwnerId($user);

                $query->where(
                    (new static())->qualifyColumn((new static())->getTenantKeyName()),
                    $ownerId
                );
            }
        });

        // ─── Auto-assign user_id عند الإنشاء ─────────────────────────────────
        static::creating(function (Model $model) {
            $tenantKey = $model->getTenantKeyName();

            if (empty($model->$tenantKey) && Auth::check()) {
                $user    = Auth::user();
                $ownerId = static::resolveTenantOwnerId($user);
                $model->$tenantKey = $ownerId;
            }
        });
    }

    /**
     * استخراج ID الـ Owner من المستخدم الحالي.
     *
     * - إذا كان الدور owner → نفسه
     * - إذا كان admin/staff → نبحث عن الـ owner المرتبط بهم (مستقبلاً)
     *   حالياً: نأخذ نفس user_id (كل مستخدم مستقل)
     */
    protected static function resolveTenantOwnerId($user): int
    {
        // في حالة Impersonation من Super Admin
        if (session()->has('impersonating_user_id')) {
            return (int) session('impersonating_user_id');
        }

        return (int) $user->id;
    }

    /**
     * Scope: تجاوز الـ Tenant Scope لاستعلامات خاصة
     * Usage: Model::withoutTenantScope()->get()
     */
    public static function withoutTenantScope(): Builder
    {
        return static::withoutGlobalScope('tenant');
    }

    /**
     * Scope: استعلام لمستخدم محدد (للاستخدام من Super Admin)
     * Usage: Model::forTenant($userId)->get()
     */
    public function scopeForTenant(Builder $query, int $userId): Builder
    {
        return $query->withoutGlobalScope('tenant')
                     ->where($this->qualifyColumn($this->getTenantKeyName()), $userId);
    }
}
