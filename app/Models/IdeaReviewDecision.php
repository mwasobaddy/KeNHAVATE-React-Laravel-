<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class IdeaReviewDecision extends Model
{
    protected $fillable = [
        'idea_id',
        'deputy_director_id',
        'review_stage',
        'decision',
        'compiled_comments',
        'dd_comments',
        'previous_status',
        'new_status',
        'decided_at',
    ];

    protected $casts = [
        'decided_at' => 'datetime',
    ];

    /**
     * Get the idea being decided on
     */
    public function idea(): BelongsTo
    {
        return $this->belongsTo(Idea::class);
    }

    /**
     * Get the Deputy Director who made the decision
     */
    public function deputyDirector(): BelongsTo
    {
        return $this->belongsTo(User::class, 'deputy_director_id');
    }

    /**
     * Scope for Stage 1 decisions
     */
    public function scopeStage1($query)
    {
        return $query->where('review_stage', 'stage1');
    }

    /**
     * Scope for Stage 2 decisions
     */
    public function scopeStage2($query)
    {
        return $query->where('review_stage', 'stage2');
    }

    /**
     * Get formatted decision status
     */
    public function getFormattedDecisionAttribute()
    {
        return ucfirst($this->decision);
    }
}
