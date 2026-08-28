<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PurchaseItem extends Model
{
    protected $fillable = [
        'purchase_id', 'product_id', 'product_name', 'barcode',
        'quantity', 'unit_price', 'discount_percent', 'discount_amount',
        'tax_rate', 'tax_amount', 'subtotal', 'total',
    ];

    protected function casts(): array
    {
        return [
            'quantity'         => 'decimal:2',
            'unit_price'       => 'decimal:2',
            'discount_percent' => 'decimal:2',
            'discount_amount'  => 'decimal:2',
            'tax_rate'         => 'decimal:2',
            'tax_amount'       => 'decimal:2',
            'subtotal'         => 'decimal:2',
            'total'            => 'decimal:2',
        ];
    }

    public function purchase()
    {
        return $this->belongsTo(Purchase::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
