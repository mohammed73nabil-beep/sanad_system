<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     * Used for cache-busting on assets.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * البيانات المشتركة المتاحة في جميع صفحات React
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();
        $subscriptionData = null;

        if ($user && $user->isCustomer()) {
            $sub = $user->getCurrentSubscription();
            if ($sub) {
                $realUsed = $sub->getRealInvoicesUsed();
                $subscriptionData = [
                    'id'                 => $sub->id,
                    'plan_name'          => $sub->plan?->name ?? 'مخصص',
                    'status'             => $sub->status,
                    'status_label'       => $sub->status_label,
                    'end_date'           => $sub->end_date->format('Y-m-d'),
                    'days_remaining'     => $sub->daysRemaining(),
                    'invoice_limit'      => $sub->invoice_limit,
                    'invoices_used'      => $realUsed,
                    'remaining_invoices' => max(0, $sub->invoice_limit - $realUsed),
                    'is_expiring_soon'   => $sub->expiresWithinDays(7),
                    'is_expired'         => $sub->status === \App\Models\Subscription::STATUS_EXPIRED || now()->gt($sub->end_date),
                    'is_limit_reached'   => $realUsed >= $sub->invoice_limit,
                    'can_create_invoice' => $sub->canCreateInvoice(),
                ];
            }
        }

        return array_merge(parent::share($request), [
            'auth' => [
                'user' => $user ? [
                    'id'             => $user->id,
                    'name'           => $user->name,
                    'email'          => $user->email,
                    'role'           => $user->role,
                    'is_super_admin' => $user->isSuperAdmin(),
                ] : null,
                'is_impersonating' => $request->session()->has('impersonating_admin_id'),
                'subscription'     => $subscriptionData,
            ],
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error'   => fn () => $request->session()->get('error'),
                'warning' => fn () => $request->session()->get('warning'),
                'info'    => fn () => $request->session()->get('info'),
            ],
            'app' => [
                'name'    => config('app.name', 'سَنَد | SANAD'),
                'version' => config('app.version', '1.0.0'),
            ],
        ]);
    }
}
