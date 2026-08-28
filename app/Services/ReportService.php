<?php

namespace App\Services;

use App\Models\Customer;
use App\Models\Invoice;
use App\Models\Payment;
use App\Models\Product;
use App\Models\Purchase;
use App\Models\ReceiptVoucher;
use App\Models\Supplier;
use Illuminate\Support\Facades\DB;

class ReportService
{
    /**
     * Sales Report by date range
     */
    public function getSalesReport(?string $fromDate = null, ?string $toDate = null): array
    {
        $query = Invoice::where('status', '!=', Invoice::STATUS_CANCELLED)
            ->where('status', '!=', Invoice::STATUS_DRAFT);

        if ($fromDate) {
            $query->whereDate('issue_date', '>=', $fromDate);
        }
        if ($toDate) {
            $query->whereDate('issue_date', '<=', $toDate);
        }

        $invoices = (clone $query)->with(['customer', 'items'])->orderBy('issue_date', 'desc')->get();

        $totalSales = (float) $invoices->sum('total_amount');
        $totalSubtotal = (float) $invoices->sum('subtotal');
        $totalTax = (float) $invoices->sum('tax_amount');
        $totalDiscount = (float) $invoices->sum('discount_amount');
        $totalPaid = (float) $invoices->sum('paid_amount');
        $totalRemaining = (float) $invoices->sum('remaining_amount');

        return [
            'invoices'        => $invoices,
            'count'           => $invoices->count(),
            'total_sales'     => $totalSales,
            'total_subtotal'  => $totalSubtotal,
            'total_tax'       => $totalTax,
            'total_discount'  => $totalDiscount,
            'total_paid'      => $totalPaid,
            'total_remaining' => $totalRemaining,
            'from_date'       => $fromDate,
            'to_date'         => $toDate,
        ];
    }

    /**
     * Purchases Report by date range
     */
    public function getPurchasesReport(?string $fromDate = null, ?string $toDate = null): array
    {
        $query = Purchase::where('status', 'confirmed');

        if ($fromDate) {
            $query->whereDate('purchase_date', '>=', $fromDate);
        }
        if ($toDate) {
            $query->whereDate('purchase_date', '<=', $toDate);
        }

        $purchases = (clone $query)->with(['supplier', 'items'])->orderBy('purchase_date', 'desc')->get();

        $totalPurchases = (float) $purchases->sum('total_amount');
        $totalSubtotal = (float) $purchases->sum('subtotal');
        $totalTax = (float) $purchases->sum('tax_amount');
        $totalDiscount = (float) $purchases->sum('discount_amount');
        $totalPaid = (float) $purchases->sum('paid_amount');
        $totalRemaining = (float) $purchases->sum('remaining_amount');

        return [
            'purchases'       => $purchases,
            'count'           => $purchases->count(),
            'total_purchases' => $totalPurchases,
            'total_subtotal'  => $totalSubtotal,
            'total_tax'       => $totalTax,
            'total_discount'  => $totalDiscount,
            'total_paid'      => $totalPaid,
            'total_remaining' => $totalRemaining,
            'from_date'       => $fromDate,
            'to_date'         => $toDate,
        ];
    }

    /**
     * Tax Return Report (VAT Report for accountant review)
     */
    public function getTaxReport(?string $fromDate = null, ?string $toDate = null): array
    {
        $salesQuery = Invoice::where('status', '!=', Invoice::STATUS_CANCELLED)
            ->where('status', '!=', Invoice::STATUS_DRAFT);
        $purchaseQuery = Purchase::where('status', 'confirmed');

        if ($fromDate) {
            $salesQuery->whereDate('issue_date', '>=', $fromDate);
            $purchaseQuery->whereDate('purchase_date', '>=', $fromDate);
        }
        if ($toDate) {
            $salesQuery->whereDate('issue_date', '<=', $toDate);
            $purchaseQuery->whereDate('purchase_date', '<=', $toDate);
        }

        $salesTaxable = (float) $salesQuery->sum('subtotal');
        $salesTax = (float) $salesQuery->sum('tax_amount');
        $salesTotal = (float) $salesQuery->sum('total_amount');

        $purchasesTaxable = (float) $purchaseQuery->sum('subtotal');
        $purchasesTax = (float) $purchaseQuery->sum('tax_amount');
        $purchasesTotal = (float) $purchaseQuery->sum('total_amount');

        $netTaxDue = round($salesTax - $purchasesTax, 2);

        return [
            'sales_taxable'     => $salesTaxable,
            'sales_tax'         => $salesTax,
            'sales_total'       => $salesTotal,
            'purchases_taxable' => $purchasesTaxable,
            'purchases_tax'     => $purchasesTax,
            'purchases_total'   => $purchasesTotal,
            'net_tax_due'       => $netTaxDue,
            'from_date'         => $fromDate,
            'to_date'           => $toDate,
            'disclaimer'        => 'هذا التقرير تشغيلي ولا يغني عن مراجعة المحاسب القانوني المختص.',
        ];
    }

