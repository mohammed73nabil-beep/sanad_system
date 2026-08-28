<?php

namespace App\Services;

use App\Models\AuditLog;
use App\Models\Invoice;
use App\Models\InvoiceItem;
use App\Models\Product;
use Exception;
use Illuminate\Support\Facades\DB;

class InvoiceService
{
    protected NumberGeneratorService $numberGenerator;
    protected TaxService $taxService;
    protected InventoryService $inventoryService;
    protected PaymentService $paymentService;
    protected QrCodeService $qrCodeService;

    public function __construct(
        NumberGeneratorService $numberGenerator,
        TaxService $taxService,
        InventoryService $inventoryService,
        PaymentService $paymentService,
        QrCodeService $qrCodeService
    ) {
        $this->numberGenerator = $numberGenerator;
        $this->taxService = $taxService;
        $this->inventoryService = $inventoryService;
        $this->paymentService = $paymentService;
        $this->qrCodeService = $qrCodeService;
    }

    /**
     * Create invoice with items and optional initial payment atomically
     */
    public function createInvoice(array $data, array $items, ?array $initialPayment = null): Invoice
    {
        if (empty($items)) {
            throw new Exception('يجب إضافة منتج واحد على الأقل في الفاتورة.');
        }

        return DB::transaction(function () use ($data, $items, $initialPayment) {
            $invoiceNumber = $this->numberGenerator->generateInvoiceNumber();
            $issueDate = $data['issue_date'] ?? now()->toDateString();
            $status = $data['status'] ?? Invoice::STATUS_ISSUED;

            // 1. Calculate totals from items
            $calculatedItems = [];
            $subtotal = 0.0;
            $totalDiscount = 0.0;
            $totalTax = 0.0;
            $totalAmount = 0.0;

            foreach ($items as $itemData) {
                $product = null;
                if (!empty($itemData['product_id'])) {
                    $product = Product::find($itemData['product_id']);
                }

                if (!$product) {
                    $productName = trim($itemData['name'] ?? ($itemData['product_name'] ?? 'بضاعة مبيعات'));
                    $qty = (float) $itemData['quantity'];
                    $salePrice = (float) ($itemData['unit_price'] ?? 0);
                    $product = Product::firstOrCreate(
                        ['name' => $productName],
                        [
                            'sku'             => $this->numberGenerator->generateSku(),
                            'purchase_price'  => round($salePrice * 0.8, 2),
                            'sale_price'      => $salePrice,
                            'tax_rate'        => (float) ($itemData['tax_rate'] ?? 15.0),
                            'stock_quantity'  => $qty, // ensure initial stock covers the sale
                            'min_stock_level' => 5,
                            'status'          => 'active',
                        ]
                    );
                }

                $qty = (float) $itemData['quantity'];
                $unitPrice = isset($itemData['unit_price']) ? (float) $itemData['unit_price'] : (float) $product->sale_price;
                $discPercent = (float) ($itemData['discount_percent'] ?? 0);
                $taxRate = isset($itemData['tax_rate']) ? (float) $itemData['tax_rate'] : (float) $product->tax_rate;

                if ($qty <= 0) {
                    throw new Exception("الكمية للمنتج ({$product->name}) يجب أن تكون أكبر من صفر.");
                }

                $calcs = $this->taxService->calculateItemTotals($qty, $unitPrice, $discPercent, $taxRate);

                $calculatedItems[] = [
                    'product' => $product,
                    'calcs'   => $calcs,
                ];

                $subtotal += $calcs['subtotal'];
                $totalDiscount += $calcs['discount_amount'];
                $totalTax += $calcs['tax_amount'];
                $totalAmount += $calcs['total'];
            }

            // 2. Create Invoice record
            $invoice = Invoice::create([
                'invoice_number'   => $invoiceNumber,
                'type'             => 'sale',
                'status'           => $status,
                'customer_id'      => $data['customer_id'],
                'issue_date'       => $issueDate,
                'due_date'         => $data['due_date'] ?? null,
                'subtotal'         => round($subtotal, 2),
                'discount_amount'  => round($totalDiscount, 2),
                'tax_amount'       => round($totalTax, 2),
                'total_amount'     => round($totalAmount, 2),
                'paid_amount'      => 0.00,
                'remaining_amount' => round($totalAmount, 2),
                'payment_method'   => $data['payment_method'] ?? 'cash',
                'notes'            => $data['notes'] ?? null,
                'is_tax_inclusive' => $data['is_tax_inclusive'] ?? false,
                'created_by'       => auth()->id(),
            ]);

            // 3. Create invoice items & update inventory if issued
            foreach ($calculatedItems as $calcItem) {
                $product = $calcItem['product'];
                $c = $calcItem['calcs'];

                InvoiceItem::create([
                    'invoice_id'       => $invoice->id,
                    'product_id'       => $product->id,
                    'product_name'     => $product->name,
                    'product_sku'      => $product->sku,
                    'barcode'          => $product->barcode,
                    'quantity'         => $c['quantity'],
                    'unit_price'       => $c['unit_price'],
                    'discount_percent' => $c['discount_percent'],
                    'discount_amount'  => $c['discount_amount'],
                    'tax_rate'         => $c['tax_rate'],
                    'tax_amount'       => $c['tax_amount'],
                    'subtotal'         => $c['subtotal'],
                    'total'            => $c['total'],
                ]);

                // If invoice is issued right away, deduct stock
                if ($status !== Invoice::STATUS_DRAFT) {
                    $this->inventoryService->decreaseStock(
                        $product,
                        $c['quantity'],
                        'invoice',
                        $invoice->id,
                        "فاتورة مبيعات رقم {$invoice->invoice_number}"
                    );
                }
            }

            // 4. Generate QR code payload
            $qrData = $this->qrCodeService->generateForInvoice($invoice);
            $invoice->update(['qr_data' => $qrData]);

            // 5. Record initial payment if specified
            if (!empty($initialPayment) && (float) ($initialPayment['amount'] ?? 0) > 0) {
                $payAmount = (float) $initialPayment['amount'];
                $payMethod = $initialPayment['payment_method'] ?? $invoice->payment_method ?? 'cash';
                $createReceipt = $initialPayment['create_receipt_voucher'] ?? true;

                $this->paymentService->recordInvoicePayment(
                    $invoice,
                    $payAmount,
                    $payMethod,
                    $issueDate,
                    $initialPayment['reference'] ?? null,
                    $initialPayment['notes'] ?? 'دفعة أولى عند إنشاء الفاتورة',
                    $createReceipt
                );
            } else {
                // Just update customer balance
                $this->paymentService->recalculateCustomerBalances($invoice->customer);
            }

            AuditLog::record(
                'create',
                "تم إنشاء الفاتورة رقم {$invoice->invoice_number} للعميل {$invoice->customer->name} بمبلغ {$invoice->total_amount} ر.س",
                $invoice
            );

            return $invoice->fresh(['items', 'customer', 'payments', 'receiptVouchers']);
        });
    }

