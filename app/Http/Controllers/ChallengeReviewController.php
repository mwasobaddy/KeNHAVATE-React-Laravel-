<?php

namespace App\Http\Controllers;

use App\Models\ChallengeSubmission;
use App\Models\ChallengeSubmissionReview;
use App\Models\ChallengeSubmissionReviewDecision;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Validation\Rule;

class ChallengeReviewController extends Controller
{
    /**
     * SME Review Dashboard - Stage 1 Reviews
     */
    public function smeReviewDashboard()
    {
        $user = auth()->user();

        // Get submissions pending stage 1 review
        $pendingSubmissions = ChallengeSubmission::with(['challenge', 'submitter', 'stage1Reviews'])
            ->where('status', 'stage 1 review')
            ->whereDoesntHave('stage1Reviews', function ($query) use ($user) {
                $query->where('reviewer_id', $user->id);
            })
            ->orderBy('submitted_at', 'asc')
            ->get();

        // Get submissions already reviewed by this SME
        $reviewedSubmissions = ChallengeSubmission::with(['challenge', 'submitter', 'stage1Reviews'])
            ->whereHas('stage1Reviews', function ($query) use ($user) {
                $query->where('reviewer_id', $user->id);
            })
            ->orderBy('updated_at', 'desc')
            ->limit(10)
            ->get();

        $stats = [
            'pending_reviews' => $pendingSubmissions->count(),
            'completed_reviews' => ChallengeSubmissionReview::where('reviewer_id', $user->id)
                ->where('review_stage', 'stage 1')
                ->count(),
            'total_submissions' => ChallengeSubmission::whereIn('status', ['stage 1 review', 'stage 2 review', 'approved', 'rejected'])
                ->count(),
        ];

        return Inertia::render('Challenges/Review/SME/Dashboard', [
            'pendingSubmissions' => $pendingSubmissions,
            'reviewedSubmissions' => $reviewedSubmissions,
            'stats' => $stats,
        ]);
    }

    /**
     * Board Review Dashboard - Stage 2 Reviews
     */
    public function boardReviewDashboard()
    {
        $user = auth()->user();

        // Get submissions pending stage 2 review
        $pendingSubmissions = ChallengeSubmission::with(['challenge', 'submitter', 'stage2Reviews'])
            ->where('status', 'stage 2 review')
            ->whereDoesntHave('stage2Reviews', function ($query) use ($user) {
                $query->where('reviewer_id', $user->id);
            })
            ->orderBy('submitted_at', 'asc')
            ->get();

        // Get submissions already reviewed by this board member
        $reviewedSubmissions = ChallengeSubmission::with(['challenge', 'submitter', 'stage2Reviews'])
            ->whereHas('stage2Reviews', function ($query) use ($user) {
                $query->where('reviewer_id', $user->id);
            })
            ->orderBy('updated_at', 'desc')
            ->limit(10)
            ->get();

        $stats = [
            'pending_reviews' => $pendingSubmissions->count(),
            'completed_reviews' => ChallengeSubmissionReview::where('reviewer_id', $user->id)
                ->where('review_stage', 'stage 2')
                ->count(),
            'total_submissions' => ChallengeSubmission::whereIn('status', ['stage 2 review', 'approved', 'rejected'])
                ->count(),
        ];

        return Inertia::render('Challenges/Review/Board/Dashboard', [
            'pendingSubmissions' => $pendingSubmissions,
            'reviewedSubmissions' => $reviewedSubmissions,
            'stats' => $stats,
        ]);
    }

    /**
     * DD Workflow Dashboard - Managing Review Decisions
     */
    public function ddWorkflowDashboard()
    {
        // Get submissions that need DD decisions
        $stage1Submissions = ChallengeSubmission::with(['challenge', 'submitter', 'stage1Reviews.reviewer'])
            ->where('status', 'stage 1 review')
            ->whereHas('stage1Reviews', function ($query) {
                // Has reviews from at least 2 SMEs (or adjust based on your requirements)
                $query->select(DB::raw('challenge_submission_id'))
                    ->groupBy('challenge_submission_id')
                    ->havingRaw('COUNT(*) >= 2');
            })
            ->whereDoesntHave('reviewDecisions', function ($query) {
                $query->where('review_stage', 'stage 1');
            })
            ->orderBy('submitted_at', 'asc')
            ->get();

        $stage2Submissions = ChallengeSubmission::with(['challenge', 'submitter', 'stage2Reviews.reviewer'])
            ->where('status', 'stage 2 review')
            ->whereHas('stage2Reviews', function ($query) {
                // Has reviews from at least 2 board members
                $query->select(DB::raw('challenge_submission_id'))
                    ->groupBy('challenge_submission_id')
                    ->havingRaw('COUNT(*) >= 2');
            })
            ->whereDoesntHave('reviewDecisions', function ($query) {
                $query->where('review_stage', 'stage 2');
            })
            ->orderBy('submitted_at', 'asc')
            ->get();

        // Get completed decisions
        $completedSubmissions = ChallengeSubmission::with(['challenge', 'submitter', 'reviewDecisions.decider'])
            ->whereIn('status', ['approved', 'rejected', 'stage 1 revise', 'stage 2 revise'])
            ->orderBy('updated_at', 'desc')
            ->limit(10)
            ->get();

        $stats = [
            'stage1_pending' => $stage1Submissions->count(),
            'stage2_pending' => $stage2Submissions->count(),
            'decisions_made' => ChallengeSubmissionReviewDecision::where('decided_by', auth()->id())->count(),
            'total_processed' => ChallengeSubmission::whereIn('status', ['approved', 'rejected'])->count(),
        ];

        return Inertia::render('Challenges/Review/DD/Dashboard', [
            'stage1Submissions' => $stage1Submissions,
            'stage2Submissions' => $stage2Submissions,
            'completedSubmissions' => $completedSubmissions,
            'stats' => $stats,
        ]);
    }

