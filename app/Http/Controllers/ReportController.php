<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\Invoice;
use App\Models\Product;
use App\Models\Purchase;
use App\Models\ReceiptVoucher;
use App\Models\Supplier;
use App\Services\PdfService;
use App\Services\ReportService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class ReportController extends Controller
{
    protected ReportService $reportService;
    protected PdfService $pdfService;

    public function __construct(ReportService $reportService, PdfService $pdfService)
    {
        $this->reportService = $reportService;
        $this->pdfService = $pdfService;
    }

    public function sales(Request $request): Response
    {
        $fromDate = $request->input('from_date');
        $toDate = $request->input('to_date');

        $data = $this->reportService->getSalesReport($fromDate, $toDate);

        return Inertia::render('Reports/Sales', [
            'report' => $data,
        ]);
    }

    public function purchases(Request $request): Response
    {
        $fromDate = $request->input('from_date');
        $toDate = $request->input('to_date');

        $data = $this->reportService->getPurchasesReport($fromDate, $toDate);

        return Inertia::render('Reports/Purchases', [
            'report' => $data,
        ]);
    }

    public function tax(Request $request): Response
    {
        $fromDate = $request->input('from_date');
        $toDate = $request->input('to_date');

        $data = $this->reportService->getTaxReport($fromDate, $toDate);

        return Inertia::render('Reports/Tax', [
            'report' => $data,
        ]);
    }

    public function customers(): Response
    {
        $customers = Customer::orderBy('total_remaining', 'desc')->get();

        return Inertia::render('Reports/Customers', [
            'customers' => $customers,
            'summary'   => [
                'total_sales'     => (float) Customer::sum('total_sales'),
                'total_paid'      => (float) Customer::sum('total_paid'),
                'total_remaining' => (float) Customer::sum('total_remaining'),
            ]
        ]);
    }

    public function suppliers(): Response
    {
        $suppliers = Supplier::orderBy('total_remaining', 'desc')->get();

        return Inertia::render('Reports/Suppliers', [
            'suppliers' => $suppliers,
            'summary'   => [
                'total_purchases' => (float) Supplier::sum('total_purchases'),
                'total_paid'      => (float) Supplier::sum('total_paid'),
                'total_remaining' => (float) Supplier::sum('total_remaining'),
            ]
        ]);
    }

    public function inventory(): Response
    {
        $products = Product::with(['category', 'unit'])->orderBy('name')->get();
        $totalValuation = (float) Product::select(DB::raw('SUM(stock_quantity * purchase_price) as val'))->value('val');

        return Inertia::render('Reports/Inventory', [
            'products'        => $products,
            'total_valuation' => round($totalValuation, 2),
        ]);
    }

    public function profits(Request $request): Response
    {
        $fromDate = $request->input('from_date', now()->startOfMonth()->toDateString());
        $toDate = $request->input('to_date', now()->endOfMonth()->toDateString());

        $invoices = Invoice::whereNotIn('status', [Invoice::STATUS_CANCELLED, Invoice::STATUS_DRAFT])
            ->whereBetween('issue_date', [$fromDate, $toDate])
            ->get();

        $totalRevenue = (float) $invoices->sum('subtotal');

        $totalCogs = (float) DB::table('invoice_items')
            ->join('invoices', 'invoice_items.invoice_id', '=', 'invoices.id')
            ->join('products', 'invoice_items.product_id', '=', 'products.id')
            ->whereNotIn('invoices.status', [Invoice::STATUS_CANCELLED, Invoice::STATUS_DRAFT])
            ->whereBetween('invoices.issue_date', [$fromDate, $toDate])
            ->select(DB::raw('SUM(invoice_items.quantity * products.purchase_price) as cost'))
            ->value('cost');

        $grossProfit = round($totalRevenue - $totalCogs, 2);
        $profitMargin = $totalRevenue > 0 ? round(($grossProfit / $totalRevenue) * 100, 2) : 0;

        return Inertia::render('Reports/Profits', [
            'report' => [
                'total_revenue' => $totalRevenue,
                'total_cogs'    => $totalCogs,
                'gross_profit'  => $grossProfit,
                'profit_margin' => $profitMargin,
                'from_date'     => $fromDate,
                'to_date'       => $toDate,
            ]
        ]);
    }

    public function receipts(Request $request): Response
    {
        $fromDate = $request->input('from_date');
        $toDate = $request->input('to_date');

        $query = ReceiptVoucher::with(['customer', 'invoice']);
        if ($fromDate) $query->whereDate('voucher_date', '>=', $fromDate);
        if ($toDate) $query->whereDate('voucher_date', '<=', $toDate);

        $vouchers = $query->orderBy('voucher_date', 'desc')->get();

        return Inertia::render('Reports/Receipts', [
            'vouchers'     => $vouchers,
            'total_amount' => (float) $vouchers->sum('amount'),
            'filters'      => ['from_date' => $fromDate, 'to_date' => $toDate],
        ]);
    }

    /**
     * Accountant Comprehensive Pack View
     */
    public function accountant(Request $request): Response
    {
        $fromDate = $request->input('from_date', now()->startOfMonth()->toDateString());
        $toDate = $request->input('to_date', now()->endOfMonth()->toDateString());

        $fileData = $this->reportService->getAccountantFile($fromDate, $toDate);

        return Inertia::render('Reports/Accountant', [
            'data' => $fileData,
        ]);
    }

    /**
     * Accountant PDF Export
     */
    public function accountantPdf(Request $request)
    {
        $fromDate = $request->input('from_date', now()->startOfMonth()->toDateString());
        $toDate = $request->input('to_date', now()->endOfMonth()->toDateString());

        $fileData = $this->reportService->getAccountantFile($fromDate, $toDate);
        $pdf = $this->pdfService->generateAccountantReportPdf($fileData);

        return $pdf->download("ملف_المحاسب_{$fromDate}_إلى_{$toDate}.pdf");
    }

    /**
     * Accountant Excel / CSV Export
     */
    public function accountantExcel(Request $request)
    {
        $fromDate = $request->input('from_date', now()->startOfMonth()->toDateString());
        $toDate = $request->input('to_date', now()->endOfMonth()->toDateString());

        $fileData = $this->reportService->getAccountantFile($fromDate, $toDate);

        $headers = [
            'Content-Type'        => 'text/csv; charset=UTF-8',
            'Content-Disposition' => "attachment; filename=\"accountant_report_{$fromDate}_{$toDate}.csv\"",
        ];

        $callback = function () use ($fileData) {
            $file = fopen('php://output', 'w');
            fputs($file, "\xEF\xBB\xBF"); // UTF-8 BOM for Excel Arabic support

            fputcsv($file, ['تقرير المحاسب - نظام سَنَد']);
            fputcsv($file, ['الفترة من', $fileData['from_date'] ?? 'الكل', 'إلى', $fileData['to_date'] ?? 'الكل']);
            fputcsv($file, []);

            fputcsv($file, ['ملخص الضرائب والعمليات']);
            fputcsv($file, ['البيان', 'المبلغ (ر.س)']);
            fputcsv($file, ['إجمالي المبيعات الخاضعة للضريبة', $fileData['tax']['sales_taxable']]);
            fputcsv($file, ['ضريبة المبيعات', $fileData['tax']['sales_tax']]);
            fputcsv($file, ['إجمالي المشتريات الخاضعة للضريبة', $fileData['tax']['purchases_taxable']]);
            fputcsv($file, ['ضريبة المشتريات', $fileData['tax']['purchases_tax']]);
            fputcsv($file, ['صافي الضريبة المستحقة للتقديم', $fileData['tax']['net_tax_due']]);
            fputcsv($file, []);

            fputcsv($file, ['سجل فواتير المبيعات']);
            fputcsv($file, ['رقم الفاتورة', 'العميل', 'التاريخ', 'المجموع', 'الخصم', 'الضريبة', 'الإجمالي', 'المدفوع', 'المتبقي', 'الحالة']);
            foreach ($fileData['sales']['invoices'] as $inv) {
                fputcsv($file, [
                    $inv->invoice_number,
                    $inv->customer ? $inv->customer->name : '—',
                    $inv->issue_date->format('Y-m-d'),
                    $inv->subtotal,
                    $inv->discount_amount,
                    $inv->tax_amount,
                    $inv->total_amount,
                    $inv->paid_amount,
                    $inv->remaining_amount,
                    $inv->status_name,
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}
