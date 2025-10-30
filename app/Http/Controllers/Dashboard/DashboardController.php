<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Idea;
use App\Models\Challenge;
use App\Models\CollaborationRequest;
use App\Models\IdeaReview;
use App\Models\ChallengeSubmission;
use App\Models\CollaborationProposal;
use App\Models\IdeaReviewDecision;
use App\Models\ChallengeSubmissionReview;
use App\Models\ChallengeSubmissionReviewDecision;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        // Base data for all users
        $data = [
            'user' => $user,
        ];

        // Admin stats section - only if user has 'admin-stats' permission
        if ($user->can('admin-stats')) {
            $data['adminStats'] = [
                'users' => [
                    'total' => User::count(),
                    'active_today' => User::where('last_login_at', '>=', now()->startOfDay())->count(),
                    'new_this_month' => User::where('created_at', '>=', now()->startOfMonth())->count(),
                ],
                'ideas' => [
                    'total' => Idea::count(),
                    'draft' => Idea::where('status', 'draft')->count(),
                    'approved' => Idea::where('status', 'approved')->count(),
                    'under_review' => Idea::whereIn('status', ['stage 1 review', 'stage 2 review'])->count(),
                    'new_this_week' => Idea::where('created_at', '>=', now()->startOfWeek())->count(),
                    'by_stage' => [
                        'draft' => Idea::where('status', 'draft')->count(),
                        'stage1_review' => Idea::where('status', 'stage 1 review')->count(),
                        'stage2_review' => Idea::where('status', 'stage 2 review')->count(),
                        'approved' => Idea::where('status', 'approved')->count(),
                        'rejected' => Idea::where('status', 'rejected')->count(),
                        'revision_requested' => Idea::where('status', 'revision requested')->count(),
                    ],
                    'with_collaborations' => Idea::where('collaboration_enabled', true)->count(),
                ],
                'challenges' => [
                    'total' => Challenge::count(),
                    'active' => Challenge::where('status', 'active')->count(),
                    'completed' => Challenge::where('status', 'completed')->count(),
                    'total_funding' => Challenge::sum('total_funding'),
                    'participated' => ChallengeSubmission::count(),
                    'submissions_by_status' => [
                        'draft' => ChallengeSubmission::where('status', 'draft')->count(),
                        'submitted' => ChallengeSubmission::where('status', 'submitted')->count(),
                        'under_review' => ChallengeSubmission::where('status', 'under_review')->count(),
                        'approved' => ChallengeSubmission::where('status', 'approved')->count(),
                        'rejected' => ChallengeSubmission::where('status', 'rejected')->count(),
                    ],
                ],
                'collaborations' => [
                    'total_requests' => CollaborationRequest::count(),
                    'pending' => CollaborationRequest::where('status', 'pending')->count(),
                    'approved' => CollaborationRequest::where('status', 'approved')->count(),
                    'rejected' => CollaborationRequest::where('status', 'rejected')->count(),
                ],
                'quick_links' => [
                    [
                        'title' => 'Manage Users',
                        'description' => 'View and manage user accounts',
                        'url' => '/admin/users',
                        'icon' => 'users',
                        'color' => 'blue',
                    ],
                    [
                        'title' => 'Review Ideas',
                        'description' => 'Review pending ideas',
                        'url' => '/ideas',
                        'icon' => 'lightbulb',
                        'color' => 'yellow',
                    ],
                    [
                        'title' => 'Manage Challenges',
                        'description' => 'Create and manage challenges',
                        'url' => '/challenges',
                        'icon' => 'trophy',
                        'color' => 'purple',
                    ],
                    [
                        'title' => 'Collaboration Hub',
                        'description' => 'Monitor collaboration requests',
                        'url' => '/collaboration/hub',
                        'icon' => 'git-branch',
                        'color' => 'green',
                    ],
                    [
                        'title' => 'System Settings',
                        'description' => 'Configure system settings',
                        'url' => '/settings',
                        'icon' => 'settings',
                        'color' => 'gray',
                    ],
                    [
                        'title' => 'Reports',
                        'description' => 'View system reports',
                        'url' => '/reports',
                        'icon' => 'bar-chart',
                        'color' => 'indigo',
                    ],
                ],
                'recent_activity' => [
                    'new_users' => User::latest()->take(5)->get(['id', 'name', 'created_at']),
                    'new_ideas' => Idea::with('user:id,name')->latest()->take(5)->get(['id', 'title', 'created_at', 'user_id']),
                    'new_challenges' => Challenge::latest()->take(3)->get(['id', 'title', 'created_at']),
                ],
            ];
        }

        // Basic Stats section - only if user has 'basic-stats' permission
        if ($user->can('basic-stats')) {
            $data['basicStats'] = [
                'ideas_submitted' => [
                    'total' => Idea::count(),
                    'by_stage' => [
                        'draft' => Idea::where('status', 'draft')->count(),
                        'stage1_review' => Idea::where('status', 'stage 1 review')->count(),
                        'stage2_review' => Idea::where('status', 'stage 2 review')->count(),
                        'approved' => Idea::where('status', 'approved')->count(),
                        'rejected' => Idea::where('status', 'rejected')->count(),
                        'revision_requested' => Idea::where('status', 'revision requested')->count(),
                    ],
                ],
                'ideas_collaborated' => [
                    'total_with_collaborations' => Idea::where('collaboration_enabled', true)->count(),
                ],
                'collaborations' => [
                    'total_requests' => CollaborationRequest::count(),
                    'by_status' => [
                        'pending' => CollaborationRequest::where('status', 'pending')->count(),
                        'approved' => CollaborationRequest::where('status', 'approved')->count(),
                        'rejected' => CollaborationRequest::where('status', 'rejected')->count(),
                    ],
                ],
                'challenges' => [
                    'active' => Challenge::where('status', 'active')->count(),
                    'participated' => ChallengeSubmission::count(),
                    'submissions_by_status' => [
                        'draft' => ChallengeSubmission::where('status', 'draft')->count(),
                        'submitted' => ChallengeSubmission::where('status', 'submitted')->count(),
                        'under_review' => ChallengeSubmission::where('status', 'under_review')->count(),
                        'approved' => ChallengeSubmission::where('status', 'approved')->count(),
                        'rejected' => ChallengeSubmission::where('status', 'rejected')->count(),
                    ],
                ],
                'personal_logs' => [
                    [
                        'id' => 1,
                        'action' => 'Idea Created',
                        'description' => 'Created new idea: "Sustainable Energy Solution"',
                        'timestamp' => now()->subDays(2)->toISOString(),
                        'type' => 'idea',
                    ],
                    [
                        'id' => 2,
                        'action' => 'Collaboration Requested',
                        'description' => 'Sent collaboration request to John Doe',
                        'timestamp' => now()->subDays(1)->toISOString(),
                        'type' => 'collaboration',
                    ],
                    [
                        'id' => 3,
                        'action' => 'Challenge Submitted',
                        'description' => 'Submitted entry for "Innovation Challenge 2025"',
                        'timestamp' => now()->subHours(12)->toISOString(),
                        'type' => 'challenge',
                    ],
                    [
                        'id' => 4,
                        'action' => 'Review Completed',
                        'description' => 'Completed review for idea: "AI Healthcare Assistant"',
                        'timestamp' => now()->subHours(6)->toISOString(),
                        'type' => 'review',
                    ],
                    [
                        'id' => 5,
                        'action' => 'Comment Added',
                        'description' => 'Added comment to idea: "Smart City Infrastructure"',
                        'timestamp' => now()->subHours(2)->toISOString(),
                        'type' => 'comment',
                    ],
                ],
            ];
        }

        // DD Stats section - only if user has 'dd-stats' permission
        if ($user->can('dd-stats')) {
            $data['ddStats'] = [
                'ideas_submitted' => [
                    'total' => Idea::count(),
                    'by_stage' => [
                        'draft' => Idea::where('status', 'draft')->count(),
                        'stage1_review' => Idea::where('status', 'stage 1 review')->count(),
                        'stage2_review' => Idea::where('status', 'stage 2 review')->count(),
                        'approved' => Idea::where('status', 'approved')->count(),
                        'rejected' => Idea::where('status', 'rejected')->count(),
                        'revision_requested' => Idea::where('status', 'revision requested')->count(),
                    ],
                ],
                'ideas_collaborated' => [
                    'total_with_collaborations' => Idea::where('collaboration_enabled', true)->count(),
                ],
                'collaborations' => [
                    'total_requests' => CollaborationRequest::count(),
                    'by_status' => [
                        'pending' => CollaborationRequest::where('status', 'pending')->count(),
                        'approved' => CollaborationRequest::where('status', 'approved')->count(),
                        'rejected' => CollaborationRequest::where('status', 'rejected')->count(),
                    ],
                ],
                'challenges' => [
                    'active' => Challenge::where('status', 'active')->count(),
                    'participated' => ChallengeSubmission::count(),
                    'submissions_by_status' => [
                        'draft' => ChallengeSubmission::where('status', 'draft')->count(),
                        'submitted' => ChallengeSubmission::where('status', 'submitted')->count(),
                        'under_review' => ChallengeSubmission::where('status', 'under_review')->count(),
                        'approved' => ChallengeSubmission::where('status', 'approved')->count(),
                        'rejected' => ChallengeSubmission::where('status', 'rejected')->count(),
                    ],
                ],
                'review_decisions' => [
                    'ideas_returned_for_revision' => IdeaReviewDecision::where('decision', 'revise')->count(),
                    'ideas_approved' => IdeaReviewDecision::where('decision', 'approve')->count(),
                    'ideas_rejected' => IdeaReviewDecision::where('decision', 'reject')->count(),
                    'challenges_created' => Challenge::count(),
                    'challenge_submissions' => ChallengeSubmission::count(),
                    'challenges_returned_for_revision' => ChallengeSubmissionReviewDecision::where('decision', 'revise')->count(),
                    'challenges_approved' => ChallengeSubmissionReviewDecision::where('decision', 'approve')->count(),
                    'challenges_rejected' => ChallengeSubmissionReviewDecision::where('decision', 'reject')->count(),
                ],
                'organizational' => [
                    'total_regions' => 5, // Dummy data
                    'total_directorates' => 12, // Dummy data
                    'total_departments' => 45, // Dummy data
                    'total_users_without_admin_role' => User::whereDoesntHave('roles', function ($query) {
                        $query->where('name', 'admin');
                    })->count(),
                ],
                'personal_logs' => [
                    [
                        'id' => 1,
                        'action' => 'Idea Review Completed',
                        'description' => 'Reviewed and approved idea: "Digital Transformation Initiative"',
                        'timestamp' => now()->subDays(1)->toISOString(),
                        'type' => 'review',
                    ],
                    [
                        'id' => 2,
                        'action' => 'Challenge Created',
                        'description' => 'Created new challenge: "Innovation in Healthcare"',
                        'timestamp' => now()->subDays(2)->toISOString(),
                        'type' => 'challenge',
                    ],
                    [
                        'id' => 3,
                        'action' => 'Decision Made',
                        'description' => 'Approved challenge submission for "Smart City Project"',
                        'timestamp' => now()->subHours(12)->toISOString(),
                        'type' => 'decision',
                    ],
                    [
                        'id' => 4,
                        'action' => 'Revision Requested',
                        'description' => 'Requested revisions for idea: "Sustainable Energy Solutions"',
                        'timestamp' => now()->subHours(8)->toISOString(),
                        'type' => 'revision',
                    ],
                    [
                        'id' => 5,
                        'action' => 'Report Generated',
                        'description' => 'Generated monthly innovation report',
                        'timestamp' => now()->subHours(4)->toISOString(),
                        'type' => 'report',
                    ],
                    [
                        'id' => 6,
                        'action' => 'Meeting Scheduled',
                        'description' => 'Scheduled review meeting for Q4 initiatives',
                        'timestamp' => now()->subHours(2)->toISOString(),
                        'type' => 'meeting',
                    ],
                ],
            ];
        }

        // Idea Review Stats section - only if user has 'idea-review-stats' permission
        if ($user->can('idea-review-stats')) {
            $data['ideaReviewStats'] = [
                'ideas_submitted' => [
                    'total' => Idea::count(),
                    'by_current_user' => Idea::where('user_id', $user->id)->count(),
                    'by_stage' => [
                        'draft' => Idea::where('status', 'draft')->count(),
                        'stage1_review' => Idea::where('status', 'stage 1 review')->count(),
                        'stage2_review' => Idea::where('status', 'stage 2 review')->count(),
                        'approved' => Idea::where('status', 'approved')->count(),
                        'rejected' => Idea::where('status', 'rejected')->count(),
                        'revision_requested' => Idea::where('status', 'revision requested')->count(),
                    ],
                ],
                'ideas_collaborated' => [
                    'total_with_collaborations' => Idea::where('collaboration_enabled', true)->count(),
                    'my_collaboration_requests' => CollaborationRequest::where('requester_id', $user->id)->count(),
                    'received_collaboration_requests' => CollaborationRequest::where('owner_id', $user->id)->count(),
                ],
                'collaborations_sent' => [
                    'total_sent' => CollaborationRequest::where('requester_id', $user->id)->count(),
                    'by_status' => [
                        'pending' => CollaborationRequest::where('requester_id', $user->id)->where('status', 'pending')->count(),
                        'approved' => CollaborationRequest::where('requester_id', $user->id)->where('status', 'approved')->count(),
                        'rejected' => CollaborationRequest::where('requester_id', $user->id)->where('status', 'rejected')->count(),
                    ],
                ],
                'challenges' => [
                    'active' => Challenge::where('status', 'active')->count(),
                    'participated' => ChallengeSubmission::where('submitted_by', $user->id)->count(),
                    'submissions_by_status' => [
                        'draft' => ChallengeSubmission::where('submitted_by', $user->id)->where('status', 'draft')->count(),
                        'submitted' => ChallengeSubmission::where('submitted_by', $user->id)->where('status', 'submitted')->count(),
                        'under_review' => ChallengeSubmission::where('submitted_by', $user->id)->where('status', 'under_review')->count(),
                        'approved' => ChallengeSubmission::where('submitted_by', $user->id)->where('status', 'approved')->count(),
                        'rejected' => ChallengeSubmission::where('submitted_by', $user->id)->where('status', 'rejected')->count(),
                    ],
                ],
                'idea_reviews_done' => [
                    'total_reviews' => IdeaReview::where('reviewer_id', $user->id)->count(),
                    'stage1_reviews' => IdeaReview::where('reviewer_id', $user->id)->where('review_stage', 'stage1')->count(),
                    'stage2_reviews' => IdeaReview::where('reviewer_id', $user->id)->where('review_stage', 'stage2')->count(),
                    'by_recommendation' => [
                        'approve' => IdeaReview::where('reviewer_id', $user->id)->where('recommendation', 'approve')->count(),
                        'revise' => IdeaReview::where('reviewer_id', $user->id)->where('recommendation', 'revise')->count(),
                        'reject' => IdeaReview::where('reviewer_id', $user->id)->where('recommendation', 'reject')->count(),
                    ],
                ],
                'recent_activity' => [
                    'my_recent_ideas' => Idea::where('user_id', $user->id)->latest()->take(3)->get(['id', 'idea_title', 'status', 'created_at']),
                    'my_recent_reviews' => IdeaReview::where('reviewer_id', $user->id)->with('idea:id,idea_title')->latest()->take(3)->get(['id', 'idea_id', 'review_stage', 'recommendation', 'reviewed_at']),
                    'my_recent_submissions' => ChallengeSubmission::where('submitted_by', $user->id)->with('challenge:id,title')->latest()->take(3)->get(['id', 'challenge_id', 'title', 'status', 'submitted_at']),
                ],
            ];
        }

        // Challenge Review Stats section - only if user has 'challenge-review-stats' permission
        if ($user->can('challenge-review-stats')) {
            $data['challengeReviewStats'] = [
                'ideas_submitted' => [
                    'total' => Idea::count(),
                    'by_stage' => [
                        'draft' => Idea::where('status', 'draft')->count(),
                        'stage1_review' => Idea::where('status', 'stage 1 review')->count(),
                        'stage2_review' => Idea::where('status', 'stage 2 review')->count(),
                        'approved' => Idea::where('status', 'approved')->count(),
                        'rejected' => Idea::where('status', 'rejected')->count(),
                        'revision_requested' => Idea::where('status', 'revision requested')->count(),
                    ],
                ],
                'ideas_collaborated' => [
                    'total_with_collaborations' => Idea::where('collaboration_enabled', true)->count(),
                ],
                'collaborations' => [
                    'total_requests' => CollaborationRequest::count(),
                    'by_status' => [
                        'pending' => CollaborationRequest::where('status', 'pending')->count(),
                        'approved' => CollaborationRequest::where('status', 'approved')->count(),
                        'rejected' => CollaborationRequest::where('status', 'rejected')->count(),
                    ],
                ],
                'challenges' => [
                    'active' => Challenge::where('status', 'active')->count(),
                    'participated' => ChallengeSubmission::count(),
                    'submissions_by_status' => [
                        'draft' => ChallengeSubmission::where('status', 'draft')->count(),
                        'submitted' => ChallengeSubmission::where('status', 'submitted')->count(),
                        'under_review' => ChallengeSubmission::where('status', 'under_review')->count(),
                        'approved' => ChallengeSubmission::where('status', 'approved')->count(),
                        'rejected' => ChallengeSubmission::where('status', 'rejected')->count(),
                    ],
                ],
                'challenge_reviews_done' => [
                    'total_reviews' => ChallengeSubmissionReview::where('reviewer_id', $user->id)->count(),
                    'stage1_reviews' => ChallengeSubmissionReview::where('reviewer_id', $user->id)->where('review_stage', 'stage 1')->count(),
                    'stage2_reviews' => ChallengeSubmissionReview::where('reviewer_id', $user->id)->where('review_stage', 'stage 2')->count(),
                    'by_recommendation' => [
                        'approve' => ChallengeSubmissionReview::where('reviewer_id', $user->id)->where('recommendation', 'approve')->count(),
                        'revise' => ChallengeSubmissionReview::where('reviewer_id', $user->id)->where('recommendation', 'revise')->count(),
                        'reject' => ChallengeSubmissionReview::where('reviewer_id', $user->id)->where('recommendation', 'reject')->count(),
                    ],
                ],
                'personal_logs' => [
                    [
                        'id' => 1,
                        'action' => 'Challenge Review Completed',
                        'description' => 'Reviewed challenge submission: "AI Healthcare Solution"',
                        'timestamp' => now()->subDays(2)->toISOString(),
                        'type' => 'challenge_review',
                    ],
                    [
                        'id' => 2,
                        'action' => 'Decision Made',
                        'description' => 'Approved challenge submission for "Smart City Initiative"',
                        'timestamp' => now()->subDays(1)->toISOString(),
                        'type' => 'decision',
                    ],
                    [
                        'id' => 3,
                        'action' => 'Idea Submitted',
                        'description' => 'Submitted new idea: "Sustainable Energy Platform"',
                        'timestamp' => now()->subHours(12)->toISOString(),
                        'type' => 'idea',
                    ],
                    [
                        'id' => 4,
                        'action' => 'Collaboration Requested',
                        'description' => 'Sent collaboration request to Jane Smith',
                        'timestamp' => now()->subHours(8)->toISOString(),
                        'type' => 'collaboration',
                    ],
                    [
                        'id' => 5,
                        'action' => 'Challenge Participated',
                        'description' => 'Participated in "Innovation Challenge 2025"',
                        'timestamp' => now()->subHours(4)->toISOString(),
                        'type' => 'challenge',
                    ],
                ],
            ];
        }

        // Add other permission-based sections here as needed

        return Inertia::render('Dashboard/Index', $data);
    }
}