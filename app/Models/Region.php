<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Region extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'code',
        'description',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    /**
     * Get the directorates for this region.
     */
    public function directorates(): HasMany
    {
        return $this->hasMany(Directorate::class);
    }

    /**
     * Get the active directorates for this region.
     */
    public function activeDirectorates(): HasMany
    {
        return $this->directorates()->where('is_active', true);
    }

    /**
     * Scope to get only active regions.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope to order regions by name.
     */
    public function scopeOrdered($query)
    {
        return $query->orderBy('name');
    }
}
