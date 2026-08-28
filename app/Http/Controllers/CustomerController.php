<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\Customer;
use App\Services\PdfService;
use App\Services\ReportService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CustomerController extends Controller
{
    protected ReportService $reportService;
    protected PdfService $pdfService;

    public function __construct(ReportService $reportService, PdfService $pdfService)
    {
        $this->reportService = $reportService;
        $this->pdfService = $pdfService;
    }

    public function index(Request $request): Response
    {
        $search = $request->input('search');
        $filterDebt = $request->boolean('with_debt');

        $query = Customer::query();

        if ($search) {
            $query->search($search);
        }

        if ($filterDebt) {
            $query->withDebt();
        }

        $customers = $query->orderBy('name')->paginate(15)->withQueryString();

        return Inertia::render('Customers/Index', [
            'customers' => $customers,
            'filters'   => [
                'search'    => $search,
                'with_debt' => $filterDebt,
            ],
            'summary' => [
                'total_customers' => Customer::count(),
                'total_sales'     => (float) Customer::sum('total_sales'),
                'total_paid'      => (float) Customer::sum('total_paid'),
                'total_remaining' => (float) Customer::sum('total_remaining'),
            ]
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'                => 'required|string|max:255',
            'type'                => 'required|in:individual,business',
            'phone'               => 'nullable|string|max:50',
            'email'               => 'nullable|email|max:255',
            'address'             => 'nullable|string',
            'city'                => 'nullable|string|max:100',
            'tax_number'          => 'nullable|string|max:50',
            'commercial_register' => 'nullable|string|max:50',
            'notes'               => 'nullable|string',
        ], [
            'name.required' => 'يرجى إدخال اسم العميل أو المحل.',
            'type.required' => 'يرجى اختيار نوع العميل.',
            'email.email'   => 'صيغة البريد الإلكتروني غير صحيحة.',
        ]);

        $customer = Customer::create($validated);

        AuditLog::record('create', "تم إضافة العميل الجديد: {$customer->name}", $customer);

        return redirect()->back()->with('success', 'تمت إضافة العميل بنجاح.');
    }

    public function update(Request $request, Customer $customer)
    {
        $validated = $request->validate([
            'name'                => 'required|string|max:255',
            'type'                => 'required|in:individual,business',
            'phone'               => 'nullable|string|max:50',
            'email'               => 'nullable|email|max:255',
            'address'             => 'nullable|string',
            'city'                => 'nullable|string|max:100',
            'tax_number'          => 'nullable|string|max:50',
            'commercial_register' => 'nullable|string|max:50',
            'notes'               => 'nullable|string',
        ], [
            'name.required' => 'يرجى إدخال اسم العميل أو المحل.',
        ]);

        $customer->update($validated);

        AuditLog::record('update', "تم تحديث بيانات العميل: {$customer->name}", $customer);

        return redirect()->back()->with('success', 'تم تحديث بيانات العميل بنجاح.');
    }

    public function destroy(Customer $customer)
    {
        if ($customer->invoices()->where('remaining_amount', '>', 0)->exists()) {
            return redirect()->back()->with('error', 'لا يمكن حذف العميل لوجود فواتير غير مدفوعة ومستحقات مالية.');
        }

        $customer->delete();
        AuditLog::record('delete', "تم حذف العميل: {$customer->name}", $customer);

        return redirect()->back()->with('success', 'تم حذف العميل بنجاح.');
    }

    /**
     * Account Statement View
     */
    public function statement(Request $request, Customer $customer): Response
    {
        $fromDate = $request->input('from_date');
        $toDate = $request->input('to_date');

        $statement = $this->reportService->getCustomerStatement($customer, $fromDate, $toDate);

        return Inertia::render('Customers/Statement', [
            'statement' => $statement,
        ]);
    }

    /**
     * Account Statement PDF
     */
    public function statementPdf(Request $request, Customer $customer)
    {
        $fromDate = $request->input('from_date');
        $toDate = $request->input('to_date');

        $statement = $this->reportService->getCustomerStatement($customer, $fromDate, $toDate);
        $pdf = $this->pdfService->generateCustomerStatementPdf($statement);

        return $pdf->download("كشف_حساب_{$customer->name}.pdf");
    }
}
