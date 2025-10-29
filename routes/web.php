<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;
use App\Http\Controllers\Idea\IdeaController;
use App\Http\Controllers\Idea\IdeaLikeController;
use App\Http\Controllers\CollaborationController;
use App\Http\Controllers\CollaborationProposalController;
use App\Http\Controllers\ReviewController;
use App\Http\Controllers\ChallengeController;
use App\Http\Controllers\ChallengeSubmissionController;
use App\Http\Controllers\ChallengeReviewController;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    // Idea routes - Basic access for all authenticated users
    Route::get('ideas', [IdeaController::class, 'index'])->name('ideas.index');
    Route::get('ideas/{slug}/view', [IdeaController::class, 'show'])->name('ideas.show');
    Route::get('ideas/{slug}/attachment', [IdeaController::class, 'attachment'])->name('ideas.attachment');
    Route::get('ideas/{slug}/comments', [IdeaController::class, 'comments'])->name('ideas.comments');
    Route::post('ideas/{idea}/toggle-like', [IdeaLikeController::class, 'toggle'])->name('ideas.toggle-like');

    // Idea creation and editing - Requires create/edit permissions
    Route::get('ideas/create', [IdeaController::class, 'create'])->middleware('permission:create.ideas')->name('ideas.create');
    Route::post('ideas', [IdeaController::class, 'store'])->middleware('permission:create.ideas')->name('ideas.store');
    Route::get('ideas/{slug}/edit', [IdeaController::class, 'edit'])->middleware('permission:edit.own-ideas')->name('ideas.edit');
    Route::patch('ideas/{slug}', [IdeaController::class, 'update'])->middleware('permission:edit.own-ideas')->name('ideas.update');
    Route::patch('ideas/{slug}/remove-attachment', [IdeaController::class, 'removeAttachment'])->middleware('permission:edit.own-ideas')->name('ideas.remove-attachment');
    Route::delete('ideas/{idea}', [IdeaController::class, 'destroy'])->middleware('permission:delete.own-ideas')->name('ideas.destroy');
    Route::post('ideas/delete-selected', [IdeaController::class, 'destroySelected'])->middleware('permission:delete.own-ideas')->name('ideas.destroy-selected');

    // Idea management - Author/owner specific actions
    Route::post('ideas/{idea}/toggle-collaboration', [IdeaController::class, 'toggleCollaboration'])->middleware('permission:edit.own-ideas')->name('ideas.toggle-collaboration');
    Route::post('ideas/{idea}/toggle-comments', [IdeaController::class, 'toggleComment'])->middleware('permission:edit.own-ideas')->name('ideas.toggle-comments');
    Route::post('ideas/{slug}/comments', [IdeaController::class, 'storeComment'])->middleware('permission:comment.on-ideas')->name('ideas.comments.store');
    Route::patch('ideas/{slug}/comments/{comment}', [IdeaController::class, 'updateComment'])->name('ideas.comments.update');
    Route::delete('ideas/{slug}/comments/{comment}', [IdeaController::class, 'destroyComment'])->name('ideas.comments.destroy');

    // Collaboration routes - Basic collaboration access
    Route::get('collaboration', [CollaborationController::class, 'index'])->name('collaboration.index');
    Route::post('collaboration/{ideaSlug}/request', [CollaborationController::class, 'sendRequest'])->middleware('permission:request.collaboration')->name('collaboration.request');
    Route::delete('collaboration/requests/{requestId}', [CollaborationController::class, 'cancelRequest'])->name('collaboration.cancel');
    Route::get('collaboration/inbox', [CollaborationController::class, 'inbox'])->name('collaboration.inbox');
    Route::get('collaboration/outbox', [CollaborationController::class, 'outbox'])->name('collaboration.outbox');
    Route::post('collaboration/requests/{requestId}/respond', [CollaborationController::class, 'respond'])->name('collaboration.respond');
    
    // Collaboration Proposal routes - Proposal submission and management
    Route::get('collaboration/{ideaSlug}/propose', [CollaborationProposalController::class, 'create'])->middleware('permission:submit.collaboration-proposals')->name('collaboration.propose');
    Route::post('collaboration/{ideaSlug}/propose', [CollaborationProposalController::class, 'store'])->middleware('permission:submit.collaboration-proposals')->name('collaboration.propose.store');
    Route::get('collaboration/{ideaSlug}/review', [CollaborationProposalController::class, 'review'])->middleware('permission:manage.collaboration-proposals')->name('collaboration.review');
    Route::post('collaboration/proposals/{proposal}/respond', [CollaborationProposalController::class, 'respond'])->middleware('permission:approve.collaboration-proposals')->name('collaboration.proposal.respond');
    Route::post('collaboration/{ideaSlug}/rollback', [CollaborationProposalController::class, 'rollback'])->middleware('permission:manage.collaboration-proposals')->name('collaboration.rollback');
    
    // Collaboration Management routes - Personal proposal tracking
    Route::get('collaboration/my-proposals', [CollaborationProposalController::class, 'myProposals'])->name('collaboration.my-proposals');
    Route::get('collaboration/proposals/{proposal}', [CollaborationProposalController::class, 'show'])->name('collaboration.proposal.show');
    Route::get('collaboration/received-proposals', [CollaborationProposalController::class, 'receivedProposals'])->middleware('permission:manage.collaboration-proposals')->name('collaboration.received-proposals');
    Route::get('collaboration/manage/{ideaSlug}', [CollaborationProposalController::class, 'manage'])->middleware('permission:manage.collaboration-roles')->name('collaboration.manage');
});

