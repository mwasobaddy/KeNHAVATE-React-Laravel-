<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Idea;
use App\Models\CollaborationProposal;
use App\Models\IdeaVersion;
use App\Models\ThematicArea;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class CollaborationProposalController extends Controller
{
    /**
     * Show the form for creating a collaboration proposal.
     */
    public function create($ideaSlug)
    {
        $idea = Idea::with(['user', 'thematicArea'])
            ->where('slug', $ideaSlug)
            ->firstOrFail();

        // Authorization check
        if (!auth()->user()->can('submit.collaboration-proposals')) {
            return redirect()->back()->with('error', 'You do not have permission to submit collaboration proposals.');
        }

        // Check if user is authorized to collaborate
        if ($idea->user_id === Auth::id()) {
            return redirect()->back()->with('error', 'You cannot collaborate on your own idea.');
        }

        if (!$idea->collaboration_enabled) {
            return redirect()->back()->with('error', 'This idea is not open for collaboration.');
        }

        // Business rule: SME cannot collaborate on ideas in stage 1 review to avoid conflict of interest
        if ($idea->status === 'stage 1 review' && auth()->user()->hasRole('subject-matter-expert')) {
            return redirect()->back()->with('error', 'SME cannot collaborate on ideas currently under Stage 1 review.');
        }

        $thematicAreas = ThematicArea::active()->ordered()->get();

        return Inertia::render('Collaboration/Propose', [
            'idea' => $idea,
            'thematicAreas' => $thematicAreas,
        ]);
    }

    /**
     * Store a collaboration proposal.
     */
    public function store(Request $request, $ideaSlug)
    {
        $idea = Idea::where('slug', $ideaSlug)->firstOrFail();
        
        if ($idea->user_id === Auth::id()) {
            return response()->json(['message' => 'You cannot collaborate on your own idea.'], 403);
        }

        if (!$idea->collaboration_enabled) {
            return response()->json(['message' => 'This idea is not open for collaboration.'], 403);
        }

        $validated = $request->validate([
            'proposed_idea_title' => 'nullable|string|max:255',
            'proposed_thematic_area_id' => 'nullable|exists:thematic_areas,id',
            'proposed_abstract' => 'nullable|string',
            'proposed_problem_statement' => 'nullable|string',
            'proposed_solution' => 'nullable|string',
            'proposed_cost_benefit_analysis' => 'nullable|string',
            'proposed_declaration_of_interests' => 'nullable|string',
            'proposed_original_idea_disclaimer' => 'boolean',
            'proposed_collaboration_enabled' => 'boolean',
            'proposed_team_effort' => 'boolean',
            'proposed_comments_enabled' => 'boolean',
            'proposed_collaboration_deadline' => 'nullable|date',
            'collaboration_notes' => 'required|string',
            'change_summary' => 'required|string|max:500',
        ]);

        // Determine which fields were changed
        $changedFields = [];
        $originalFields = [
            'idea_title' => $idea->idea_title,
            'thematic_area_id' => $idea->thematic_area_id,
            'abstract' => $idea->abstract,
            'problem_statement' => $idea->problem_statement,
            'proposed_solution' => $idea->proposed_solution,
            'cost_benefit_analysis' => $idea->cost_benefit_analysis,
            'declaration_of_interests' => $idea->declaration_of_interests,
            'original_idea_disclaimer' => $idea->original_idea_disclaimer,
            'collaboration_enabled' => $idea->collaboration_enabled,
            'team_effort' => $idea->team_effort,
            'comments_enabled' => $idea->comments_enabled,
            'collaboration_deadline' => $idea->collaboration_deadline,
        ];

        foreach ($originalFields as $field => $originalValue) {
            $proposedField = 'proposed_' . $field;
            if (isset($validated[$proposedField]) && $validated[$proposedField] != $originalValue) {
                $changedFields[] = $field;
            }
        }

        $proposal = CollaborationProposal::create([
            'idea_id' => $idea->id,
            'collaborator_id' => Auth::id(),
            'original_author_id' => $idea->user_id,
            'changed_fields' => $changedFields,
            ...$validated,
        ]);

        return redirect()->route('collaboration.index')
            ->with('success', 'Collaboration proposal submitted successfully!');
    }

    /**
     * Show proposals for review by the original author.
     */
    public function review($ideaSlug)
    {
        $idea = Idea::with(['user', 'thematicArea'])
            ->where('slug', $ideaSlug)
            ->firstOrFail();

        // Authorization check: Must have permission to manage collaboration proposals
        if (!auth()->user()->can('manage.collaboration-proposals')) {
            return redirect()->back()->with('error', 'You do not have permission to manage collaboration proposals.');
        }

        // Business rule: Only idea owner can review proposals (or admin/DD)
        if ($idea->user_id !== Auth::id() && !auth()->user()->hasRole(['admin', 'deputy-director'])) {
            return redirect()->back()->with('error', 'You can only review proposals for your own ideas.');
        }

        $proposals = CollaborationProposal::with(['collaborator', 'proposedThematicArea'])
            ->where('idea_id', $idea->id)
            ->where('status', 'pending')
            ->orderBy('created_at', 'desc')
            ->get();

        $thematicAreas = ThematicArea::active()->ordered()->get();

        return Inertia::render('Collaboration/Review', [
            'idea' => $idea,
            'proposals' => $proposals,
            'thematicAreas' => $thematicAreas,
        ]);
    }

    /**
     * Accept or reject a collaboration proposal.
     */
    public function respond(Request $request, CollaborationProposal $proposal)
    {
        if ($proposal->original_author_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $validated = $request->validate([
            'action' => 'required|in:accept,reject',
            'review_notes' => 'nullable|string',
            'edited_proposal' => 'nullable|array', // For edited proposal data
        ]);

        DB::transaction(function () use ($proposal, $validated) {
            if ($validated['action'] === 'accept') {
                // Create a version snapshot before updating
                $this->createVersionSnapshot($proposal->idea, 'Collaboration proposal accepted', $proposal->id);
                
                // Apply the changes to the original idea
                $this->applyProposalToIdea($proposal, $validated['edited_proposal'] ?? null);
                
                $proposal->update([
                    'status' => 'accepted',
                    'review_notes' => $validated['review_notes'],
                    'reviewed_at' => now(),
                    'reviewed_by' => Auth::id(),
                ]);
            } else {
                $proposal->update([
                    'status' => 'rejected',
                    'review_notes' => $validated['review_notes'],
                    'reviewed_at' => now(),
                    'reviewed_by' => Auth::id(),
                ]);
            }
        });

        return response()->json([
            'message' => 'Proposal ' . $validated['action'] . 'ed successfully!',
        ]);
    }

    /**
     * Create a version snapshot of the idea.
     */
    private function createVersionSnapshot(Idea $idea, $changeDescription, $collaborationProposalId = null)
    {
        $latestVersion = IdeaVersion::where('idea_id', $idea->id)
            ->max('version_number') ?? 0;

        IdeaVersion::create([
            'idea_id' => $idea->id,
            'version_number' => $latestVersion + 1,
            'idea_title' => $idea->idea_title,
            'thematic_area_id' => $idea->thematic_area_id,
            'abstract' => $idea->abstract,
            'problem_statement' => $idea->problem_statement,
            'proposed_solution' => $idea->proposed_solution,
            'cost_benefit_analysis' => $idea->cost_benefit_analysis,
            'declaration_of_interests' => $idea->declaration_of_interests,
            'original_idea_disclaimer' => $idea->original_idea_disclaimer,
            'collaboration_enabled' => $idea->collaboration_enabled,
            'team_effort' => $idea->team_effort,
            'comments_enabled' => $idea->comments_enabled,
            'current_revision_number' => $idea->current_revision_number,
            'collaboration_deadline' => $idea->collaboration_deadline,
            'status' => $idea->status,
            'change_description' => $changeDescription,
            'changed_by' => Auth::id(),
            'collaboration_proposal_id' => $collaborationProposalId,
        ]);
    }

    /**
     * Apply accepted proposal changes to the original idea.
     */
    private function applyProposalToIdea(CollaborationProposal $proposal, $editedProposal = null)
    {
        $idea = $proposal->idea;
        $updateData = [];

        // Use edited proposal data if provided, otherwise use original proposal data
        $proposalData = $editedProposal ?? [
            'proposed_idea_title' => $proposal->proposed_idea_title,
            'proposed_thematic_area_id' => $proposal->proposed_thematic_area_id,
            'proposed_abstract' => $proposal->proposed_abstract,
            'proposed_problem_statement' => $proposal->proposed_problem_statement,
            'proposed_solution' => $proposal->proposed_solution,
            'proposed_cost_benefit_analysis' => $proposal->proposed_cost_benefit_analysis,
            'proposed_declaration_of_interests' => $proposal->proposed_declaration_of_interests,
            'proposed_original_idea_disclaimer' => $proposal->proposed_original_idea_disclaimer,
            'proposed_collaboration_enabled' => $proposal->proposed_collaboration_enabled,
            'proposed_team_effort' => $proposal->proposed_team_effort,
            'proposed_comments_enabled' => $proposal->proposed_comments_enabled,
            'proposed_collaboration_deadline' => $proposal->proposed_collaboration_deadline,
        ];

        foreach ($proposalData as $proposedField => $value) {
            if ($value !== null) {
                $originalField = str_replace('proposed_', '', $proposedField);
                $updateData[$originalField] = $value;
            }
        }

        // Increment revision number
        $updateData['current_revision_number'] = $idea->current_revision_number + 1;

        $idea->update($updateData);
    }

    /**
     * Rollback to a previous version.
     */
    public function rollback(Request $request, $ideaSlug)
    {
        $idea = Idea::where('slug', $ideaSlug)->firstOrFail();
        
        if ($idea->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $validated = $request->validate([
            'version_number' => 'required|integer|min:1',
        ]);

        $version = IdeaVersion::where('idea_id', $idea->id)
            ->where('version_number', $validated['version_number'])
            ->firstOrFail();

        DB::transaction(function () use ($idea, $version) {
            // Create a snapshot before rollback
            $this->createVersionSnapshot($idea, "Rolled back to version {$version->version_number}");
            
            // Apply the version data to the idea
            $idea->update([
                'idea_title' => $version->idea_title,
                'thematic_area_id' => $version->thematic_area_id,
                'abstract' => $version->abstract,
                'problem_statement' => $version->problem_statement,
                'proposed_solution' => $version->proposed_solution,
                'cost_benefit_analysis' => $version->cost_benefit_analysis,
                'declaration_of_interests' => $version->declaration_of_interests,
                'original_idea_disclaimer' => $version->original_idea_disclaimer,
                'collaboration_enabled' => $version->collaboration_enabled,
                'team_effort' => $version->team_effort,
                'comments_enabled' => $version->comments_enabled,
                'collaboration_deadline' => $version->collaboration_deadline,
                'status' => $version->status,
                'current_revision_number' => $idea->current_revision_number + 1,
            ]);
        });

        return response()->json([
            'message' => "Successfully rolled back to version {$version->version_number}!",
        ]);
    }

    /**
     * Show collaborator's own proposals.
     */
    public function myProposals()
    {
        $proposals = CollaborationProposal::with(['idea', 'originalAuthor', 'reviewedBy'])
            ->where('collaborator_id', Auth::id())
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($proposal) {
                return [
                    'id' => $proposal->id,
                    'idea' => [
                        'id' => $proposal->idea->id,
                        'title' => $proposal->idea->idea_title,
                        'slug' => $proposal->idea->slug,
                    ],
                    'original_author' => [
                        'id' => $proposal->originalAuthor->id,
                        'name' => $proposal->originalAuthor->name,
                    ],
                    'change_summary' => $proposal->change_summary,
                    'status' => $proposal->status,
                    'created_at' => $proposal->created_at->format('M d, Y'),
                    'reviewed_at' => $proposal->reviewed_at ? $proposal->reviewed_at->format('M d, Y') : null,
                    'reviewed_by' => $proposal->reviewedBy ? $proposal->reviewedBy->name : null,
                    'review_notes' => $proposal->review_notes,
                ];
            });

        return Inertia::render('Collaboration/MyProposals', [
            'proposals' => $proposals,
        ]);
    }

    /**
     * Show specific proposal details.
     */
    public function show(CollaborationProposal $proposal)
    {
        // Check authorization
        if ($proposal->collaborator_id !== Auth::id() && $proposal->original_author_id !== Auth::id()) {
            return redirect()->back()->with('error', 'You are not authorized to view this proposal.');
        }

        $proposal->load(['idea', 'collaborator', 'originalAuthor', 'reviewedBy', 'proposedThematicArea']);
        $thematicAreas = ThematicArea::active()->ordered()->get();

        return Inertia::render('Collaboration/ProposalDetails', [
            'proposal' => [
                'id' => $proposal->id,
                'idea' => [
                    'id' => $proposal->idea->id,
                    'title' => $proposal->idea->idea_title,
                    'slug' => $proposal->idea->slug,
                    'abstract' => $proposal->idea->abstract,
                    'problem_statement' => $proposal->idea->problem_statement,
                    'proposed_solution' => $proposal->idea->proposed_solution,
                    'cost_benefit_analysis' => $proposal->idea->cost_benefit_analysis,
                    'declaration_of_interests' => $proposal->idea->declaration_of_interests,
                    'thematic_area' => $proposal->idea->thematicArea ? [
                        'id' => $proposal->idea->thematicArea->id,
                        'name' => $proposal->idea->thematicArea->name,
                    ] : null,
                ],
                'collaborator' => [
                    'id' => $proposal->collaborator->id,
                    'name' => $proposal->collaborator->name,
                ],
                'original_author' => [
                    'id' => $proposal->originalAuthor->id,
                    'name' => $proposal->originalAuthor->name,
                ],
                'proposed_idea_title' => $proposal->proposed_idea_title,
                'proposed_thematic_area_id' => $proposal->proposed_thematic_area_id,
                'proposed_abstract' => $proposal->proposed_abstract,
                'proposed_problem_statement' => $proposal->proposed_problem_statement,
                'proposed_solution' => $proposal->proposed_solution,
                'proposed_cost_benefit_analysis' => $proposal->proposed_cost_benefit_analysis,
                'proposed_declaration_of_interests' => $proposal->proposed_declaration_of_interests,
                'proposed_thematic_area' => $proposal->proposedThematicArea ? [
                    'id' => $proposal->proposedThematicArea->id,
                    'name' => $proposal->proposedThematicArea->name,
                ] : null,
                'collaboration_notes' => $proposal->collaboration_notes,
                'change_summary' => $proposal->change_summary,
                'changed_fields' => $proposal->changed_fields,
                'status' => $proposal->status,
                'review_notes' => $proposal->review_notes,
                'created_at' => $proposal->created_at->format('M d, Y g:i A'),
                'reviewed_at' => $proposal->reviewed_at ? $proposal->reviewed_at->format('M d, Y g:i A') : null,
                'reviewed_by' => $proposal->reviewedBy ? $proposal->reviewedBy->name : null,
            ],
            'thematicAreas' => $thematicAreas,
            'isAuthor' => $proposal->original_author_id === Auth::id(),
        ]);
    }

    /**
     * Show author's received proposals.
     */
    public function receivedProposals()
    {
        $proposals = CollaborationProposal::with(['idea', 'collaborator'])
            ->where('original_author_id', Auth::id())
            ->orderBy('created_at', 'desc')
            ->get()
            ->groupBy('idea_id')
            ->map(function ($ideaProposals) {
                $idea = $ideaProposals->first()->idea;
                return [
                    'idea' => [
                        'id' => $idea->id,
                        'title' => $idea->idea_title,
                        'slug' => $idea->slug,
                    ],
                    'proposals_count' => $ideaProposals->count(),
                    'pending_count' => $ideaProposals->where('status', 'pending')->count(),
                    'accepted_count' => $ideaProposals->where('status', 'accepted')->count(),
                    'rejected_count' => $ideaProposals->where('status', 'rejected')->count(),
                    'latest_proposal' => [
                        'id' => $ideaProposals->first()->id,
                        'collaborator_name' => $ideaProposals->first()->collaborator->name,
                        'change_summary' => $ideaProposals->first()->change_summary,
                        'status' => $ideaProposals->first()->status,
                        'created_at' => $ideaProposals->first()->created_at->format('M d, Y'),
                    ],
                    'all_proposals' => $ideaProposals->map(function ($proposal) {
                        return [
                            'id' => $proposal->id,
                            'collaborator_name' => $proposal->collaborator->name,
                            'change_summary' => $proposal->change_summary,
                            'status' => $proposal->status,
                            'created_at' => $proposal->created_at->format('M d, Y'),
                        ];
                    })->values(),
                ];
            })->values();

        return Inertia::render('Collaboration/ReceivedProposals', [
            'proposalGroups' => $proposals,
        ]);
    }

    /**
     * Show idea management page with versions and proposals.
     */
    public function manage($ideaSlug)
    {
        $idea = Idea::with(['user', 'thematicArea'])
            ->where('slug', $ideaSlug)
            ->firstOrFail();

        if ($idea->user_id !== Auth::id()) {
            return redirect()->back()->with('error', 'You can only manage your own ideas.');
        }

        $proposals = CollaborationProposal::with(['collaborator', 'proposedThematicArea'])
            ->where('idea_id', $idea->id)
            ->orderBy('created_at', 'desc')
            ->get();

        $versions = IdeaVersion::with(['changedBy'])
            ->where('idea_id', $idea->id)
            ->orderBy('version_number', 'desc')
            ->get()
            ->map(function ($version) {
                return [
                    'id' => $version->id,
                    'version_number' => $version->version_number,
                    'change_description' => $version->change_description,
                    'changed_by' => $version->changedBy ? $version->changedBy->name : 'System',
                    'created_at' => $version->created_at->format('M d, Y g:i A'),
                    'changed_fields' => $version->changed_fields,
                ];
            });

        return Inertia::render('Collaboration/ManageIdea', [
            'idea' => [
                'id' => $idea->id,
                'title' => $idea->idea_title,
                'slug' => $idea->slug,
                'abstract' => $idea->abstract,
                'problem_statement' => $idea->problem_statement,
                'proposed_solution' => $idea->proposed_solution,
                'cost_benefit_analysis' => $idea->cost_benefit_analysis,
                'declaration_of_interests' => $idea->declaration_of_interests,
                'current_revision_number' => $idea->current_revision_number,
                'thematic_area' => $idea->thematicArea ? [
                    'id' => $idea->thematicArea->id,
                    'name' => $idea->thematicArea->name,
                ] : null,
                'user' => [
                    'id' => $idea->user->id,
                    'name' => $idea->user->name,
                ],
            ],
            'proposals' => $proposals->map(function ($proposal) {
                return [
                    'id' => $proposal->id,
                    'collaborator' => [
                        'id' => $proposal->collaborator->id,
                        'name' => $proposal->collaborator->name,
                    ],
                    'change_summary' => $proposal->change_summary,
                    'status' => $proposal->status,
                    'created_at' => $proposal->created_at->format('M d, Y'),
                    'reviewed_at' => $proposal->reviewed_at ? $proposal->reviewed_at->format('M d, Y') : null,
                ];
            }),
            'versions' => $versions,
        ]);
    }
}
