<?php

namespace App\Services;

use App\Models\CompanySetting;

class TaxService
{
    /**
     * Get default company tax rate (e.g. 15.00)
     */
    public function getDefaultTaxRate(): float
    {
        $settings = CompanySetting::getOrCreate();
        return (float) ($settings->default_tax_rate ?? 15.00);
    }

    /**
     * Calculate line item totals
     *
     * @param float $quantity
     * @param float $unitPrice
     * @param float $discountPercent
     * @param float|null $taxRate
     * @return array
     */
    public function calculateItemTotals(
        float $quantity,
        float $unitPrice,
        float $discountPercent = 0.0,
        ?float $taxRate = null
    ): array {
        $taxRate = $taxRate ?? $this->getDefaultTaxRate();
        
        $grossSubtotal = round($quantity * $unitPrice, 2);
        $discountAmount = round($grossSubtotal * ($discountPercent / 100), 2);
        $subtotal = round($grossSubtotal - $discountAmount, 2);
        
        $taxAmount = round($subtotal * ($taxRate / 100), 2);
        $total = round($subtotal + $taxAmount, 2);

        return [
            'quantity'         => $quantity,
            'unit_price'       => $unitPrice,
            'discount_percent' => $discountPercent,
            'discount_amount'  => $discountAmount,
            'subtotal'         => $subtotal,
            'tax_rate'         => $taxRate,
            'tax_amount'       => $taxAmount,
            'total'            => $total,
        ];
    }
}
