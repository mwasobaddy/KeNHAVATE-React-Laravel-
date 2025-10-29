<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;
use App\Http\Controllers\Idea\IdeaController;
use App\Http\Controllers\Idea\IdeaLikeController;
use App\Http\Controllers\CollaborationController;
use App\Http\Controllers\CollaborationProposalController;

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
    
    // Review workflow management routes will be added here
    // User management (non-admin) routes will be added here
    // Challenge creation routes will be added here
});

// Review routes for SME and Board
Route::middleware(['auth', 'verified'])->prefix('review')->name('review.')->group(function () {
    // SME Stage 1 Review routes
    Route::middleware(['permission:review.ideas-stage1'])->prefix('stage1')->name('stage1.')->group(function () {
        Route::get('/', function () {
            return Inertia::render('Review/Stage1/Dashboard');
        })->name('dashboard');
        // Stage 1 review routes will be added here
    });
    
    // Board Stage 2 Review routes  
    Route::middleware(['permission:review.ideas-stage2'])->prefix('stage2')->name('stage2.')->group(function () {
        Route::get('/', function () {
            return Inertia::render('Review/Stage2/Dashboard');
        })->name('dashboard');
        // Stage 2 review routes will be added here
    });
    
    // Challenge Review routes
    Route::middleware(['permission:review.challenge-submissions'])->prefix('challenges')->name('challenges.')->group(function () {
        Route::get('/', function () {
            return Inertia::render('Review/Challenges/Dashboard');
        })->name('dashboard');
        // Challenge review routes will be added here
    });
});

require __DIR__.'/settings.php';
