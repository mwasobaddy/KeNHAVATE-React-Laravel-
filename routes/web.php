<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;
use App\Http\Controllers\Idea\IdeaController;
use App\Http\Controllers\Idea\IdeaLikeController;

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
    Route::put('ideas/{slug}', [IdeaController::class, 'update'])->name('ideas.update');
    Route::post('ideas/{idea}/toggle-like', [IdeaLikeController::class, 'toggle'])->name('ideas.toggle-like');
    Route::post('ideas/{idea}/toggle-collaboration', [IdeaController::class, 'toggleCollaboration'])->name('ideas.toggle-collaboration');
    Route::get('ideas/{slug}/comments', [IdeaController::class, 'comments'])->name('ideas.comments');
    Route::post('ideas/{slug}/comments', [IdeaController::class, 'storeComment'])->name('ideas.comments.store');
    Route::delete('ideas/{idea}', [IdeaController::class, 'destroy'])->name('ideas.destroy');
    Route::post('ideas/delete-selected', [IdeaController::class, 'destroySelected'])->name('ideas.destroy-selected');
});

require __DIR__.'/settings.php';
