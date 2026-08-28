<?php

namespace App\Services;

use App\Models\Customer;
use App\Models\Invoice;
use App\Models\Payment;
use App\Models\ReceiptVoucher;
use App\Models\Supplier;
use Exception;
use Illuminate\Support\Facades\DB;

class PaymentService
{
    /**
     * Record a payment for an invoice and update all related balances
     */
    public function recordInvoicePayment(
        Invoice $invoice,
        float $amount,
        string $paymentMethod = 'cash',
        ?string $paymentDate = null,
        ?string $reference = null,
        ?string $notes = null,
        bool $createReceiptVoucher = true
    ): Payment {
        if ($amount <= 0) {
            throw new Exception('مبلغ الدفعة يجب أن يكون أكبر من صفر.');
        }

        if ($amount > (float) $invoice->remaining_amount) {
            throw new Exception("مبلغ الدفعة ({$amount}) يتجاوز المبلغ المتبقي على الفاتورة ({$invoice->remaining_amount}).");
        }

        return DB::transaction(function () use ($invoice, $amount, $paymentMethod, $paymentDate, $reference, $notes, $createReceiptVoucher) {
            $paymentDate = $paymentDate ?? now()->toDateString();

            $payment = Payment::create([
                'invoice_id'     => $invoice->id,
                'customer_id'    => $invoice->customer_id,
                'amount'         => $amount,
                'payment_method' => $paymentMethod,
                'payment_date'   => $paymentDate,
                'reference'      => $reference,
                'notes'          => $notes,
                'created_by'     => auth()->id(),
            ]);

            // Create linked receipt voucher if requested
            if ($createReceiptVoucher) {
                $receiptService = app(ReceiptService::class);
                $receiptService->createFromPayment($payment);
            }

            // Recalculate invoice balances and status
            $this->recalculateInvoiceBalances($invoice);

            // Recalculate customer balances
            $this->recalculateCustomerBalances($invoice->customer);

            return $payment;
        });
    }

    /**
     * Recalculate invoice balances and state
     */
    public function recalculateInvoiceBalances(Invoice $invoice): void
    {
        $invoice = Invoice::where('id', $invoice->id)->lockForUpdate()->first();
        
        $totalPaid = (float) $invoice->payments()->sum('amount');
        $totalAmount = (float) $invoice->total_amount;
        $remaining = round(max(0, $totalAmount - $totalPaid), 2);

        $status = $invoice->status;
        if ($status !== Invoice::STATUS_CANCELLED && $status !== Invoice::STATUS_DRAFT) {
            if ($remaining <= 0 && $totalAmount > 0) {
                $status = Invoice::STATUS_PAID;
            } elseif ($totalPaid > 0 && $remaining > 0) {
                $status = Invoice::STATUS_PARTIALLY_PAID;
            } elseif ($invoice->is_overdue) {
                $status = Invoice::STATUS_OVERDUE;
            } else {
                $status = Invoice::STATUS_ISSUED;
            }
        }

        $invoice->update([
            'paid_amount'      => $totalPaid,
            'remaining_amount' => $remaining,
            'status'           => $status,
        ]);
    }

    /**
     * Recalculate customer balances
     */
    public function recalculateCustomerBalances(Customer $customer): void
    {
        $customer = Customer::where('id', $customer->id)->lockForUpdate()->first();
        
        // Exclude cancelled and draft invoices
        $activeInvoices = $customer->invoices()
            ->whereNotIn('status', [Invoice::STATUS_CANCELLED, Invoice::STATUS_DRAFT]);

        $totalSales = (float) $activeInvoices->sum('total_amount');
        $totalPaid = (float) $customer->payments()->whereHas('invoice', function ($q) {
            $q->whereNotIn('status', [Invoice::STATUS_CANCELLED, Invoice::STATUS_DRAFT]);
        })->sum('amount');
        
        $totalRemaining = round(max(0, $totalSales - $totalPaid), 2);

        $customer->update([
            'total_sales'     => $totalSales,
            'total_paid'      => $totalPaid,
            'total_remaining' => $totalRemaining,
        ]);
    }

    /**
     * Recalculate supplier balances
     */
    public function recalculateSupplierBalances(Supplier $supplier): void
    {
        $supplier = Supplier::where('id', $supplier->id)->lockForUpdate()->first();
        
        $activePurchases = $supplier->purchases()->where('status', 'confirmed');
        $totalPurchases = (float) $activePurchases->sum('total_amount');
        $totalPaid = (float) $activePurchases->sum('paid_amount');
        $totalRemaining = round(max(0, $totalPurchases - $totalPaid), 2);

        $supplier->update([
            'total_purchases' => $totalPurchases,
            'total_paid'      => $totalPaid,
            'total_remaining' => $totalRemaining,
        ]);
    }
}
