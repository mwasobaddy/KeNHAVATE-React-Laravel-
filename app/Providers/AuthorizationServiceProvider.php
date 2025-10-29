<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Gate;
use App\Models\Idea;
use App\Models\CollaborationProposal;

class AuthorizationServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        //
    }

    /**  
     * Bootstrap services.
     */
    public function boot(): void
    {
        // Idea authorization gates
        Gate::define('edit-idea', function ($user, $idea) {
            // Admin and DD can edit any idea
            if ($user->hasRole(['admin', 'deputy-director'])) {
                return true;
            }
            
            // Owners can edit their own ideas unless under review
            if ($idea->user_id === $user->id) {
                // Cannot edit during review unless it's in revision status
                return !in_array($idea->status, ['stage 1 review', 'stage 2 review']) || 
                       in_array($idea->status, ['stage 1 revise', 'stage 2 revise']);
            }
            
            return false;
        });

        Gate::define('delete-idea', function ($user, $idea) {
            // Admin and DD can delete any idea
            if ($user->hasRole(['admin', 'deputy-director'])) {
                return true;
            }
            
            // Owners can delete their own ideas unless approved/under review
            if ($idea->user_id === $user->id) {
                return !in_array($idea->status, ['stage 1 review', 'stage 2 review', 'approved']);
            }
            
            return false;
        });

        // Review process gates
        Gate::define('review-idea-stage1', function ($user, $idea) {
            // Must be SME and not the idea owner
            return $user->hasRole('subject-matter-expert') && 
                   $idea->user_id !== $user->id &&
                   $idea->status === 'stage 1 review';
        });

        Gate::define('review-idea-stage2', function ($user, $idea) {
            // Must be Board member and not the idea owner
            return $user->hasRole('board') && 
                   $idea->user_id !== $user->id &&
                   $idea->status === 'stage 2 review';
        });

        Gate::define('manage-idea-workflow', function ($user, $idea) {
            // Only DD can manage workflow transitions
            return $user->hasRole('deputy-director');
        });

        // Collaboration gates
        Gate::define('collaborate-on-idea', function ($user, $idea) {
            // Cannot collaborate on own idea
            if ($idea->user_id === $user->id) {
                return false;
            }
            
            // Idea must be open for collaboration
            if (!$idea->collaboration_enabled) {
                return false;
            }
            
            // SME cannot collaborate during stage 1 review (conflict of interest)
            if ($idea->status === 'stage 1 review' && $user->hasRole('subject-matter-expert')) {
                return false;
            }
            
            return true;
        });

        Gate::define('manage-collaboration-proposal', function ($user, $proposal) {
            // Admin and DD can manage any proposal
            if ($user->hasRole(['admin', 'deputy-director'])) {
                return true;
            }
            
            // Idea owner can manage proposals for their ideas
            return $proposal->idea->user_id === $user->id;
        });
    }
}
