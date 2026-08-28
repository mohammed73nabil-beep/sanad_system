<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\Supplier;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SupplierController extends Controller
{
    public function index(Request $request): Response
    {
        $search = $request->input('search');

        $query = Supplier::query();

        if ($search) {
            $query->search($search);
        }

        $suppliers = $query->orderBy('name')->paginate(15)->withQueryString();

        return Inertia::render('Suppliers/Index', [
            'suppliers' => $suppliers,
            'filters'   => [
                'search' => $search,
            ],
            'summary' => [
                'total_suppliers'  => Supplier::count(),
                'total_purchases'  => (float) Supplier::sum('total_purchases'),
                'total_paid'       => (float) Supplier::sum('total_paid'),
                'total_remaining'  => (float) Supplier::sum('total_remaining'),
            ]
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'                => 'required|string|max:255',
            'phone'               => 'nullable|string|max:50',
            'email'               => 'nullable|email|max:255',
            'tax_number'          => 'nullable|string|max:50',
            'commercial_register' => 'nullable|string|max:50',
            'address'             => 'nullable|string',
            'city'                => 'nullable|string|max:100',
            'notes'               => 'nullable|string',
        ], [
            'name.required' => 'يرجى إدخال اسم المورد.',
            'email.email'   => 'صيغة البريد الإلكتروني غير صحيحة.',
        ]);

        $supplier = Supplier::create($validated);

        AuditLog::record('create', "تمت إضافة المورد الجديد: {$supplier->name}", $supplier);

        return redirect()->back()->with('success', 'تمت إضافة المورد بنجاح.');
    }

    public function update(Request $request, Supplier $supplier)
    {
        $validated = $request->validate([
            'name'                => 'required|string|max:255',
            'phone'               => 'nullable|string|max:50',
            'email'               => 'nullable|email|max:255',
            'tax_number'          => 'nullable|string|max:50',
            'commercial_register' => 'nullable|string|max:50',
            'address'             => 'nullable|string',
            'city'                => 'nullable|string|max:100',
            'notes'               => 'nullable|string',
        ], [
            'name.required' => 'يرجى إدخال اسم المورد.',
        ]);

        $supplier->update($validated);

        AuditLog::record('update', "تم تحديث بيانات المورد: {$supplier->name}", $supplier);

        return redirect()->back()->with('success', 'تم تحديث بيانات المورد بنجاح.');
    }

    public function destroy(Supplier $supplier)
    {
        if ($supplier->purchases()->where('status', 'confirmed')->where('remaining_amount', '>', 0)->exists()) {
            return redirect()->back()->with('error', 'لا يمكن حذف المورد لوجود مستحقات ومشتريات غير مسددة.');
        }

        $supplier->delete();
        AuditLog::record('delete', "تم حذف المورد: {$supplier->name}", $supplier);

        return redirect()->back()->with('success', 'تم حذف المورد بنجاح.');
    }
}
