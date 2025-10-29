<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ChallengeSubmissionReview extends Model
{
    use HasFactory;

    protected $fillable = [
        'challenge_submission_id',
        'reviewer_id',
        'review_stage',
        'recommendation',
        'comments',
        'reviewed_at',
    ];

    protected $casts = [
        'reviewed_at' => 'datetime',
    ];

    public function challengeSubmission(): BelongsTo
    {
        return $this->belongsTo(ChallengeSubmission::class);
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewer_id');
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