    /**
     * Customer Statement of Account
     */
    public function getCustomerStatement(Customer $customer, ?string $fromDate = null, ?string $toDate = null): array
    {
        // 1. Calculate opening balance before $fromDate
        $openingBalance = 0.0;
        if ($fromDate) {
            $priorInvoices = (float) $customer->invoices()
                ->whereNotIn('status', [Invoice::STATUS_CANCELLED, Invoice::STATUS_DRAFT])
                ->whereDate('issue_date', '<', $fromDate)
                ->sum('total_amount');
            
            $priorPayments = (float) $customer->payments()
                ->whereHas('invoice', fn ($q) => $q->whereNotIn('status', [Invoice::STATUS_CANCELLED, Invoice::STATUS_DRAFT]))
                ->whereDate('payment_date', '<', $fromDate)
                ->sum('amount');

            $openingBalance = round($priorInvoices - $priorPayments, 2);
        }

        // 2. Fetch period invoices and payments
        $invQuery = $customer->invoices()
            ->whereNotIn('status', [Invoice::STATUS_CANCELLED, Invoice::STATUS_DRAFT]);
        $payQuery = $customer->payments()
            ->whereHas('invoice', fn ($q) => $q->whereNotIn('status', [Invoice::STATUS_CANCELLED, Invoice::STATUS_DRAFT]));

        if ($fromDate) {
            $invQuery->whereDate('issue_date', '>=', $fromDate);
            $payQuery->whereDate('payment_date', '>=', $fromDate);
        }
        if ($toDate) {
            $invQuery->whereDate('issue_date', '<=', $toDate);
            $payQuery->whereDate('payment_date', '<=', $toDate);
        }

        $invoices = $invQuery->orderBy('issue_date')->get();
        $payments = $payQuery->with('receiptVoucher')->orderBy('payment_date')->get();

        // 3. Merge and sort chronologically for a timeline statement
        $transactions = [];
        foreach ($invoices as $inv) {
            $transactions[] = [
                'type'        => 'invoice',
                'date'        => $inv->issue_date->format('Y-m-d'),
                'reference'   => $inv->invoice_number,
                'description' => "فاتورة مبيعات رقم {$inv->invoice_number}",
                'debit'       => (float) $inv->total_amount, // مدين (على العميل)
                'credit'      => 0.0,
                'status'      => $inv->status_name,
            ];
        }

        foreach ($payments as $pay) {
            $transactions[] = [
                'type'        => 'payment',
                'date'        => $pay->payment_date->format('Y-m-d'),
                'reference'   => $pay->receiptVoucher ? $pay->receiptVoucher->voucher_number : ($pay->reference ?: 'PAY-' . $pay->id),
                'description' => "سداد دفعة ({$pay->payment_method_name})",
                'debit'       => 0.0,
                'credit'      => (float) $pay->amount, // دائن (سددها العميل)
                'status'      => 'مدفوع',
            ];
        }

        usort($transactions, fn ($a, $b) => strcmp($a['date'], $b['date']));

        // Calculate running balance
        $runningBalance = $openingBalance;
        foreach ($transactions as &$tx) {
            $runningBalance += ($tx['debit'] - $tx['credit']);
            $tx['balance'] = round($runningBalance, 2);
        }

        $periodSales = (float) $invoices->sum('total_amount');
        $periodPaid = (float) $payments->sum('amount');
        $closingBalance = round($openingBalance + $periodSales - $periodPaid, 2);

        return [
            'customer'        => $customer,
            'opening_balance' => $openingBalance,
            'period_sales'    => $periodSales,
            'period_paid'     => $periodPaid,
            'closing_balance' => $closingBalance,
            'transactions'    => $transactions,
            'from_date'       => $fromDate,
            'to_date'         => $toDate,
        ];
    }

    /**
     * Comprehensive Accountant Export Data Pack
     */
    public function getAccountantFile(?string $fromDate = null, ?string $toDate = null): array
    {
        $sales = $this->getSalesReport($fromDate, $toDate);
        $purchases = $this->getPurchasesReport($fromDate, $toDate);
        $tax = $this->getTaxReport($fromDate, $toDate);
        
        $receiptsQuery = ReceiptVoucher::query();
        if ($fromDate) $receiptsQuery->whereDate('voucher_date', '>=', $fromDate);
        if ($toDate) $receiptsQuery->whereDate('voucher_date', '<=', $toDate);
        $receipts = $receiptsQuery->with(['customer', 'invoice'])->orderBy('voucher_date', 'desc')->get();

        return [
            'sales'       => $sales,
            'purchases'   => $purchases,
            'tax'         => $tax,
            'receipts'    => $receipts,
            'from_date'   => $fromDate,
            'to_date'     => $toDate,
            'generated_at'=> now()->toDateTimeString(),
        ];
    }
}
