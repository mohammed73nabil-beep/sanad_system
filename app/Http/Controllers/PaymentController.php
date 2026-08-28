<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\Invoice;
use App\Models\Payment;
use App\Services\PaymentService;
use Exception;
use Illuminate\Http\Request;

class PaymentController extends Controller
{
    protected PaymentService $paymentService;

    public function __construct(PaymentService $paymentService)
    {
        $this->paymentService = $paymentService;
    }

    /**
     * Store payment for an invoice
     */
    public function storeForInvoice(Request $request, Invoice $invoice)
    {
        $request->validate([
            'amount'                 => 'required|numeric|min:0.01',
            'payment_method'         => 'required|in:cash,bank,card,other',
            'payment_date'           => 'required|date',
            'reference'              => 'nullable|string|max:100',
            'notes'                  => 'nullable|string',
            'create_receipt_voucher' => 'boolean',
        ], [
            'amount.required' => 'يرجى إدخال مبلغ الدفعة.',
            'amount.min'      => 'مبلغ الدفعة يجب أن يكون أكبر من صفر.',
        ]);

        try {
            $payment = $this->paymentService->recordInvoicePayment(
                $invoice,
                (float) $request->input('amount'),
                $request->input('payment_method'),
                $request->input('payment_date'),
                $request->input('reference'),
                $request->input('notes'),
                $request->boolean('create_receipt_voucher', true)
            );

            AuditLog::record(
                'payment',
                "تم تسجيل دفعة بمبلغ {$payment->amount} ر.س للفاتورة رقم {$invoice->invoice_number}",
                $invoice
            );

            return redirect()->back()->with('success', 'تم تسجيل الدفعة وإصدار سند القبض بنجاح.');
        } catch (Exception $e) {
            return redirect()->back()->with('error', $e->getMessage());
        }
    }
}