    /**
     * Show submission for review
     */
    public function showSubmissionForReview(ChallengeSubmission $submission)
    {
        $submission->load([
            'challenge',
            'submitter',
            'reviews.reviewer',
            'stage1Reviews.reviewer',
            'stage2Reviews.reviewer',
            'reviewDecisions.decider'
        ]);

        $userRole = $this->getUserReviewRole();
        $canReview = $this->canUserReviewSubmission($submission, $userRole);

        return Inertia::render('Challenges/Review/SubmissionDetail', [
            'submission' => $submission,
            'userRole' => $userRole,
            'canReview' => $canReview,
        ]);
    }

    /**
     * Submit a review
     */
    public function submitReview(Request $request, ChallengeSubmission $submission)
    {
        $userRole = $this->getUserReviewRole();
        
        if (!$this->canUserReviewSubmission($submission, $userRole)) {
            return Redirect::back()->with('error', 'You cannot review this submission.');
        }

        $stage = $userRole === 'sme' ? 'stage 1' : 'stage 2';

        $validated = $request->validate([
            'recommendation' => ['required', Rule::in(['approve', 'revise', 'reject'])],
            'comments' => 'required|string|min:10',
        ]);

        // Create the review
        ChallengeSubmissionReview::create([
            'challenge_submission_id' => $submission->id,
            'reviewer_id' => auth()->id(),
            'review_stage' => $stage,
            'recommendation' => $validated['recommendation'],
            'comments' => $validated['comments'],
        ]);

        return Redirect::back()->with('success', 'Review submitted successfully!');
    }

    /**
     * Make a decision (DD only)
     */
    public function makeDecision(Request $request, ChallengeSubmission $submission)
    {
        if (!auth()->user()->can('manage.review-decisions')) {
            abort(403);
        }

        $validated = $request->validate([
            'stage' => ['required', Rule::in(['stage 1', 'stage 2'])],
            'decision' => ['required', Rule::in(['approve', 'revise', 'reject'])],
            'compiled_comments' => 'required|string',
            'dd_comments' => 'nullable|string',
        ]);

        DB::transaction(function () use ($submission, $validated) {
            // Create the decision
            ChallengeSubmissionReviewDecision::create([
                'challenge_submission_id' => $submission->id,
                'review_stage' => $validated['stage'],
                'decision' => $validated['decision'],
                'compiled_comments' => $validated['compiled_comments'],
                'dd_comments' => $validated['dd_comments'],
                'decided_by' => auth()->id(),
            ]);

            // Update submission status
            $newStatus = $this->getNewSubmissionStatus($validated['stage'], $validated['decision']);
            $submission->update(['status' => $newStatus]);
        });

        return Redirect::back()->with('success', 'Decision made successfully!');
    }

    /**
     * Get user's review role
     */
    private function getUserReviewRole(): string
    {
        $user = auth()->user();
        
        if ($user->hasRole('subject-matter-expert')) {
            return 'sme';
        }
        
        if ($user->hasRole('board')) {
            return 'board';
        }
        
        if ($user->hasRole('deputy-director')) {
            return 'dd';
        }

        return 'none';
    }

    /**
     * Check if user can review submission
     */
    private function canUserReviewSubmission(ChallengeSubmission $submission, string $userRole): bool
    {
        $userId = auth()->id();

        if ($userRole === 'sme' && $submission->status === 'stage 1 review') {
            // Check if SME hasn't already reviewed this submission
            return !$submission->stage1Reviews()->where('reviewer_id', $userId)->exists();
        }

        if ($userRole === 'board' && $submission->status === 'stage 2 review') {
            // Check if board member hasn't already reviewed this submission
            return !$submission->stage2Reviews()->where('reviewer_id', $userId)->exists();
        }

        return false;
    }

    /**
     * Get new submission status based on decision
     */
    private function getNewSubmissionStatus(string $stage, string $decision): string
    {
        if ($decision === 'approve') {
            return $stage === 'stage 1' ? 'stage 2 review' : 'approved';
        }

        if ($decision === 'revise') {
            return $stage === 'stage 1' ? 'stage 1 revise' : 'stage 2 revise';
        }

        return 'rejected'; // decision === 'reject'
    }
}
