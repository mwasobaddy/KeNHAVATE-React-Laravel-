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

    // Idea routes
    Route::get('ideas', [IdeaController::class, 'index'])->name('ideas.index');
    Route::get('ideas/create', [IdeaController::class, 'create'])->name('ideas.create');
    Route::post('ideas', [IdeaController::class, 'store'])->name('ideas.store');
    Route::get('ideas/{slug}/view', [IdeaController::class, 'show'])->name('ideas.show');
    Route::get('ideas/{slug}/attachment', [IdeaController::class, 'attachment'])->name('ideas.attachment');
    Route::get('ideas/{slug}/edit', [IdeaController::class, 'edit'])->name('ideas.edit');
    Route::patch('ideas/{slug}', [IdeaController::class, 'update'])->name('ideas.update');
    Route::patch('ideas/{slug}/remove-attachment', [IdeaController::class, 'removeAttachment'])->name('ideas.remove-attachment');
    Route::post('ideas/{idea}/toggle-like', [IdeaLikeController::class, 'toggle'])->name('ideas.toggle-like');
    Route::post('ideas/{idea}/toggle-collaboration', [IdeaController::class, 'toggleCollaboration'])->name('ideas.toggle-collaboration');
    Route::post('ideas/{idea}/toggle-comments', [IdeaController::class, 'toggleComment'])->name('ideas.toggle-comments');
    Route::get('ideas/{slug}/comments', [IdeaController::class, 'comments'])->name('ideas.comments');
    Route::post('ideas/{slug}/comments', [IdeaController::class, 'storeComment'])->name('ideas.comments.store');
    Route::patch('ideas/{slug}/comments/{comment}', [IdeaController::class, 'updateComment'])->name('ideas.comments.update');
    Route::delete('ideas/{slug}/comments/{comment}', [IdeaController::class, 'destroyComment'])->name('ideas.comments.destroy');
    Route::delete('ideas/{idea}', [IdeaController::class, 'destroy'])->name('ideas.destroy');
    Route::post('ideas/delete-selected', [IdeaController::class, 'destroySelected'])->name('ideas.destroy-selected');

    // Collaboration routes
    Route::get('collaboration', [CollaborationController::class, 'index'])->name('collaboration.index');
    Route::post('collaboration/{ideaSlug}/request', [CollaborationController::class, 'sendRequest'])->name('collaboration.request');
    Route::delete('collaboration/requests/{requestId}', [CollaborationController::class, 'cancelRequest'])->name('collaboration.cancel');
    Route::get('collaboration/inbox', [CollaborationController::class, 'inbox'])->name('collaboration.inbox');
    Route::get('collaboration/outbox', [CollaborationController::class, 'outbox'])->name('collaboration.outbox');
    Route::post('collaboration/requests/{requestId}/respond', [CollaborationController::class, 'respond'])->name('collaboration.respond');
    
    // Collaboration Proposal routes
    Route::get('collaboration/{ideaSlug}/propose', [CollaborationProposalController::class, 'create'])->name('collaboration.propose');
    Route::post('collaboration/{ideaSlug}/propose', [CollaborationProposalController::class, 'store'])->name('collaboration.propose.store');
    Route::get('collaboration/{ideaSlug}/review', [CollaborationProposalController::class, 'review'])->name('collaboration.review');
    Route::post('collaboration/proposals/{proposal}/respond', [CollaborationProposalController::class, 'respond'])->name('collaboration.proposal.respond');
    Route::post('collaboration/{ideaSlug}/rollback', [CollaborationProposalController::class, 'rollback'])->name('collaboration.rollback');
    
    // Collaboration Management routes
    Route::get('collaboration/my-proposals', [CollaborationProposalController::class, 'myProposals'])->name('collaboration.my-proposals');
    Route::get('collaboration/proposals/{proposal}', [CollaborationProposalController::class, 'show'])->name('collaboration.proposal.show');
    Route::get('collaboration/received-proposals', [CollaborationProposalController::class, 'receivedProposals'])->name('collaboration.received-proposals');
    Route::get('collaboration/manage/{ideaSlug}', [CollaborationProposalController::class, 'manage'])->name('collaboration.manage');
});

require __DIR__.'/settings.php';
