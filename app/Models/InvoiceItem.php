<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class InvoiceItem extends Model
{
    protected $fillable = [
        'invoice_id', 'product_id', 'product_name', 'product_sku', 'barcode',
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

    public function invoice()
    {
        return $this->belongsTo(Invoice::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
