<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Plan;
use App\Models\Subscription;
use App\Models\User;
use App\Services\SubscriptionService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminSubscriptionController extends Controller
{
    public function __construct(private SubscriptionService $subscriptionService) {}

    public function index(Request $request): Response
    {
        $this->subscriptionService->expireOverdueSubscriptions();

        $query = Subscription::with(['user', 'plan'])
            ->when($request->status, fn ($q) => $q->where('status', $request->status))
            ->when($request->plan_id, fn ($q) => $q->where('plan_id', $request->plan_id))
            ->when($request->search, fn ($q) => $q->whereHas('user', fn ($uq) => $uq->where('name', 'like', "%{$request->search}%")));

        $subscriptions = $query->latest()->paginate(15)->withQueryString();

        return Inertia::render('Admin/Subscriptions/Index', [
            'subscriptions' => $subscriptions,
            'plans'         => Plan::active()->get(),
            'statuses'      => Subscription::STATUS_LABELS,
            'filters'       => $request->only(['search', 'status', 'plan_id']),
        ]);
    }

    public function create(Request $request): Response
    {
        $selectedCustomer = $request->customer_id ? User::find($request->customer_id) : null;

        return Inertia::render('Admin/Subscriptions/Create', [
            'customers' => User::customers()->active()->orderBy('name')->get(['id', 'name', 'email']),
            'plans'     => Plan::active()->get(),
            'selected_customer' => $selectedCustomer,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'user_id'       => 'required|exists:users,id',
            'plan_id'       => 'nullable|exists:plans,id',
            'start_date'    => 'required|date',
            'end_date'      => 'nullable|date|after_or_equal:start_date',
            'duration_days' => 'nullable|integer|min:1',
            'status'        => 'required|in:trial,active,suspended',
            'invoice_limit' => 'nullable|integer|min:1',
            'price'         => 'nullable|numeric|min:0',
            'payment_status'=> 'required|in:paid,unpaid',
            'notes'         => 'nullable|string',
        ], [
            'user_id.required'    => 'يرجى اختيار العميل.',
            'start_date.required' => 'يرجى تحديد تاريخ البداية.',
            'status.required'     => 'يرجى تحديد حالة الاشتراك.',
        ]);

        $user = User::findOrFail($request->user_id);
        if ($user->isSuperAdmin()) {
            return back()->with('error', 'لا يمكن إنشاء اشتراك لحساب مشرف النظام.');
        }

        // حساب end_date من duration_days إذا لم يُحدد
        if (!$request->end_date && $request->duration_days) {
            $request->merge([
                'end_date' => Carbon::parse($request->start_date)->addDays($request->duration_days)->toDateString()
            ]);
        }

        $subscription = $this->subscriptionService->create($request->except('duration_days'));

        if ($request->status === 'active') {
            $this->subscriptionService->activate($subscription);
        }

        return redirect()->route('admin.subscriptions.show', $subscription->id)
            ->with('success', 'تم إنشاء الاشتراك بنجاح.');
    }

    public function show(Subscription $subscription): Response
    {
        $subscription->load(['user', 'plan', 'payments.recordedBy', 'renewals.renewedBy', 'createdBy']);
        $subscription->checkAndExpire();
        $subscription->refresh();

        return Inertia::render('Admin/Subscriptions/Show', [
            'subscription'    => $subscription,
            'real_used'       => $subscription->getRealInvoicesUsed(),
            'status_labels'   => Subscription::STATUS_LABELS,
        ]);
    }

    public function edit(Subscription $subscription): Response
    {
        $subscription->load('user', 'plan');
        return Inertia::render('Admin/Subscriptions/Edit', [
            'subscription' => $subscription,
            'plans'        => Plan::active()->get(),
        ]);
    }

    public function update(Request $request, Subscription $subscription)
    {
        $request->validate([
            'invoice_limit' => 'required|integer|min:1',
            'end_date'      => 'required|date',
            'notes'         => 'nullable|string',
        ]);

        $subscription->update($request->only(['invoice_limit', 'end_date', 'notes']));

        return redirect()->route('admin.subscriptions.show', $subscription->id)
            ->with('success', 'تم تحديث الاشتراك بنجاح.');
    }

    public function activate(Subscription $subscription)
    {
        $this->subscriptionService->activate($subscription);
        return back()->with('success', 'تم تفعيل الاشتراك بنجاح.');
    }

    public function suspend(Request $request, Subscription $subscription)
    {
        $this->subscriptionService->suspend($subscription, $request->reason);
        return back()->with('success', 'تم تعليق الاشتراك بنجاح.');
    }

    public function cancel(Request $request, Subscription $subscription)
    {
        $this->subscriptionService->cancel($subscription, $request->reason);
        return back()->with('success', 'تم إلغاء الاشتراك بنجاح.');
    }

    public function renew(Request $request, Subscription $subscription)
    {
        $request->validate([
            'days'  => 'required|integer|min:1',
            'price' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string',
        ], [
            'days.required' => 'يرجى تحديد عدد أيام التمديد.',
        ]);

        $renewal = $this->subscriptionService->renew(
            $subscription,
            $request->days,
            $request->price ?? 0,
            $request->notes
        );

        return redirect()->route('admin.subscriptions.show', $subscription->id)
            ->with('success', "تم تمديد الاشتراك {$request->days} يوماً بنجاح.");
    }
}
