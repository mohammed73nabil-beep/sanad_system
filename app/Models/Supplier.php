<?php

namespace App\Models;

use App\Models\Concerns\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Supplier extends Model
{
    use SoftDeletes, BelongsToTenant;

    protected $fillable = [
        'user_id', 'name', 'phone', 'email', 'tax_number', 'commercial_register',
        'address', 'city', 'notes',
        'total_purchases', 'total_paid', 'total_remaining', 'is_active',
    ];

    protected function casts(): array
    {
        return [
            'total_purchases' => 'decimal:2',
            'total_paid'      => 'decimal:2',
            'total_remaining' => 'decimal:2',
            'is_active'       => 'boolean',
        ];
    }

    // -------------------------------------------------------------------
    // العلاقات
    // -------------------------------------------------------------------

    public function purchases()
    {
        return $this->hasMany(Purchase::class);
    }

    // -------------------------------------------------------------------
    // Scopes
    // -------------------------------------------------------------------

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeSearch($query, string $term)
    {
        return $query->where(function ($q) use ($term) {
            $q->where('name', 'like', "%{$term}%")
              ->orWhere('phone', 'like', "%{$term}%")
              ->orWhere('tax_number', 'like', "%{$term}%");
        });
    }
}
