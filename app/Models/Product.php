<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Product extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'name', 'sku', 'barcode', 'category_id', 'unit_id',
        'purchase_price', 'sale_price', 'tax_rate',
        'stock_quantity', 'min_stock_level',
        'image_path', 'description', 'status',
    ];

    protected function casts(): array
    {
        return [
            'purchase_price'  => 'decimal:2',
            'sale_price'      => 'decimal:2',
            'tax_rate'        => 'decimal:2',
            'stock_quantity'  => 'decimal:2',
            'min_stock_level' => 'decimal:2',
        ];
    }

    // -------------------------------------------------------------------
    // العلاقات
    // -------------------------------------------------------------------

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function unit()
    {
        return $this->belongsTo(Unit::class);
    }

    public function invoiceItems()
    {
        return $this->hasMany(InvoiceItem::class);
    }

    public function purchaseItems()
    {
        return $this->hasMany(PurchaseItem::class);
    }

    public function inventoryMovements()
    {
        return $this->hasMany(InventoryMovement::class);
    }

    // -------------------------------------------------------------------
    // Accessors
    // -------------------------------------------------------------------

    /**
     * حالة المخزون
     */
    public function getStockStatusAttribute(): string
    {
        if ($this->stock_quantity <= 0) {
            return 'empty';
        }
        if ($this->stock_quantity <= $this->min_stock_level) {
            return 'low';
        }
        return 'available';
    }

    public function getStockStatusNameAttribute(): string
    {
        return match($this->stock_status) {
            'empty'     => 'نفد',
            'low'       => 'منخفض',
            'available' => 'متوفر',
            default     => 'غير معروف',
        };
    }

    // -------------------------------------------------------------------
    // Scopes
    // -------------------------------------------------------------------

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeLowStock($query)
    {
        return $query->whereColumn('stock_quantity', '<=', 'min_stock_level')
                     ->where('stock_quantity', '>', 0);
    }

    public function scopeOutOfStock($query)
    {
        return $query->where('stock_quantity', '<=', 0);
    }

    public function scopeSearch($query, string $term)
    {
        return $query->where(function ($q) use ($term) {
            $q->where('name', 'like', "%{$term}%")
              ->orWhere('sku', 'like', "%{$term}%")
              ->orWhere('barcode', 'like', "%{$term}%");
        });
    }
}
