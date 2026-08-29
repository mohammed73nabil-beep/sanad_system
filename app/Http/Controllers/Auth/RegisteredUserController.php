<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\CompanySetting;
use App\Models\Plan;
use App\Models\Subscription;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    /**
     * عرض صفحة إنشاء حساب عميل جديد
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Register', [
            'plans' => Plan::active()->get(['id', 'name', 'price', 'duration_days', 'invoice_limit', 'description']),
        ]);
    }

    /**
     * معالجة طلب تسجيل عميل جديد
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name'         => ['required', 'string', 'max:255'],
            'company_name' => ['required', 'string', 'max:255'],
            'email'        => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'phone'        => ['nullable', 'string', 'max:20'],
            'password'     => ['required', 'confirmed', Rules\Password::defaults()],
        ], [
            'name.required'         => 'يرجى إدخال اسم المسؤول.',
            'company_name.required' => 'يرجى إدخال اسم المنشأة / المحل.',
            'email.required'        => 'يرجى إدخال البريد الإلكتروني.',
            'email.email'           => 'صيغة البريد الإلكتروني غير صحيحة.',
            'email.unique'          => 'هذا البريد الإلكتروني مسجل مسبقاً في النظام.',
            'password.required'     => 'يرجى إدخال كلمة المرور.',
            'password.min'          => 'كلمة المرور يجب ألا تقل عن 8 أحرف.',
            'password.confirmed'    => 'تأكيد كلمة المرور غير متطابق.',
        ]);

        $user = DB::transaction(function () use ($request) {
            // 1. إنشاء حساب المستخدم كمالك للمنشأة (Owner)
            $user = User::create([
                'name'      => $request->name,
                'email'     => $request->email,
                'phone'     => $request->phone,
                'password'  => Hash::make($request->password),
                'role'      => 'owner',
                'is_active' => true,
            ]);

            // 2. إنشاء إعدادات المنشأة الخاصة به
            CompanySetting::create([
                'user_id'          => $user->id,
                'name'             => $request->company_name,
                'phone'            => $request->phone,
                'email'            => $request->email,
                'currency'         => 'SAR',
                'currency_symbol'  => 'ر.س',
                'default_tax_rate' => 15.00,
                'invoice_prefix'   => 'INV',
                'purchase_prefix'  => 'PUR',
                'receipt_prefix'   => 'RCV',
                'invoice_counter'  => 0,
                'purchase_counter' => 0,
                'receipt_counter'  => 0,
            ]);

            // 3. تفعيل فترة تجريبية مجانية (14 يوماً مع 50 فاتورة)
            $firstPlan = Plan::first();
            Subscription::create([
                'user_id'        => $user->id,
                'plan_id'        => $firstPlan?->id,
                'start_date'     => now()->toDateString(),
                'end_date'       => now()->addDays(14)->toDateString(),
                'status'         => Subscription::STATUS_TRIAL,
                'invoice_limit'  => 50,
                'invoices_used'  => 0,
                'price'          => 0.00,
                'payment_status' => 'paid',
                'created_by'     => $user->id,
            ]);

            // 4. تسجيل في سجل النشاطات
            AuditLog::record(
                'customer_registered',
                "تسجيل حساب تاجر جديد: {$user->name} — المنشأة: {$request->company_name}",
                $user
            );

            return $user;
        });

        Auth::login($user);

        return redirect(route('dashboard'))->with('success', 'مرحباً بك في سَنَد! تم إنشاء حسابك وتفعيل الفترة التجريبية المجانية بنجاح.');
    }
}
