<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ChallengeSubmissionReviewDecision extends Model
{
    use HasFactory;

    protected $fillable = [
        'challenge_submission_id',
        'review_stage',
        'decision',
        'compiled_comments',
        'dd_comments',
        'decided_by',
        'decided_at',
    ];

    protected $casts = [
        'decided_at' => 'datetime',
    ];

    public function challengeSubmission(): BelongsTo
    {
        return $this->belongsTo(ChallengeSubmission::class);
    }

    public function decider(): BelongsTo
    {
        return $this->belongsTo(User::class, 'decided_by');
    }

    public function scopeStage1($query)
    {
        return $query->where('review_stage', 'stage 1');
    }

    public function scopeStage2($query)
    {
        return $query->where('review_stage', 'stage 2');
    }
}
