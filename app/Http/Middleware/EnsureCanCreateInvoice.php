<?php

namespace App\Http\Middleware;

use App\Models\Subscription;
use Closure;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response;

class EnsureCanCreateInvoice
{
    /**
     * يُطبق فقط على عملية إنشاء فاتورة جديدة (POST /invoices)
     * العميل يستطيع مشاهدة بياناته وفواتيره حتى بعد انتهاء الاشتراك
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (!$user || $user->isSuperAdmin()) {
            return $next($request);
        }

        if (!$user->canCreateInvoice()) {
            $sub = $user->getCurrentSubscription();

            $message = 'لا يمكن إنشاء فاتورة جديدة.';

            if (!$sub) {
                $message = 'لا يوجد اشتراك نشط. يرجى التواصل مع مدير النظام لتفعيل اشتراكك.';
            } elseif ($sub->status === Subscription::STATUS_EXPIRED) {
                $message = 'انتهت مدة اشتراكك. يرجى تجديد الاشتراك للمتابعة.';
            } elseif ($sub->status === Subscription::STATUS_SUSPENDED) {
                $message = 'اشتراكك معلق حالياً. يرجى التواصل مع مدير النظام.';
            } elseif ($sub->getRealInvoicesUsed() >= $sub->invoice_limit) {
                $message = "لقد وصلت إلى الحد المسموح من الفواتير ({$sub->invoice_limit} فاتورة) في باقتك الحالية. يرجى تجديد الاشتراك أو الترقية.";
            }

            if ($request->expectsJson() || $request->header('X-Inertia')) {
                // لـ Inertia POST requests - إرجاع خطأ يُعرض في الواجهة
                return back()->with('error', $message);
            }

            return redirect()->route('invoices.index')->with('error', $message);
        }

        return $next($request);
    }
}
