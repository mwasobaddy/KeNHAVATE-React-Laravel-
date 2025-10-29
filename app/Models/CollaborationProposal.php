<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CollaborationProposal extends Model
{
    protected $fillable = [
        'idea_id',
        'collaborator_id',
        'original_author_id',
        'proposed_idea_title',
        'proposed_thematic_area_id',
        'proposed_abstract',
        'proposed_problem_statement',
        'proposed_solution',
        'proposed_cost_benefit_analysis',
        'proposed_declaration_of_interests',
        'proposed_original_idea_disclaimer',
        'proposed_collaboration_enabled',
        'proposed_team_effort',
        'proposed_comments_enabled',
        'proposed_collaboration_deadline',
        'collaboration_notes',
        'change_summary',
        'changed_fields',
        'status',
        'review_notes',
        'reviewed_at',
        'reviewed_by',
        'version_number',
        'parent_proposal_id',
    ];

    protected $casts = [
        'proposed_original_idea_disclaimer' => 'boolean',
        'proposed_collaboration_enabled' => 'boolean',
        'proposed_team_effort' => 'boolean',
        'proposed_comments_enabled' => 'boolean',
        'proposed_collaboration_deadline' => 'date',
        'changed_fields' => 'array',
        'reviewed_at' => 'datetime',
    ];

    public function idea(): BelongsTo
    {
        return $this->belongsTo(Idea::class);
    }

    public function collaborator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'collaborator_id');
    }

    public function originalAuthor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'original_author_id');
    }

    public function reviewedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    public function proposedThematicArea(): BelongsTo
    {
        return $this->belongsTo(ThematicArea::class, 'proposed_thematic_area_id');
    }

    public function parentProposal(): BelongsTo
    {
        return $this->belongsTo(CollaborationProposal::class, 'parent_proposal_id');
    }
}
