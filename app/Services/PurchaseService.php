<?php

namespace App\Services;

use App\Models\AuditLog;
use App\Models\Product;
use App\Models\Purchase;
use App\Models\PurchaseItem;
use Exception;
use Illuminate\Support\Facades\DB;

class PurchaseService
{
    protected NumberGeneratorService $numberGenerator;
    protected TaxService $taxService;
    protected InventoryService $inventoryService;
    protected PaymentService $paymentService;

    public function __construct(
        NumberGeneratorService $numberGenerator,
        TaxService $taxService,
        InventoryService $inventoryService,
        PaymentService $paymentService
    ) {
        $this->numberGenerator = $numberGenerator;
        $this->taxService = $taxService;
        $this->inventoryService = $inventoryService;
        $this->paymentService = $paymentService;
    }

    /**
     * Create a purchase invoice with items and optional immediate confirmation
     */
    public function createPurchase(array $data, array $items, bool $autoConfirm = true): Purchase
    {
        if (empty($items)) {
            throw new Exception('يجب إضافة منتج واحد على الأقل في فاتورة الشراء.');
        }

        return DB::transaction(function () use ($data, $items, $autoConfirm) {
            $purchaseNumber = $this->numberGenerator->generatePurchaseNumber();
            $purchaseDate = $data['purchase_date'] ?? now()->toDateString();
            $status = $autoConfirm ? 'confirmed' : ($data['status'] ?? 'draft');

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
                    $productName = trim($itemData['name'] ?? ($itemData['product_name'] ?? 'بضاعة مشتراة'));
                    $product = Product::firstOrCreate(
                        ['name' => $productName],
                        [
                            'sku'             => $this->numberGenerator->generateSku(),
                            'purchase_price'  => (float) $itemData['unit_price'],
                            'sale_price'      => round((float) $itemData['unit_price'] * 1.25, 2),
                            'tax_rate'        => (float) ($itemData['tax_rate'] ?? 15.0),
                            'stock_quantity'  => 0,
                            'min_stock_level' => 5,
                            'status'          => 'active',
                        ]
                    );
                }

                $qty = (float) $itemData['quantity'];
                $unitPrice = (float) $itemData['unit_price'];
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

            $paidAmount = isset($data['paid_amount']) ? (float) $data['paid_amount'] : 0.0;
            $remainingAmount = max(0, $totalAmount - $paidAmount);

            // 2. Create Purchase record
            $purchase = Purchase::create([
                'purchase_number'         => $purchaseNumber,
                'supplier_id'             => $data['supplier_id'],
                'status'                  => $status,
                'purchase_date'           => $purchaseDate,
                'due_date'                => $data['due_date'] ?? null,
                'subtotal'                => round($subtotal, 2),
                'discount_amount'         => round($totalDiscount, 2),
                'tax_amount'              => round($totalTax, 2),
                'total_amount'            => round($totalAmount, 2),
                'paid_amount'             => round($paidAmount, 2),
                'remaining_amount'        => round($remainingAmount, 2),
                'supplier_invoice_number' => $data['supplier_invoice_number'] ?? null,
                'attachment_path'         => $data['attachment_path'] ?? null,
                'notes'                   => $data['notes'] ?? null,
                'created_by'              => auth()->id(),
            ]);

            // 3. Create items and increase stock if confirmed
            foreach ($calculatedItems as $calcItem) {
                $product = $calcItem['product'];
                $c = $calcItem['calcs'];

                PurchaseItem::create([
                    'purchase_id'      => $purchase->id,
                    'product_id'       => $product->id,
                    'product_name'     => $product->name,
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

                if ($status === 'confirmed') {
                    $this->inventoryService->increaseStock(
                        $product,
                        $c['quantity'],
                        $c['unit_price'],
                        'purchase',
                        $purchase->id,
                        "فاتورة مشتريات رقم {$purchase->purchase_number}"
                    );
                }
            }

            // Update supplier balance
            $this->paymentService->recalculateSupplierBalances($purchase->supplier);

            AuditLog::record(
                'create',
                "تم تسجيل فاتورة شراء رقم {$purchase->purchase_number} من المورد {$purchase->supplier->name} بمبلغ {$purchase->total_amount} ر.س",
                $purchase
            );

            return $purchase->fresh(['items', 'supplier']);
        });
    }

    /**
     * Confirm a draft purchase invoice and increment stock
     */
    public function confirmPurchase(Purchase $purchase): Purchase
    {
        if ($purchase->status === 'confirmed') {
            throw new Exception('فاتورة الشراء معتمدة بالفعل.');
        }

        return DB::transaction(function () use ($purchase) {
            foreach ($purchase->items as $item) {
                if ($item->product) {
                    $this->inventoryService->increaseStock(
                        $item->product,
                        (float) $item->quantity,
                        (float) $item->unit_price,
                        'purchase',
                        $purchase->id,
                        "اعتماد فاتورة شراء رقم {$purchase->purchase_number}"
                    );
                }
            }

            $purchase->update(['status' => 'confirmed']);
            $this->paymentService->recalculateSupplierBalances($purchase->supplier);

            AuditLog::record(
                'confirm',
                "تم اعتماد فاتورة الشراء رقم {$purchase->purchase_number}",
                $purchase
            );

            return $purchase;
        });
    }
}
