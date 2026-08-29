<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Plan;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminPlanController extends Controller
{
    public function index(): Response
    {
        $plans = Plan::withTrashed()
            ->withCount('subscriptions')
            ->orderByDesc('is_active')
            ->orderBy('price')
            ->get();

        return Inertia::render('Admin/Plans/Index', ['plans' => $plans]);
    }

    public function create(): Response
    {
        return Inertia::render('Admin/Plans/Form', ['plan' => null]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name'          => 'required|string|max:255',
            'description'   => 'nullable|string',
            'price'         => 'required|numeric|min:0',
            'duration_days' => 'required|integer|min:1',
            'invoice_limit' => 'required|integer|min:1',
            'is_active'     => 'boolean',
        ], [
            'name.required'          => 'يرجى إدخال اسم الباقة.',
            'price.required'         => 'يرجى إدخال سعر الباقة.',
            'duration_days.required' => 'يرجى إدخال مدة الباقة.',
            'invoice_limit.required' => 'يرجى إدخال حد الفواتير.',
        ]);

        $plan = Plan::create($request->only(['name', 'description', 'price', 'duration_days', 'invoice_limit', 'is_active']));

        AuditLog::record('plan_created', "إنشاء باقة جديدة: {$plan->name} - {$plan->price} ر.س", $plan);

        return redirect()->route('admin.plans.index')->with('success', "تم إنشاء الباقة '{$plan->name}' بنجاح.");
    }

    public function edit(Plan $plan): Response
    {
        return Inertia::render('Admin/Plans/Form', ['plan' => $plan]);
    }

    public function update(Request $request, Plan $plan)
    {
        $request->validate([
            'name'          => 'required|string|max:255',
            'description'   => 'nullable|string',
            'price'         => 'required|numeric|min:0',
            'duration_days' => 'required|integer|min:1',
            'invoice_limit' => 'required|integer|min:1',
            'is_active'     => 'boolean',
        ]);

        $old = $plan->only(['name', 'price', 'duration_days', 'invoice_limit']);
        $plan->update($request->only(['name', 'description', 'price', 'duration_days', 'invoice_limit', 'is_active']));

        AuditLog::record('plan_updated', "تعديل الباقة: {$plan->name}", $plan, $old);

        return redirect()->route('admin.plans.index')->with('success', 'تم تحديث الباقة بنجاح.');
    }

    public function destroy(Plan $plan)
    {
        if (!$plan->canBeDeleted()) {
            return back()->with('error', 'لا يمكن حذف هذه الباقة لأنها مرتبطة باشتراكات موجودة.');
        }

        $plan->delete();

        AuditLog::record('plan_deleted', "حذف الباقة: {$plan->name}", $plan);

        return redirect()->route('admin.plans.index')->with('success', 'تم حذف الباقة بنجاح.');
    }

    public function toggle(Plan $plan)
    {
        $plan->update(['is_active' => !$plan->is_active]);
        $status = $plan->is_active ? 'تفعيل' : 'تعطيل';

        AuditLog::record('plan_toggled', "{$status} الباقة: {$plan->name}", $plan);

        return back()->with('success', "تم {$status} الباقة بنجاح.");
    }
}
