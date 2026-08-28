<?php

namespace App\Services;

use App\Models\CompanySetting;
use App\Models\Product;
use Illuminate\Support\Facades\DB;

class NumberGeneratorService
{
    /**
     * Generate unique sequential invoice number (e.g. INV-000001)
     */
    public function generateInvoiceNumber(): string
    {
        return DB::transaction(function () {
            $settings = CompanySetting::getOrCreate();
            $prefix = $settings->invoice_prefix ?: 'INV';
            
            // Increment counter safely
            $settings->increment('invoice_counter');
            $counter = $settings->fresh()->invoice_counter;
            
            return sprintf('%s-%06d', $prefix, $counter);
        });
    }

    /**
     * Generate unique sequential purchase number (e.g. PUR-000001)
     */
    public function generatePurchaseNumber(): string
    {
        return DB::transaction(function () {
            $settings = CompanySetting::getOrCreate();
            $prefix = $settings->purchase_prefix ?: 'PUR';
            
            $settings->increment('purchase_counter');
            $counter = $settings->fresh()->purchase_counter;
            
            return sprintf('%s-%06d', $prefix, $counter);
        });
    }

    /**
     * Generate unique sequential receipt voucher number (e.g. RCV-000001)
     */
    public function generateReceiptNumber(): string
    {
        return DB::transaction(function () {
            $settings = CompanySetting::getOrCreate();
            $prefix = $settings->receipt_prefix ?: 'RCV';
            
            $settings->increment('receipt_counter');
            $counter = $settings->fresh()->receipt_counter;
            
            return sprintf('%s-%06d', $prefix, $counter);
        });
    }

    /**
     * Generate unique SKU for a product (e.g. PRD-1005)
     */
    public function generateSku(): string
    {
        $maxId = Product::max('id') ?? 0;
        $next = $maxId + 1;
        $sku = sprintf('PRD-%04d', $next);
        while (Product::where('sku', $sku)->exists()) {
            $next++;
            $sku = sprintf('PRD-%04d', $next);
        }
        return $sku;
    }
}
