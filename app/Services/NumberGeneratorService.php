<?php

namespace App\Services;

use App\Models\CompanySetting;
use App\Models\Invoice;
use App\Models\Product;
use App\Models\Purchase;
use App\Models\ReceiptVoucher;
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
            
            $counter = (int) $settings->invoice_counter;
            do {
                $counter++;
                $number = sprintf('%s-%06d', $prefix, $counter);
            } while (Invoice::withoutTenantScope()->where('invoice_number', $number)->exists());

            $settings->update(['invoice_counter' => $counter]);
            
            return $number;
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
            
            $counter = (int) $settings->purchase_counter;
            do {
                $counter++;
                $number = sprintf('%s-%06d', $prefix, $counter);
            } while (Purchase::withoutTenantScope()->where('purchase_number', $number)->exists());

            $settings->update(['purchase_counter' => $counter]);
            
            return $number;
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
            
            $counter = (int) $settings->receipt_counter;
            do {
                $counter++;
                $number = sprintf('%s-%06d', $prefix, $counter);
            } while (ReceiptVoucher::withoutTenantScope()->where('voucher_number', $number)->exists());

            $settings->update(['receipt_counter' => $counter]);
            
            return $number;
        });
    }

    /**
     * Generate unique SKU for a product (e.g. PRD-1005)
     */
    public function generateSku(): string
    {
        $maxId = Product::withoutTenantScope()->max('id') ?? 0;
        $next = $maxId + 1;
        $sku = sprintf('PRD-%04d', $next);
        while (Product::withoutTenantScope()->where('sku', $sku)->exists()) {
            $next++;
            $sku = sprintf('PRD-%04d', $next);
        }
        return $sku;
    }
}
