<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Plan extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'name',
        'description',
        'price',
        'duration_days',
        'invoice_limit',
        'is_active',
        'features',
    ];

    protected function casts(): array
    {
        return [
            'price'         => 'decimal:2',
            'duration_days' => 'integer',
            'invoice_limit' => 'integer',
            'is_active'     => 'boolean',
            'features'      => 'array',
        ];
    }

    // -------------------------------------------------------------------
    // العلاقات
    // -------------------------------------------------------------------

    public function subscriptions()
    {
        return $this->hasMany(Subscription::class);
    }

    public function activeSubscriptions()
    {
        return $this->hasMany(Subscription::class)->where('status', 'active');
    }

    // -------------------------------------------------------------------
    // Scopes
    // -------------------------------------------------------------------

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    // -------------------------------------------------------------------
    // Computed
    // -------------------------------------------------------------------

    public function canBeDeleted(): bool
    {
        return $this->subscriptions()->count() === 0;
    }
}
