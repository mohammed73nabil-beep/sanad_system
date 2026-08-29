<?php

namespace App\Models;

use App\Models\Concerns\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;

class InventoryMovement extends Model
{
    use BelongsToTenant;

    protected $fillable = [
        'user_id', 'product_id', 'type', 'quantity', 'quantity_before', 'quantity_after',
        'unit_cost', 'reference_type', 'reference_id', 'notes', 'created_by',
    ];

    protected function casts(): array
    {
        return [
            'quantity'        => 'decimal:2',
            'quantity_before' => 'decimal:2',
            'quantity_after'  => 'decimal:2',
            'unit_cost'       => 'decimal:2',
        ];
    }

    // -------------------------------------------------------------------
    // العلاقات
    // -------------------------------------------------------------------

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    // Polymorphic: Invoice أو Purchase
    public function reference()
    {
        return $this->morphTo(__FUNCTION__, 'reference_type', 'reference_id');
    }

    // -------------------------------------------------------------------
    // Accessors
    // -------------------------------------------------------------------

    public function getTypeNameAttribute(): string
    {
        return match($this->type) {
            'purchase'   => 'شراء',
            'sale'       => 'بيع',
            'adjustment' => 'تعديل',
            'return'     => 'مرتجع',
            default      => $this->type,
        };
    }

    public function getIsIncrementAttribute(): bool
    {
        return in_array($this->type, ['purchase', 'return']);
    }
}
