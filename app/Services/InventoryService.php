<?php

namespace App\Services;

use App\Models\InventoryMovement;
use App\Models\Product;
use Exception;
use Illuminate\Support\Facades\DB;

class InventoryService
{
    /**
     * Increase product stock (e.g. from purchase)
     */
    public function increaseStock(
        Product $product,
        float $quantity,
        float $unitCost,
        string $referenceType,
        int $referenceId,
        ?string $notes = null
    ): InventoryMovement {
        return DB::transaction(function () use ($product, $quantity, $unitCost, $referenceType, $referenceId, $notes) {
            $product = Product::where('id', $product->id)->lockForUpdate()->first();
            
            $before = (float) $product->stock_quantity;
            $after = $before + $quantity;

            $product->update([
                'stock_quantity' => $after,
                'purchase_price' => $unitCost > 0 ? $unitCost : $product->purchase_price,
            ]);

            return InventoryMovement::create([
                'product_id'      => $product->id,
                'type'            => 'purchase',
                'quantity'        => $quantity,
                'quantity_before' => $before,
                'quantity_after'  => $after,
                'unit_cost'       => $unitCost,
                'reference_type'  => $referenceType,
                'reference_id'    => $referenceId,
                'notes'           => $notes,
                'created_by'      => auth()->id(),
            ]);
        });
    }

    /**
     * Decrease product stock (e.g. from sale/invoice)
     * Throws exception if stock is insufficient
     */
    public function decreaseStock(
        Product $product,
        float $quantity,
        string $referenceType,
        int $referenceId,
        ?string $notes = null,
        bool $allowNegative = false
    ): InventoryMovement {
        return DB::transaction(function () use ($product, $quantity, $referenceType, $referenceId, $notes, $allowNegative) {
            $product = Product::where('id', $product->id)->lockForUpdate()->first();
            
            $before = (float) $product->stock_quantity;
            
            if (!$allowNegative && $before < $quantity) {
                throw new Exception("الكمية المطلوبة ({$quantity}) غير متوفرة في المخزون للمنتج ({$product->name}). المتوفر: ({$before})");
            }

            $after = $before - $quantity;

            $product->update([
                'stock_quantity' => $after,
            ]);

            return InventoryMovement::create([
                'product_id'      => $product->id,
                'type'            => 'sale',
                'quantity'        => $quantity,
                'quantity_before' => $before,
                'quantity_after'  => $after,
                'unit_cost'       => (float) $product->purchase_price,
                'reference_type'  => $referenceType,
                'reference_id'    => $referenceId,
                'notes'           => $notes,
                'created_by'      => auth()->id(),
            ]);
        });
    }
}
