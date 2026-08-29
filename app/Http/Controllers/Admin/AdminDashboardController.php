<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Invoice;
use App\Models\Subscription;
use App\Models\SubscriptionPayment;
use App\Models\User;
use App\Services\SubscriptionService;
use Inertia\Inertia;
use Inertia\Response;

class AdminDashboardController extends Controller
{
    public function __construct(private SubscriptionService $subscriptionService) {}

    public function index(): Response
    {
        // تحديث الاشتراكات المنتهية تلقائياً عند فتح لوحة التحكم
        $this->subscriptionService->expireOverdueSubscriptions();

        $stats = $this->subscriptionService->getDashboardStats();

        // آخر العملاء
        $recentCustomers = User::customers()
            ->with('latestSubscription.plan')
            ->latest()
            ->take(5)
            ->get()
            ->map(fn ($u) => [
                'id'     => $u->id,
                'name'   => $u->name,
                'email'  => $u->email,
                'role'   => $u->role,
                'status' => $u->is_active ? 'نشط' : 'معطل',
                'subscription_status' => $u->latestSubscription?->status_label ?? 'لا يوجد',
                'created_at' => $u->created_at->format('Y-m-d'),
            ]);

        // الاشتراكات التي ستنتهي قريباً
        $expiringSoon = Subscription::with(['user', 'plan'])
            ->whereIn('status', ['active', 'trial'])
            ->whereBetween('end_date', [now()->toDateString(), now()->addDays(7)->toDateString()])
            ->orderBy('end_date')
            ->take(10)
            ->get()
            ->map(fn ($s) => [
                'id'          => $s->id,
                'user_name'   => $s->user->name,
                'plan_name'   => $s->plan?->name ?? 'مخصص',
                'end_date'    => $s->end_date->format('Y-m-d'),
                'days_left'   => $s->daysRemaining(),
                'status'      => $s->status_label,
            ]);

        // آخر المدفوعات
        $recentPayments = SubscriptionPayment::with(['user', 'subscription.plan'])
            ->latest()
            ->take(5)
            ->get()
            ->map(fn ($p) => [
                'id'         => $p->id,
                'user_name'  => $p->user->name,
                'plan_name'  => $p->subscription?->plan?->name ?? 'مخصص',
                'amount'     => (float) $p->amount,
                'date'       => $p->payment_date->format('Y-m-d'),
                'method'     => $p->method_label,
                'status'     => $p->status_label,
            ]);

        // آخر النشاطات
        $recentActivities = AuditLog::with('user')
            ->whereIn('action', [
                'subscription_created', 'subscription_activated', 'subscription_renewed',
                'subscription_suspended', 'subscription_payment_recorded',
                'customer_created', 'customer_suspended',
            ])
            ->latest('created_at')
            ->take(10)
            ->get()
            ->map(fn ($log) => [
                'id'          => $log->id,
                'action'      => $log->action,
                'description' => $log->description,
                'user_name'   => $log->user?->name ?? 'النظام',
                'created_at'  => $log->created_at->format('Y-m-d H:i'),
            ]);

        return Inertia::render('Admin/Dashboard', [
            'stats'             => $stats,
            'recent_customers'  => $recentCustomers,
            'expiring_soon'     => $expiringSoon,
            'recent_payments'   => $recentPayments,
            'recent_activities' => $recentActivities,
        ]);
    }
}
