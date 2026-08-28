<?php

namespace App\Http\Controllers;

use App\Models\CompanySetting;
use App\Models\Customer;
use App\Models\Invoice;
use App\Models\Product;
use App\Services\InvoiceService;
use App\Services\PdfService;
use App\Services\TaxService;
use Exception;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class InvoiceController extends Controller
{
    protected InvoiceService $invoiceService;
    protected PdfService $pdfService;
    protected TaxService $taxService;

    public function __construct(
        InvoiceService $invoiceService,
        PdfService $pdfService,
        TaxService $taxService
    ) {
        $this->invoiceService = $invoiceService;
        $this->pdfService = $pdfService;
        $this->taxService = $taxService;
    }

    public function index(Request $request): Response
    {
        $search = $request->input('search');
        $status = $request->input('status');
        $customerId = $request->input('customer_id');
        $fromDate = $request->input('from_date');
        $toDate = $request->input('to_date');

        $query = Invoice::with(['customer', 'items']);

        if ($search) {
            $query->search($search);
        }

        if ($status) {
            $query->where('status', $status);
        }

        if ($customerId) {
            $query->where('customer_id', $customerId);
        }

        if ($fromDate) {
            $query->whereDate('issue_date', '>=', $fromDate);
        }

        if ($toDate) {
            $query->whereDate('issue_date', '<=', $toDate);
        }

        $invoices = $query->orderBy('issue_date', 'desc')->paginate(15)->withQueryString();

        return Inertia::render('Invoices/Index', [
            'invoices'  => $invoices,
            'customers' => Customer::active()->orderBy('name')->get(),
            'filters'   => [
                'search'      => $search,
                'status'      => $status,
                'customer_id' => $customerId,
                'from_date'   => $fromDate,
                'to_date'     => $toDate,
            ],
            'summary' => [
                'total_invoices' => Invoice::where('status', '!=', Invoice::STATUS_CANCELLED)->count(),
                'total_sales'    => (float) Invoice::whereNotIn('status', [Invoice::STATUS_CANCELLED, Invoice::STATUS_DRAFT])->sum('total_amount'),
                'total_paid'     => (float) Invoice::whereNotIn('status', [Invoice::STATUS_CANCELLED, Invoice::STATUS_DRAFT])->sum('paid_amount'),
                'total_due'      => (float) Invoice::whereNotIn('status', [Invoice::STATUS_CANCELLED, Invoice::STATUS_DRAFT])->sum('remaining_amount'),
            ]
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Invoices/Create', [
            'customers'        => Customer::active()->orderBy('name')->get(),
            'products'         => Product::active()->with('unit')->orderBy('name')->get(),
            'default_tax_rate' => $this->taxService->getDefaultTaxRate(),
            'company'          => CompanySetting::getOrCreate(),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'customer_id'                 => 'required|exists:customers,id',
            'issue_date'                  => 'required|date',
            'due_date'                    => 'nullable|date|after_or_equal:issue_date',
            'payment_method'              => 'required|in:cash,bank,card,other',
            'notes'                       => 'nullable|string',
            'items'                       => 'required|array|min:1',
            'items.*.product_id'          => 'nullable',
            'items.*.name'                => 'nullable|string|max:255',
            'items.*.quantity'            => 'required|numeric|min:0.01',
            'items.*.unit_price'          => 'required|numeric|min:0',
            'items.*.discount_percent'    => 'nullable|numeric|min:0|max:100',
            'items.*.tax_rate'            => 'nullable|numeric|min:0|max:100',
            'initial_payment'             => 'nullable|array',
            'initial_payment.amount'      => 'nullable|numeric|min:0',
        ], [
            'customer_id.required'        => 'يرجى اختيار العميل.',
            'issue_date.required'         => 'يرجى تحديد تاريخ الإصدار.',
            'items.required'              => 'يجب إضافة منتج واحد على الأقل.',
            'items.min'                   => 'يجب إضافة منتج واحد على الأقل.',
            'items.*.quantity.min'        => 'الكمية يجب أن تكون أكبر من صفر.',
            'items.*.unit_price.required' => 'يرجى تحديد سعر المنتج.',
        ]);

        try {
            $invoice = $this->invoiceService->createInvoice(
                $request->only(['customer_id', 'issue_date', 'due_date', 'payment_method', 'notes', 'is_tax_inclusive', 'status']),
                $request->input('items', []),
                $request->input('initial_payment')
            );

            return redirect()->route('invoices.show', $invoice->id)->with('success', 'تم إنشاء وإصدار الفاتورة بنجاح.');
        } catch (Exception $e) {
            return redirect()->back()->withInput()->with('error', $e->getMessage());
        }
    }

    public function show(Invoice $invoice): Response
    {
        $invoice->load(['customer', 'items.product.unit', 'payments.receiptVoucher', 'receiptVouchers', 'creator']);

        return Inertia::render('Invoices/Show', [
            'invoice' => $invoice,
            'company' => CompanySetting::getOrCreate(),
        ]);
    }

    public function cancel(Request $request, Invoice $invoice)
    {
        $request->validate(['reason' => 'nullable|string|max:255']);

        try {
            $this->invoiceService->cancelInvoice($invoice, $request->input('reason'));
            return redirect()->back()->with('success', 'تم إلغاء الفاتورة وإعادة المنتجات إلى المخزون بنجاح.');
        } catch (Exception $e) {
            return redirect()->back()->with('error', $e->getMessage());
        }
    }

    public function pdf(Invoice $invoice)
    {
        $pdf = $this->pdfService->generateInvoicePdf($invoice);
        return $pdf->download("فاتورة_{$invoice->invoice_number}.pdf");
    }

    public function print(Invoice $invoice)
    {
        $invoice->load(['customer', 'items', 'payments']);
        $company = CompanySetting::getOrCreate();

        return view('pdf.invoice_print', [
            'invoice' => $invoice,
            'company' => $company,
        ]);
    }
}
