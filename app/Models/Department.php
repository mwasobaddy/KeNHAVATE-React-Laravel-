<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Department extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'code',
        'description',
        'directorate_id',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    /**
     * Get the directorate that owns this department.
     */
    public function directorate(): BelongsTo
    {
        return $this->belongsTo(Directorate::class);
    }

    /**
     * Get the region through the directorate.
     */
    public function region(): BelongsTo
    {
        return $this->directorate->region();
    }

    /**
     * Get the users for this department.
     */
    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    /**
     * Get the active users for this department.
     */
    public function activeUsers(): HasMany
    {
        return $this->users()->where('is_active', true);
    }

    /**
     * Scope to get only active departments.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope to order departments by name.
     */
    public function scopeOrdered($query)
    {
        return $query->orderBy('name');
    }

    /**
     * Get the full organizational path.
     */
    public function getFullPathAttribute(): string
    {
        return $this->directorate->region->name . ' > ' . $this->directorate->name . ' > ' . $this->name;
    }
}
