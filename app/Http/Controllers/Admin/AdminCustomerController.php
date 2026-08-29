<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\CompanySetting;
use App\Models\Subscription;
use App\Models\User;
use App\Services\SubscriptionService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

class AdminCustomerController extends Controller
{
    public function __construct(private SubscriptionService $subscriptionService) {}

    public function index(Request $request): Response
    {
        $this->subscriptionService->expireOverdueSubscriptions();

        $query = User::customers()->with('latestSubscription.plan');

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if ($status = $request->input('status')) {
            // فلترة حسب حالة الاشتراك
            $query->whereHas('subscriptions', fn ($q) => $q->where('status', $status)->latest());
        }

        $customers = $query->latest()->paginate(15)->withQueryString();

        // إضافة معلومات الاشتراك لكل عميل
        $customers->through(fn ($user) => [
            'id'         => $user->id,
            'name'       => $user->name,
            'email'      => $user->email,
            'phone'      => $user->phone ?? null,
            'role'       => $user->role,
            'is_active'  => $user->is_active,
            'created_at' => $user->created_at->format('Y-m-d'),
            'subscription' => $user->latestSubscription ? [
                'id'              => $user->latestSubscription->id,
                'plan_name'       => $user->latestSubscription->plan?->name ?? 'مخصص',
                'status'          => $user->latestSubscription->status,
                'status_label'    => $user->latestSubscription->status_label,
                'start_date'      => $user->latestSubscription->start_date->format('Y-m-d'),
                'end_date'        => $user->latestSubscription->end_date->format('Y-m-d'),
                'invoice_limit'   => $user->latestSubscription->invoice_limit,
                'invoices_used'   => $user->latestSubscription->getRealInvoicesUsed(),
                'days_remaining'  => $user->latestSubscription->daysRemaining(),
            ] : null,
        ]);

        return Inertia::render('Admin/Customers/Index', [
            'customers' => $customers,
            'filters'   => ['search' => $request->search, 'status' => $request->status],
            'statuses'  => Subscription::STATUS_LABELS,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Admin/Customers/Create');
    }

    public function store(Request $request)
    {
        $request->validate([
            'name'                => 'required|string|max:255',
            'email'               => 'required|email|unique:users,email',
            'phone'               => 'nullable|string|max:20',
            'password'            => ['required', Password::min(8)],
            // بيانات المنشأة
            'company_name'        => 'nullable|string|max:255',
            'commercial_register' => 'nullable|string|max:50',
            'tax_number'          => 'nullable|string|max:50',
            'address'             => 'nullable|string',
            'city'                => 'nullable|string|max:100',
        ], [
            'name.required'    => 'يرجى إدخال الاسم.',
            'email.required'   => 'يرجى إدخال البريد الإلكتروني.',
            'email.unique'     => 'البريد الإلكتروني مستخدم مسبقاً.',
            'password.required'=> 'يرجى إدخال كلمة المرور.',
        ]);

        $user = User::create([
            'name'      => $request->name,
            'email'     => $request->email,
            'phone'     => $request->phone,
            'password'  => Hash::make($request->password),
            'role'      => 'owner',
            'is_active' => true,
        ]);

        // إنشاء إعدادات المنشأة إذا وُجدت بيانات
        if ($request->company_name) {
            CompanySetting::create([
                'user_id'             => $user->id,
                'name'                => $request->company_name,
                'commercial_register' => $request->commercial_register,
                'tax_number'          => $request->tax_number,
                'address'             => $request->address,
                'city'                => $request->city,
                'currency'            => 'SAR',
                'currency_symbol'     => 'ر.س',
                'default_tax_rate'    => 15.00,
                'invoice_prefix'      => 'INV',
                'purchase_prefix'     => 'PUR',
                'receipt_prefix'      => 'RCV',
            ]);
        }

        AuditLog::record('customer_created', "إنشاء عميل جديد: {$user->name} ({$user->email})", $user);

        return redirect()->route('admin.customers.show', $user->id)
            ->with('success', "تم إنشاء حساب العميل {$user->name} بنجاح.");
    }

    public function show(User $customer): Response
    {
        $customer->load(['latestSubscription.plan', 'subscriptions.plan', 'subscriptions.payments', 'companySetting']);

        $invoiceCount = \App\Models\Invoice::where('created_by', $customer->id)
            ->whereNotIn('status', [\App\Models\Invoice::STATUS_CANCELLED, \App\Models\Invoice::STATUS_DRAFT])
            ->count();

        return Inertia::render('Admin/Customers/Show', [
            'customer'      => $customer,
            'invoice_count' => $invoiceCount,
        ]);
    }

    public function edit(User $customer): Response
    {
        $customer->load('companySetting');
        return Inertia::render('Admin/Customers/Edit', ['customer' => $customer]);
    }

    public function update(Request $request, User $customer)
    {
        // حماية: لا يمكن تعيين super_admin عبر هذا الـ endpoint
        $request->validate([
            'name'                => 'required|string|max:255',
            'email'               => "required|email|unique:users,email,{$customer->id}",
            'phone'               => 'nullable|string|max:20',
            'company_name'        => 'nullable|string|max:255',
            'commercial_register' => 'nullable|string|max:50',
            'tax_number'          => 'nullable|string|max:50',
            'address'             => 'nullable|string',
            'city'                => 'nullable|string|max:100',
        ]);

        $old = $customer->only(['name', 'email', 'phone']);

        $customer->update([
            'name'  => $request->name,
            'email' => $request->email,
            'phone' => $request->phone,
        ]);

        // تحديث بيانات المنشأة
        if ($request->company_name) {
            CompanySetting::updateOrCreate(
                ['user_id' => $customer->id],
                [
                    'name'                => $request->company_name,
                    'commercial_register' => $request->commercial_register,
                    'tax_number'          => $request->tax_number,
                    'address'             => $request->address,
                    'city'                => $request->city,
                ]
            );
        }

        AuditLog::record('customer_updated', "تعديل بيانات العميل: {$customer->name}", $customer, $old, $request->only(['name', 'email', 'phone']));

        return redirect()->route('admin.customers.show', $customer->id)
            ->with('success', 'تم تحديث بيانات العميل بنجاح.');
    }

    public function suspend(User $customer)
    {
        if ($customer->isSuperAdmin()) {
            abort(403, 'لا يمكن تعطيل حساب مشرف النظام.');
        }

        $customer->update(['is_active' => false]);

        AuditLog::record('customer_suspended', "تعطيل حساب العميل: {$customer->name}", $customer);

        return back()->with('success', 'تم تعطيل حساب العميل.');
    }

    public function activate(User $customer)
    {
        $customer->update(['is_active' => true]);

        AuditLog::record('customer_activated', "تفعيل حساب العميل: {$customer->name}", $customer);

        return back()->with('success', 'تم تفعيل حساب العميل.');
    }

    /**
     * Impersonate: الدخول إلى لوحة العميل بصلاحيات Super Admin
     */
    public function impersonate(Request $request, User $customer)
    {
        if ($customer->isSuperAdmin()) {
            abort(403, 'لا يمكن انتحال صفة مشرف النظام.');
        }

        // حفظ هوية Super Admin في الجلسة
        $request->session()->put('impersonating_admin_id', auth()->id());
        $request->session()->put('impersonating_customer_id', $customer->id);

        AuditLog::record(
            'admin_impersonated_customer',
            "دخل Super Admin إلى لوحة العميل: {$customer->name} (IP: {$request->ip()})",
            $customer
        );

        // تسجيل الدخول بهوية العميل
        auth()->login($customer);

        return redirect()->route('dashboard')->with('warning', "أنت الآن تعمل بصلاحيات حساب {$customer->name}. اضغط 'إنهاء الجلسة' للعودة.");
    }

    /**
     * إنهاء انتحال الصفة والعودة إلى حساب Super Admin
     */
    public function stopImpersonating(Request $request)
    {
        $adminId = $request->session()->pull('impersonating_admin_id');
        $request->session()->forget('impersonating_customer_id');

        if ($adminId) {
            $admin = User::find($adminId);
            if ($admin && $admin->isSuperAdmin()) {
                auth()->login($admin);
                return redirect()->route('admin.dashboard')->with('success', 'تم العودة إلى حسابك كمشرف نظام.');
            }
        }

        return redirect()->route('login');
    }
}