    /**
     * Cancel an issued invoice and rollback inventory
     */
    public function cancelInvoice(Invoice $invoice, ?string $reason = null): Invoice
    {
        if ($invoice->status === Invoice::STATUS_CANCELLED) {
            throw new Exception('الفاتورة ملغاة بالفعل.');
        }

        return DB::transaction(function () use ($invoice, $reason) {
            // Restore inventory for each item
            if ($invoice->status !== Invoice::STATUS_DRAFT) {
                foreach ($invoice->items as $item) {
                    if ($item->product) {
                        $this->inventoryService->increaseStock(
                            $item->product,
                            (float) $item->quantity,
                            (float) $item->unit_price,
                            'invoice',
                            $invoice->id,
                            "إلغاء الفاتورة رقم {$invoice->invoice_number}" . ($reason ? " ({$reason})" : '')
                        );
                    }
                }
            }

            $invoice->update([
                'status' => Invoice::STATUS_CANCELLED,
                'notes'  => $invoice->notes ? $invoice->notes . "\n[سبب الإلغاء: " . $reason . "]" : "[سبب الإلغاء: " . $reason . "]",
            ]);

            $this->paymentService->recalculateCustomerBalances($invoice->customer);

            AuditLog::record(
                'cancel',
                "تم إلغاء الفاتورة رقم {$invoice->invoice_number}",
                $invoice
            );

            return $invoice;
        });
    }
}
