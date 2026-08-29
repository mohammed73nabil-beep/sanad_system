<?php

namespace App\Services;

use App\Models\AuditLog;
use App\Models\Invoice;
use App\Models\Plan;
use App\Models\Subscription;
use App\Models\SubscriptionPayment;
use App\Models\SubscriptionRenewal;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class SubscriptionService
{
    /**
     * إنشاء اشتراك جديد للعميل
     */
    public function create(array $data): Subscription
    {
        $plan = isset($data['plan_id']) ? Plan::find($data['plan_id']) : null;

        // حساب تاريخ الانتهاء تلقائياً من المدة إذا لم يُحدد
        if (empty($data['end_date']) && $plan) {
            $start = Carbon::parse($data['start_date']);
            $data['end_date'] = $start->addDays($plan->duration_days)->toDateString();
        }

        // استخدام حد الفواتير من الباقة إذا لم يُحدد
        if (empty($data['invoice_limit']) && $plan) {
            $data['invoice_limit'] = $plan->invoice_limit;
        }

        // استخدام سعر الباقة إذا لم يُحدد
        if (empty($data['price']) && $plan) {
            $data['price'] = $plan->price;
        }

        $data['created_by'] = auth()->id();
        $data['invoices_used'] = 0;

        $subscription = Subscription::create($data);

        AuditLog::record(
            'subscription_created',
            "إنشاء اشتراك جديد للمستخدم ID:{$data['user_id']} - الباقة: " . ($plan?->name ?? 'مخصص'),
            $subscription
        );

        return $subscription;
    }

    /**
     * تفعيل اشتراك موجود يدوياً بواسطة Super Admin
     */
    public function activate(Subscription $subscription): void
    {
        $subscription->update([
            'status'       => Subscription::STATUS_ACTIVE,
            'activated_at' => now(),
        ]);

        AuditLog::record(
            'subscription_activated',
            "تفعيل اشتراك ID:{$subscription->id} للمستخدم ID:{$subscription->user_id}",
            $subscription
        );
    }

    /**
     * تعليق اشتراك
     */
    public function suspend(Subscription $subscription, ?string $reason = null): void
    {
        $subscription->update(['status' => Subscription::STATUS_SUSPENDED]);

        AuditLog::record(
            'subscription_suspended',
            "تعليق اشتراك ID:{$subscription->id} - السبب: " . ($reason ?? 'لم يُذكر'),
            $subscription
        );
    }

    /**
     * إلغاء اشتراك
     */
    public function cancel(Subscription $subscription, ?string $reason = null): void
    {
        $subscription->update(['status' => Subscription::STATUS_CANCELLED]);

        AuditLog::record(
            'subscription_cancelled',
            "إلغاء اشتراك ID:{$subscription->id} - السبب: " . ($reason ?? 'لم يُذكر'),
            $subscription
        );
    }

    /**
     * تمديد اشتراك موجود
     * يُضاف الوقت على نهاية تاريخ الانتهاء الحالي (ليس تاريخ اليوم)
     */
    public function renew(Subscription $subscription, int $days, float $price = 0, ?string $notes = null): SubscriptionRenewal
    {
        $oldEndDate = $subscription->end_date->copy();
        $newEndDate = $oldEndDate->copy()->addDays($days);

        DB::transaction(function () use ($subscription, $oldEndDate, $newEndDate, $days, $price, $notes, &$renewal) {
            $subscription->update([
                'end_date' => $newEndDate->toDateString(),
                'status'   => Subscription::STATUS_ACTIVE, // إعادة تفعيل إذا كان منتهياً
            ]);

            $renewal = SubscriptionRenewal::create([
                'subscription_id' => $subscription->id,
                'user_id'         => $subscription->user_id,
                'old_end_date'    => $oldEndDate->toDateString(),
                'new_end_date'    => $newEndDate->toDateString(),
                'days_added'      => $days,
                'price'           => $price,
                'notes'           => $notes,
                'renewed_by'      => auth()->id(),
            ]);
        });

        AuditLog::record(
            'subscription_renewed',
            "تمديد اشتراك ID:{$subscription->id} بـ {$days} يوم - من {$oldEndDate->format('Y-m-d')} إلى {$newEndDate->format('Y-m-d')}",
            $subscription
        );

        return $renewal;
    }

    /**
     * تسجيل دفعة جديدة لاشتراك
     */
    public function recordPayment(Subscription $subscription, array $data): SubscriptionPayment
    {
        $data['subscription_id'] = $subscription->id;
        $data['user_id']         = $subscription->user_id;
        $data['recorded_by']     = auth()->id();

        $payment = SubscriptionPayment::create($data);

        // تحديث حالة الدفع في الاشتراك
        if ($data['status'] === 'paid') {
            $subscription->update(['payment_status' => 'paid']);
        }

        AuditLog::record(
            'subscription_payment_recorded',
            "تسجيل دفعة {$data['amount']} ر.س لاشتراك ID:{$subscription->id}",
            $payment
        );

        return $payment;
    }

    /**
     * زيادة عداد الفواتير المستخدمة (عداد الأداء فقط - ليس مصدر الحقيقة)
     * يجب استدعاؤه داخل DB Transaction
     */
    public function incrementInvoicesUsed(User $user): void
    {
        $sub = $user->subscriptions()
            ->whereIn('status', ['active', 'trial'])
            ->where('end_date', '>=', now()->toDateString())
            ->lockForUpdate() // منع التزامن
            ->latest()
            ->first();

        if ($sub) {
            $sub->increment('invoices_used');
        }
    }

    /**
     * فحص انتهاء صلاحية جميع الاشتراكات النشطة وتحديثها
     * يُستدعى من Scheduled Command
     */
    public function expireOverdueSubscriptions(): int
    {
        return Subscription::whereIn('status', [Subscription::STATUS_ACTIVE, Subscription::STATUS_TRIAL])
            ->where('end_date', '<', now()->toDateString())
            ->update(['status' => Subscription::STATUS_EXPIRED]);
    }

    /**
     * إحصائيات Super Admin Dashboard
     */
    public function getDashboardStats(): array
    {
        $now = now();
        $thisMonthStart = $now->copy()->startOfMonth();

        return [
            'total_customers'    => User::customers()->count(),
            'active_customers'   => User::customers()->active()->count(),
            'total_subscriptions'=> Subscription::count(),
            'active_subs'        => Subscription::where('status', 'active')->count(),
            'trial_subs'         => Subscription::where('status', 'trial')->count(),
            'expired_subs'       => Subscription::where('status', 'expired')->count(),
            'expiring_soon'      => Subscription::whereIn('status', ['active', 'trial'])
                ->whereBetween('end_date', [now()->toDateString(), now()->addDays(7)->toDateString()])
                ->count(),
            'monthly_revenue'    => SubscriptionPayment::where('status', 'paid')
                ->whereDate('payment_date', '>=', $thisMonthStart)
                ->sum('amount'),
            'monthly_invoices'   => Invoice::whereDate('created_at', '>=', $thisMonthStart)
                ->whereNotIn('status', [Invoice::STATUS_CANCELLED, Invoice::STATUS_DRAFT])
                ->count(),
        ];
    }
}
