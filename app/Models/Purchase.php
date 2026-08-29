<?php

namespace App\Models;

use App\Models\Concerns\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Purchase extends Model
{
    use SoftDeletes, BelongsToTenant;

    protected $fillable = [
        'user_id', 'purchase_number', 'supplier_id', 'status',
        'purchase_date', 'due_date',
        'subtotal', 'discount_amount', 'tax_amount', 'total_amount',
        'paid_amount', 'remaining_amount',
        'supplier_invoice_number', 'attachment_path', 'notes', 'created_by',
    ];

    protected function casts(): array
    {
        return [
            'purchase_date'   => 'date',
            'due_date'        => 'date',
            'subtotal'        => 'decimal:2',
            'discount_amount' => 'decimal:2',
            'tax_amount'      => 'decimal:2',
            'total_amount'    => 'decimal:2',
            'paid_amount'     => 'decimal:2',
            'remaining_amount'=> 'decimal:2',
        ];
    }

    // -------------------------------------------------------------------
    // العلاقات
    // -------------------------------------------------------------------

    public function supplier()
    {
        return $this->belongsTo(Supplier::class);
    }

    public function items()
    {
        return $this->hasMany(PurchaseItem::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function attachments()
    {
        return $this->morphMany(Attachment::class, 'attachable');
    }

    // -------------------------------------------------------------------
    // Scopes
    // -------------------------------------------------------------------

    public function scopeConfirmed($query)
    {
        return $query->where('status', 'confirmed');
    }

    public function scopeSearch($query, string $term)
    {
        return $query->where(function ($q) use ($term) {
            $q->where('purchase_number', 'like', "%{$term}%")
              ->orWhereHas('supplier', fn ($sq) => $sq->where('name', 'like', "%{$term}%"));
        });
    }
}
