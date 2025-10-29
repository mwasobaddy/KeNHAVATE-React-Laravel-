<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class IdeaReview extends Model
{
    protected $fillable = [
        'idea_id',
        'reviewer_id',
        'review_stage',
        'recommendation',
        'comments',
        'reviewed_at',
    ];

    protected $casts = [
        'reviewed_at' => 'datetime',
    ];

    /**
     * Get the idea being reviewed
     */
    public function idea(): BelongsTo
    {
        return $this->belongsTo(Idea::class);
    }

    /**
     * Get the reviewer (SME or Board member)
     */
    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewer_id');
    }

    /**
     * Scope for Stage 1 reviews (SME)
     */
    public function scopeStage1($query)
    {
        return $query->where('review_stage', 'stage1');
    }

    /**
     * Scope for Stage 2 reviews (Board)
     */
    public function scopeStage2($query)
    {
        return $query->where('review_stage', 'stage2');
    }

    /**
     * Scope for specific recommendation
     */
    public function scopeWithRecommendation($query, $recommendation)
    {
        return $query->where('recommendation', $recommendation);
    }
}