// Admin routes - Full system management
Route::middleware(['auth', 'verified', 'role:admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('Admin/Dashboard');
    })->name('dashboard');
    
    // User management routes will be added here
    // System settings routes will be added here
    // Reports and analytics routes will be added here
});

// Deputy Director routes - Workflow management and user oversight
Route::middleware(['auth', 'verified', 'role:deputy-director'])->prefix('dd')->name('dd.')->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('DeputyDirector/Dashboard');
    })->name('dashboard');
    
    // Review workflow management routes
    Route::get('review-workflow', [ReviewController::class, 'ddWorkflowDashboard'])->name('review.dashboard');
    Route::get('review/idea/{id}', [ReviewController::class, 'showIdeaForReview'])->name('review.idea.show');
    Route::post('review/idea/{id}/decision', [ReviewController::class, 'makeDecision'])->name('review.idea.decision');
    
    // User management (non-admin) routes will be added here
    // Challenge management routes
    Route::middleware(['permission:manage.challenges'])->prefix('challenges')->name('challenges.')->group(function () {
        Route::get('/', [ChallengeController::class, 'index'])->name('index');
        Route::get('create', [ChallengeController::class, 'create'])->name('create');
        Route::post('/', [ChallengeController::class, 'store'])->name('store');
        Route::get('{challenge}/edit', [ChallengeController::class, 'edit'])->name('edit');
        Route::patch('{challenge}', [ChallengeController::class, 'update'])->name('update');
        Route::delete('{challenge}', [ChallengeController::class, 'destroy'])->name('destroy');
        Route::post('{challenge}/activate', [ChallengeController::class, 'activate'])->name('activate');
        Route::post('{challenge}/close', [ChallengeController::class, 'close'])->name('close');
    });
});

