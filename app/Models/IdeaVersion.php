<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class IdeaVersion extends Model
{
    protected $fillable = [
        'idea_id',
        'version_number',
        'idea_title',
        'thematic_area_id',
        'abstract',
        'problem_statement',
        'proposed_solution',
        'cost_benefit_analysis',
        'declaration_of_interests',
        'original_idea_disclaimer',
        'collaboration_enabled',
        'team_effort',
        'comments_enabled',
        'current_revision_number',
        'collaboration_deadline',
        'status',
        'change_description',
        'changed_fields',
        'changed_by',
        'collaboration_proposal_id',
    ];

    protected $casts = [
        'original_idea_disclaimer' => 'boolean',
        'collaboration_enabled' => 'boolean',
        'team_effort' => 'boolean',
        'comments_enabled' => 'boolean',
        'collaboration_deadline' => 'date',
        'changed_fields' => 'array',
    ];

    public function idea(): BelongsTo
    {
        return $this->belongsTo(Idea::class);
    }

    public function thematicArea(): BelongsTo
    {
        return $this->belongsTo(ThematicArea::class);
    }

    public function changedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'changed_by');
    }

    public function collaborationProposal(): BelongsTo
    {
        return $this->belongsTo(CollaborationProposal::class);
    }
}
