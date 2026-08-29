<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Subscription;
use App\Models\SubscriptionPayment;
use App\Models\User;
use App\Services\SubscriptionService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminPaymentController extends Controller
{
    public function __construct(private SubscriptionService $subscriptionService) {}

    public function index(Request $request): Response
    {
        $query = SubscriptionPayment::with(['user', 'subscription.plan', 'recordedBy']);

        if ($request->search) {
            $query->whereHas('user', fn ($q) => $q->where('name', 'like', "%{$request->search}%"));
        }

        if ($request->status) {
            $query->where('status', $request->status);
        }

        if ($request->from_date) {
            $query->whereDate('payment_date', '>=', $request->from_date);
        }

        if ($request->to_date) {
            $query->whereDate('payment_date', '<=', $request->to_date);
        }

        $payments = $query->latest()->paginate(15)->withQueryString();

        $summary = [
            'total_paid'      => (float) SubscriptionPayment::where('status', 'paid')->sum('amount'),
            'total_unpaid'    => (float) SubscriptionPayment::where('status', 'unpaid')->sum('amount'),
            'this_month'      => (float) SubscriptionPayment::where('status', 'paid')
                ->whereDate('payment_date', '>=', now()->startOfMonth())
                ->sum('amount'),
        ];

        return Inertia::render('Admin/Payments/Index', [
            'payments' => $payments,
            'summary'  => $summary,
            'filters'  => $request->only(['search', 'status', 'from_date', 'to_date']),
            'statuses' => SubscriptionPayment::STATUS_LABELS,
            'methods'  => SubscriptionPayment::METHOD_LABELS,
        ]);
    }

    public function store(Request $request, Subscription $subscription)
    {
        $request->validate([
            'amount'           => 'required|numeric|min:0.01',
            'payment_date'     => 'required|date',
            'payment_method'   => 'required|in:cash,bank_transfer,other',
            'status'           => 'required|in:paid,unpaid',
            'reference_number' => 'nullable|string|max:100',
            'notes'            => 'nullable|string',
        ], [
            'amount.required'       => 'يرجى إدخال مبلغ الدفعة.',
            'payment_date.required' => 'يرجى تحديد تاريخ الدفعة.',
        ]);

        $this->subscriptionService->recordPayment($subscription, $request->all());

        return back()->with('success', 'تم تسجيل الدفعة بنجاح.');
    }

    public function destroy(SubscriptionPayment $payment)
    {
        $payment->delete();
        return back()->with('success', 'تم حذف الدفعة.');
    }
}