// Review routes for SME, Board, DD, and Authors
Route::middleware(['auth', 'verified'])->prefix('review')->name('review.')->group(function () {
    // SME Stage 1 Review routes
    Route::middleware(['permission:review.ideas-stage1'])->prefix('sme')->name('sme.')->group(function () {
        Route::get('dashboard', [ReviewController::class, 'smeReviewDashboard'])->name('dashboard');
        Route::get('idea/{slug}', [ReviewController::class, 'showIdeaForReview'])->name('idea.show');
        Route::post('idea/{id}/review', [ReviewController::class, 'submitReview'])->name('idea.review');
    });
    
    // Board Stage 2 Review routes  
    Route::middleware(['permission:review.ideas-stage2'])->prefix('board')->name('board.')->group(function () {
        Route::get('dashboard', [ReviewController::class, 'boardReviewDashboard'])->name('dashboard');
        Route::get('idea/{slug}', [ReviewController::class, 'showIdeaForReview'])->name('idea.show');
        Route::post('idea/{id}/review', [ReviewController::class, 'submitReview'])->name('idea.review');
    });
    
    // Deputy Director Workflow Management routes
    Route::middleware(['permission:manage.review-decisions'])->prefix('dd')->name('dd.')->group(function () {
        Route::get('dashboard', [ReviewController::class, 'ddWorkflowDashboard'])->name('dashboard');
        Route::get('idea/{slug}', [ReviewController::class, 'showIdeaForReview'])->name('idea.show');
        Route::post('decision/{id}', [ReviewController::class, 'makeDecision'])->name('decision.make');
    });
    
    // Author Review Status routes
    Route::prefix('author')->name('author.')->group(function () {
        Route::get('dashboard', [ReviewController::class, 'authorReviewDashboard'])->name('dashboard');
        Route::get('idea/{slug}', [ReviewController::class, 'showIdeaForReview'])->name('idea.show');
    });
    
    // Challenge Review routes - SME Stage 1 Reviews
    Route::middleware(['permission:review.challenge-submissions'])->prefix('challenges/sme')->name('challenges.sme.')->group(function () {
        Route::get('dashboard', [ChallengeReviewController::class, 'smeReviewDashboard'])->name('dashboard');
        Route::get('submission/{submission}', [ChallengeReviewController::class, 'showSubmissionForReview'])->name('submission.show');
        Route::post('submission/{submission}/review', [ChallengeReviewController::class, 'submitReview'])->name('submission.review');
    });
    
    // Challenge Review routes - Board Stage 2 Reviews
    Route::middleware(['permission:review.challenge-submissions'])->prefix('challenges/board')->name('challenges.board.')->group(function () {
        Route::get('dashboard', [ChallengeReviewController::class, 'boardReviewDashboard'])->name('dashboard');
        Route::get('submission/{submission}', [ChallengeReviewController::class, 'showSubmissionForReview'])->name('submission.show');
        Route::post('submission/{submission}/review', [ChallengeReviewController::class, 'submitReview'])->name('submission.review');
    });
    
    // Challenge Review routes - DD Workflow Management
    Route::middleware(['permission:manage.review-decisions'])->prefix('challenges/dd')->name('challenges.dd.')->group(function () {
        Route::get('dashboard', [ChallengeReviewController::class, 'ddWorkflowDashboard'])->name('dashboard');
        Route::get('submission/{submission}', [ChallengeReviewController::class, 'showSubmissionForReview'])->name('submission.show');
        Route::post('decision/{submission}', [ChallengeReviewController::class, 'makeDecision'])->name('decision.make');
    });
});

// Challenge participation routes - Available to all authenticated users
Route::middleware(['auth', 'verified'])->prefix('challenges')->name('challenges.')->group(function () {
    Route::get('/', [ChallengeController::class, 'publicIndex'])->name('public.index');
    Route::get('{challenge}', [ChallengeController::class, 'show'])->name('show');
    Route::get('{challenge}/attachment', [ChallengeController::class, 'attachment'])->name('attachment');
    
    // Submission routes
    Route::get('{challenge}/submit', [ChallengeSubmissionController::class, 'create'])->name('submit');
    Route::post('{challenge}/submissions', [ChallengeSubmissionController::class, 'store'])->name('submissions.store');
    Route::get('submissions/my-submissions', [ChallengeSubmissionController::class, 'mySubmissions'])->name('submissions.mine');
    Route::get('submissions/{submission}', [ChallengeSubmissionController::class, 'show'])->name('submissions.show');
    Route::get('submissions/{submission}/edit', [ChallengeSubmissionController::class, 'edit'])->name('submissions.edit');
    Route::patch('submissions/{submission}', [ChallengeSubmissionController::class, 'update'])->name('submissions.update');
    Route::get('submissions/{submission}/attachment', [ChallengeSubmissionController::class, 'attachment'])->name('submissions.attachment');
});

require __DIR__.'/settings.php';
