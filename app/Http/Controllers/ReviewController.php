<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Idea;
use App\Models\IdeaReview;
use App\Models\IdeaReviewDecision;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class ReviewController extends Controller
{
    /**
     * SME Review Dashboard - Stage 1
     */
    public function smeReviewDashboard()
    {
        $user = Auth::user();
        
        // Get ideas in Stage 1 review that user can review
        $ideasForReview = Idea::with(['user', 'thematicArea', 'stage1Reviews.reviewer'])
            ->where('status', 'stage 1 review')
            ->where('user_id', '!=', $user->id) // Cannot review own ideas
            ->whereDoesntHave('stage1Reviews', function($query) use ($user) {
                $query->where('reviewer_id', $user->id);
            })
            ->orderBy('created_at', 'asc')
            ->get();

        // Get ideas user has already reviewed in Stage 1
        $reviewedIdeas = Idea::with(['user', 'thematicArea', 'stage1Reviews' => function($query) use ($user) {
                $query->where('reviewer_id', $user->id);
            }])
            ->whereHas('stage1Reviews', function($query) use ($user) {
                $query->where('reviewer_id', $user->id);
            })
            ->orderBy('updated_at', 'desc')
            ->get();

        return Inertia::render('Review/SME/Dashboard', [
            'ideasForReview' => $ideasForReview,
            'reviewedIdeas' => $reviewedIdeas,
        ]);
    }

    /**
     * Board Review Dashboard - Stage 2
     */
    public function boardReviewDashboard()
    {
        $user = Auth::user();
        
        // Get ideas in Stage 2 review that user can review
        $ideasForReview = Idea::with(['user', 'thematicArea', 'stage2Reviews.reviewer'])
            ->where('status', 'stage 2 review')
            ->where('user_id', '!=', $user->id) // Cannot review own ideas
            ->whereDoesntHave('stage2Reviews', function($query) use ($user) {
                $query->where('reviewer_id', $user->id);
            })
            ->orderBy('created_at', 'asc')
            ->get();

        // Get ideas user has already reviewed in Stage 2
        $reviewedIdeas = Idea::with(['user', 'thematicArea', 'stage2Reviews' => function($query) use ($user) {
                $query->where('reviewer_id', $user->id);
            }])
            ->whereHas('stage2Reviews', function($query) use ($user) {
                $query->where('reviewer_id', $user->id);
            })
            ->orderBy('updated_at', 'desc')
            ->get();

        return Inertia::render('Review/Board/Dashboard', [
            'ideasForReview' => $ideasForReview,
            'reviewedIdeas' => $reviewedIdeas,
        ]);
    }

    /**
     * DD Workflow Dashboard
     */
    public function ddWorkflowDashboard()
    {
        // Ideas pending DD decision in Stage 1
        $stage1PendingIdeas = Idea::with(['user', 'thematicArea', 'stage1Reviews.reviewer'])
            ->where('status', 'stage 1 review')
            ->whereHas('stage1Reviews') // Has at least one review
            ->get()
            ->filter(function($idea) {
                // Check if all SME have reviewed or if enough time has passed
                $smeCount = \App\Models\User::role('subject-matter-expert')->count();
                $reviewCount = $idea->stage1Reviews->count();
                
                // If we have reviews from at least 60% of SME or it's been over 7 days
                return $reviewCount >= ($smeCount * 0.6) || 
                       $idea->updated_at->diffInDays(now()) > 7;
            });

        // Ideas pending DD decision in Stage 2
        $stage2PendingIdeas = Idea::with(['user', 'thematicArea', 'stage2Reviews.reviewer'])
            ->where('status', 'stage 2 review')
            ->whereHas('stage2Reviews') // Has at least one review
            ->get()
            ->filter(function($idea) {
                // Check if all Board members have reviewed or if enough time has passed
                $boardCount = \App\Models\User::role('board')->count();
                $reviewCount = $idea->stage2Reviews->count();
                
                return $reviewCount >= ($boardCount * 0.6) || 
                       $idea->updated_at->diffInDays(now()) > 7;
            });

        // Ideas in revision stages
        $stage1RevisionIdeas = Idea::with(['user', 'thematicArea', 'stage1Decisions'])
            ->where('status', 'stage 1 revise')
            ->orderBy('updated_at', 'desc')
            ->get();

        $stage2RevisionIdeas = Idea::with(['user', 'thematicArea', 'stage2Decisions'])
            ->where('status', 'stage 2 revise')
            ->orderBy('updated_at', 'desc')
            ->get();

        return Inertia::render('Review/DD/Dashboard', [
            'stage1PendingIdeas' => $stage1PendingIdeas->values(),
            'stage2PendingIdeas' => $stage2PendingIdeas->values(),
            'stage1RevisionIdeas' => $stage1RevisionIdeas,
            'stage2RevisionIdeas' => $stage2RevisionIdeas,
        ]);
    }

    /**
     * Show idea details for review
     */
    public function showIdeaForReview($id)
    {
        $user = Auth::user();
        $idea = Idea::with([
            'user', 
            'thematicArea', 
            'teamMembers',
            'stage1Reviews.reviewer', 
            'stage2Reviews.reviewer',
            'stage1Decisions.deputyDirector',
            'stage2Decisions.deputyDirector'
        ])->findOrFail($id);

        // Determine if user can review this idea
        $canReview = $idea->canBeReviewedBy($user);
        $reviewStage = $idea->status === 'stage 1 review' ? 'stage1' : 
                      ($idea->status === 'stage 2 review' ? 'stage2' : null);

        return Inertia::render('Review/IdeaDetails', [
            'idea' => $idea,
            'canReview' => $canReview,
            'reviewStage' => $reviewStage,
        ]);
    }

    /**
     * Submit a review (SME or Board)
     */
    public function submitReview(Request $request, $id)
    {
        $request->validate([
            'recommendation' => 'required|in:approve,revise,reject',
            'comments' => 'required|string|min:50|max:2000',
        ]);

        $user = Auth::user();
        $idea = Idea::findOrFail($id);

        // Verify user can review this idea
        if (!$idea->canBeReviewedBy($user)) {
            return response()->json(['message' => 'You cannot review this idea'], 403);
        }

        $reviewStage = $idea->status === 'stage 1 review' ? 'stage1' : 'stage2';

        // Create the review
        IdeaReview::create([
            'idea_id' => $idea->id,
            'reviewer_id' => $user->id,
            'review_stage' => $reviewStage,
            'recommendation' => $request->recommendation,
            'comments' => $request->comments,
        ]);

        return response()->json([
            'message' => 'Review submitted successfully',
            'redirect' => $reviewStage === 'stage1' ? 
                route('review.sme.dashboard') : 
                route('review.board.dashboard')
        ]);
    }

    /**
     * DD compiles reviews and makes decision
     */
    public function makeDecision(Request $request, $id)
    {
        $request->validate([
            'decision' => 'required|in:approve,revise,reject',
            'compiled_comments' => 'required|string|min:50',
            'dd_comments' => 'nullable|string|max:1000',
        ]);

        $user = Auth::user();
        $idea = Idea::with(['stage1Reviews', 'stage2Reviews'])->findOrFail($id);

        // Verify user is DD
        if (!$user->hasRole('deputy-director')) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $currentStage = $idea->status === 'stage 1 review' ? 'stage1' : 'stage2';
        $previousStatus = $idea->status;

        // Determine new status based on decision
        $newStatus = $this->determineNewStatus($request->decision, $currentStage);

        DB::transaction(function() use ($request, $idea, $user, $currentStage, $previousStatus, $newStatus) {
            // Create decision record
            IdeaReviewDecision::create([
                'idea_id' => $idea->id,
                'deputy_director_id' => $user->id,
                'review_stage' => $currentStage,
                'decision' => $request->decision,
                'compiled_comments' => $request->compiled_comments,
                'dd_comments' => $request->dd_comments,
                'previous_status' => $previousStatus,
                'new_status' => $newStatus,
            ]);

            // Update idea status
            $idea->update(['status' => $newStatus]);

            // If moving to stage 2 or approved, increment revision number
            if (in_array($newStatus, ['stage 2 review', 'approved'])) {
                $idea->increment('current_revision_number');
            }
        });

        return response()->json([
            'message' => 'Decision recorded successfully',
            'new_status' => $newStatus,
        ]);
    }

    /**
     * Author dashboard to see review status
     */
    public function authorReviewDashboard()
    {
        $user = Auth::user();
        
        $ideasInReview = Idea::with([
            'thematicArea',
            'stage1Reviews.reviewer',
            'stage2Reviews.reviewer', 
            'stage1Decisions.deputyDirector',
            'stage2Decisions.deputyDirector'
        ])
        ->where('user_id', $user->id)
        ->whereIn('status', ['stage 1 review', 'stage 2 review', 'stage 1 revise', 'stage 2 revise'])
        ->orderBy('updated_at', 'desc')
        ->get();

        return Inertia::render('Review/Author/Dashboard', [
            'ideasInReview' => $ideasInReview,
        ]);
    }

    /**
     * Determine new status based on DD decision
     */
    private function determineNewStatus($decision, $stage)
    {
        if ($stage === 'stage1') {
            switch ($decision) {
                case 'approve':
                    return 'stage 2 review';
                case 'revise':
                    return 'stage 1 revise';
                case 'reject':
                    return 'rejected';
            }
        } elseif ($stage === 'stage2') {
            switch ($decision) {
                case 'approve':
                    return 'approved';
                case 'revise':
                    return 'stage 2 revise';
                case 'reject':
                    return 'rejected';
            }
        }

        return 'draft'; // fallback
    }
}
