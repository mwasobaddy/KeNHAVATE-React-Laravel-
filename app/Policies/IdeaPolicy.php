<?php

namespace App\Policies;

use App\Models\Idea;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class IdeaPolicy
{
    /**
     * Determine whether the user can view any ideas.
     */
    public function viewAny(User $user): bool
    {
        // Users can view ideas if they have basic permissions
        return $user->can('view.own-ideas') || $user->can('view.any-ideas');
    }

    /**
     * Determine whether the user can view the idea.
     *
     * Users can view an idea if:
     * - Collaboration is enabled on the idea, OR
     * - Comments are enabled on the idea, OR
     * - User has view.any-ideasReviewers permission, OR
     * - User has view.any-ideasAdmin permission
     */
    public function view(User $user, Idea $idea): bool
    {
        // If user owns the idea, they can always view it
        if ($user->id === $idea->user_id) {
            return true;
        }

        // Check if collaboration or comments are enabled
        if ($idea->collaboration_enabled || $idea->comments_enabled) {
            return true;
        }

        // Check for special view permissions
        if ($user->can('view.any-ideasAdmin') || $user->can('view.any-ideasReviewers')) {
            return true;
        }

        // Check for admin view permission
        if ($user->can('view.any-ideas')) {
            return true;
        }

        return false;
    }

    /**
     * Determine whether the user can create ideas.
     */
    public function create(User $user): bool
    {
        return $user->can('create.ideas');
    }

    /**
     * Determine whether the user can update the idea.
     */
    public function update(User $user, Idea $idea): bool
    {
        // User can update their own ideas
        if ($user->id === $idea->user_id && $user->can('edit.own-ideas')) {
            return true;
        }

        // Admins can edit any ideas
        if ($user->can('edit.any-ideas')) {
            return true;
        }

        return false;
    }

    /**
     * Determine whether the user can delete the idea.
     */
    public function delete(User $user, Idea $idea): bool
    {
        // User can soft delete their own ideas
        if ($user->id === $idea->user_id && $user->can('soft-delete.own-ideas')) {
            return true;
        }

        // Admins can delete any ideas
        if ($user->can('soft-delete.any-ideas')) {
            return true;
        }

        return false;
    }

    /**
     * Determine whether the user can permanently delete the idea.
     */
    public function forceDelete(User $user, Idea $idea): bool
    {
        // User can permanently delete their own ideas
        if ($user->id === $idea->user_id && $user->can('permanent-delete.own-ideas')) {
            return true;
        }

        // Admins can permanently delete any ideas
        if ($user->can('permanent-delete.any-ideas')) {
            return true;
        }

        return false;
    }

    /**
     * Determine whether the user can restore the idea.
     */
    public function restore(User $user, Idea $idea): bool
    {
        // User can restore their own ideas
        if ($user->id === $idea->user_id && $user->can('restore.own-ideas')) {
            return true;
        }

        // Admins can restore any ideas
        if ($user->can('restore.any-ideas')) {
            return true;
        }

        return false;
    }

    /**
     * Determine whether the user can review the idea.
     */
    public function review(User $user, Idea $idea): bool
    {
        return $user->can('review.ideas-stage1') || $user->can('review.ideas-stage2');
    }

    /**
     * Determine whether the user can comment on the idea.
     */
    public function comment(User $user, Idea $idea): bool
    {
        // Can comment if comments are enabled and user has permission
        return $idea->comments_enabled && $user->can('comment.on-ideas');
    }

    /**
     * Determine whether the user can request collaboration on the idea.
     */
    public function requestCollaboration(User $user, Idea $idea): bool
    {
        // Can request collaboration if it's enabled and user has permission
        return $idea->collaboration_enabled &&
               $user->id !== $idea->user_id &&
               $user->can('request.collaboration');
    }
}