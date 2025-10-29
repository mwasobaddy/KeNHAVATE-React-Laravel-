<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Challenge extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'description',
        'deadline',
        'guidelines',
        'reward',
        'attachment_path',
        'attachment_name',
        'attachment_mime_type',
        'status',
        'created_by',
    ];

    protected $casts = [
        'deadline' => 'datetime',
    ];

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function submissions(): HasMany
    {
        return $this->hasMany(ChallengeSubmission::class);
    }

    public function activeSubmissions(): HasMany
    {
        return $this->hasMany(ChallengeSubmission::class)->whereNotIn('status', ['draft']);
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeOpen($query)
    {
        return $query->where('status', 'active')->where('deadline', '>', now());
    }

    public function isOpen(): bool
    {
        return $this->status === 'active' && $this->deadline > now();
    }

    public function isClosed(): bool
    {
        return $this->status === 'closed' || $this->deadline <= now();
    }
}
