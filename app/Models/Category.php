<?php

namespace App\Models;

use App\Models\Concerns\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Category extends Model
{
    use SoftDeletes, BelongsToTenant;

    protected $fillable = ['user_id', 'name', 'slug', 'description', 'color', 'is_active'];

    protected function casts(): array
    {
        return ['is_active' => 'boolean'];
    }

    // -------------------------------------------------------------------
    // Hooks
    // -------------------------------------------------------------------

    protected static function booted(): void
    {
        static::creating(function (self $category) {
            if (empty($category->slug)) {
                $category->slug = Str::slug($category->name);
            }
        });
    }

    // -------------------------------------------------------------------
    // العلاقات
    // -------------------------------------------------------------------

    public function products()
    {
        return $this->hasMany(Product::class);
    }

    // -------------------------------------------------------------------
    // Scopes
    // -------------------------------------------------------------------

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
