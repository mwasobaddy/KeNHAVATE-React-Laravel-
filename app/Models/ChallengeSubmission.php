<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ChallengeSubmission extends Model
{
    use HasFactory;

    protected $fillable = [
        'challenge_id',
        'title',
        'description',
        'motivation',
        'cost_of_implementation',
        'original_disclaimer',
        'attachment_path',
        'attachment_name',
        'attachment_mime_type',
        'status',
        'submitted_by',
        'submitted_at',
    ];

    protected $casts = [
        'cost_of_implementation' => 'decimal:2',
        'submitted_at' => 'datetime',
    ];

    public function challenge(): BelongsTo
    {
        return $this->belongsTo(Challenge::class);
    }

    public function submitter(): BelongsTo
    {
        return $this->belongsTo(User::class, 'submitted_by');
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(ChallengeSubmissionReview::class);
    }

    public function stage1Reviews(): HasMany
    {
        return $this->hasMany(ChallengeSubmissionReview::class)->where('review_stage', 'stage 1');
    }

    public function stage2Reviews(): HasMany
    {
        return $this->hasMany(ChallengeSubmissionReview::class)->where('review_stage', 'stage 2');
    }

    public function reviewDecisions(): HasMany
    {
        return $this->hasMany(ChallengeSubmissionReviewDecision::class);
    }

    public function latestDecision()
    {
        return $this->hasOne(ChallengeSubmissionReviewDecision::class)->latest('decided_at');
    }

    public function scopeInReview($query)
    {
        return $query->whereIn('status', ['stage 1 review', 'stage 2 review']);
    }

    public function scopeNeedsRevision($query)
    {
        return $query->whereIn('status', ['stage 1 revise', 'stage 2 revise']);
    }

    public function scopeCompleted($query)
    {
        return $query->whereIn('status', ['approved', 'rejected']);
    }

    public function isInReview(): bool
    {
        return in_array($this->status, ['stage 1 review', 'stage 2 review']);
    }

    public function needsRevision(): bool
    {
        return in_array($this->status, ['stage 1 revise', 'stage 2 revise']);
    }

    public function isCompleted(): bool
    {
        return in_array($this->status, ['approved', 'rejected']);
    }
}
