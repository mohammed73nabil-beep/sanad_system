<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\CompanySetting;
use App\Models\Customer;
use App\Models\Invoice;
use App\Models\ReceiptVoucher;
use App\Services\PdfService;
use App\Services\ReceiptService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ReceiptVoucherController extends Controller
{
    protected ReceiptService $receiptService;
    protected PdfService $pdfService;

    public function __construct(ReceiptService $receiptService, PdfService $pdfService)
    {
        $this->receiptService = $receiptService;
        $this->pdfService = $pdfService;
    }

    public function index(Request $request): Response
    {
        $search = $request->input('search');
        $customerId = $request->input('customer_id');
        $fromDate = $request->input('from_date');
        $toDate = $request->input('to_date');

        $query = ReceiptVoucher::with(['customer', 'invoice']);

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('voucher_number', 'like', "%{$search}%")
                  ->orWhere('reference', 'like', "%{$search}%")
                  ->orWhereHas('customer', fn ($sq) => $sq->where('name', 'like', "%{$search}%"))
                  ->orWhereHas('invoice', fn ($iq) => $iq->where('invoice_number', 'like', "%{$search}%"));
            });
        }

        if ($customerId) {
            $query->where('customer_id', $customerId);
        }

        if ($fromDate) {
            $query->whereDate('voucher_date', '>=', $fromDate);
        }

        if ($toDate) {
            $query->whereDate('voucher_date', '<=', $toDate);
        }

        $vouchers = $query->orderBy('voucher_date', 'desc')->paginate(15)->withQueryString();

        return Inertia::render('ReceiptVouchers/Index', [
            'vouchers'  => $vouchers,
            'customers' => Customer::active()->orderBy('name')->get(),
            'filters'   => [
                'search'      => $search,
                'customer_id' => $customerId,
                'from_date'   => $fromDate,
                'to_date'     => $toDate,
            ],
            'summary' => [
                'total_vouchers' => ReceiptVoucher::count(),
                'total_amount'   => (float) ReceiptVoucher::sum('amount'),
            ]
        ]);
    }

    public function show(ReceiptVoucher $receiptVoucher): Response
    {
        $receiptVoucher->load(['customer', 'invoice', 'payment', 'creator']);

        return Inertia::render('ReceiptVouchers/Show', [
            'voucher' => $receiptVoucher,
            'company' => CompanySetting::getOrCreate(),
        ]);
    }

    public function pdf(ReceiptVoucher $receiptVoucher)
    {
        $pdf = $this->pdfService->generateReceiptVoucherPdf($receiptVoucher);
        return $pdf->download("سند_قبض_{$receiptVoucher->voucher_number}.pdf");
    }
}
