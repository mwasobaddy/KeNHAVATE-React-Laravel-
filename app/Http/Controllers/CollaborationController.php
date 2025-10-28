<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Idea;
use App\Models\CollaborationRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class CollaborationController extends Controller
{
    /**
     * Display available ideas for collaboration.
     */
    public function index()
    {
        $user = Auth::user();

        // Get ideas available for collaboration
        $ideas = Idea::with(['user', 'thematicArea'])
            ->where('collaboration_enabled', true)
            ->whereIn('status', ['draft', 'stage 1 review', 'stage 1 revise'])
            ->where('user_id', '!=', $user->id)
            ->with(['collaborationRequests' => function ($query) use ($user) {
                $query->where('requester_id', $user->id);
            }])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($idea) use ($user) {
                $existingRequest = $idea->collaborationRequests->first();

                return [
                    'id' => $idea->id,
                    'title' => $idea->idea_title,
                    'description' => $idea->abstract,
                    'status' => $idea->status,
                    'created_at' => $idea->created_at?->format('M d, Y'),
                    'user' => $idea->user ? ['id' => $idea->user->id, 'name' => $idea->user->name] : null,
                    'thematic_area' => $idea->thematicArea ? ['id' => $idea->thematicArea->id, 'name' => $idea->thematicArea->name] : null,
                    'slug' => $idea->slug,
                    'has_pending_request' => $existingRequest && $existingRequest->status === 'pending',
                    'existing_request_id' => $existingRequest ? $existingRequest->id : null,
                    'request_status' => $existingRequest ? $existingRequest->status : null,
                ];
            });

        return Inertia::render('Collaboration/Index', compact('ideas'));
    }

    /**
     * Send a collaboration request.
     */
    public function sendRequest(Request $request, $ideaSlug)
    {
        $user = Auth::user();
        $idea = Idea::where('slug', $ideaSlug)->first();

        if (!$idea) {
            return response()->json(['message' => 'Idea not found'], 404);
        }

        // Check if collaboration is enabled and status allows it
        if (!$idea->collaboration_enabled || !in_array($idea->status, ['draft', 'stage 1 review', 'stage 1 revise'])) {
            return response()->json(['message' => 'Collaboration not available for this idea'], 403);
        }

        // Check if user owns the idea
        if ($idea->user_id === $user->id) {
            return response()->json(['message' => 'You cannot request collaboration on your own idea'], 403);
        }

        // Check if request already exists
        $existingRequest = CollaborationRequest::where('idea_id', $idea->id)
            ->where('requester_id', $user->id)
            ->first();

        if ($existingRequest) {
            return response()->json(['message' => 'You have already sent a collaboration request for this idea'], 409);
        }

        // Create collaboration request
        $collaborationRequest = CollaborationRequest::create([
            'idea_id' => $idea->id,
            'requester_id' => $user->id,
            'owner_id' => $idea->user_id,
            'message' => $request->input('message'),
        ]);

        Log::info('Collaboration request sent', [
            'idea_id' => $idea->id,
            'requester_id' => $user->id,
            'request_id' => $collaborationRequest->id
        ]);

        return response()->json([
            'message' => 'Collaboration request sent successfully',
            'request_id' => $collaborationRequest->id
        ]);
    }

    /**
     * Cancel a collaboration request.
     */
    public function cancelRequest($requestId)
    {
        $user = Auth::user();
        $request = CollaborationRequest::find($requestId);

        if (!$request) {
            return response()->json(['message' => 'Collaboration request not found'], 404);
        }

        if (!$request->canBeCancelledBy($user->id)) {
            return response()->json(['message' => 'You cannot cancel this request'], 403);
        }

        $request->delete();

        Log::info('Collaboration request cancelled', [
            'request_id' => $request->id,
            'requester_id' => $user->id
        ]);

        return response()->json(['message' => 'Collaboration request cancelled']);
    }

    /**
     * Display incoming collaboration requests (Inbox).
     */
    public function inbox()
    {
        $user = Auth::user();

        $requests = CollaborationRequest::with(['idea.user', 'requester'])
            ->where('owner_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($request) {
                return [
                    'id' => $request->id,
                    'status' => $request->status,
                    'message' => $request->message,
                    'created_at' => $request->created_at->format('M d, Y \a\t g:i A'),
                    'responded_at' => $request->responded_at?->format('M d, Y \a\t g:i A'),
                    'idea' => [
                        'id' => $request->idea->id,
                        'title' => $request->idea->idea_title,
                        'slug' => $request->idea->slug,
                        'status' => $request->idea->status,
                        'user' => ['name' => $request->idea->user->name],
                    ],
                    'requester' => [
                        'id' => $request->requester->id,
                        'name' => $request->requester->name,
                    ],
                ];
            });

        return Inertia::render('Collaboration/Inbox', compact('requests'));
    }

    /**
     * Display outgoing collaboration requests (Outbox).
     */
    public function outbox()
    {
        $user = Auth::user();

        $requests = CollaborationRequest::with(['idea.user', 'owner'])
            ->where('requester_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($request) {
                return [
                    'id' => $request->id,
                    'status' => $request->status,
                    'message' => $request->message,
                    'created_at' => $request->created_at->format('M d, Y \a\t g:i A'),
                    'responded_at' => $request->responded_at?->format('M d, Y \a\t g:i A'),
                    'idea' => [
                        'id' => $request->idea->id,
                        'title' => $request->idea->idea_title,
                        'slug' => $request->idea->slug,
                        'status' => $request->idea->status,
                        'user' => ['name' => $request->idea->user->name],
                    ],
                    'owner' => [
                        'id' => $request->owner->id,
                        'name' => $request->owner->name,
                    ],
                ];
            });

        return Inertia::render('Collaboration/Outbox', compact('requests'));
    }

    /**
     * Respond to a collaboration request (approve/reject).
     */
    public function respond(Request $request, $requestId)
    {
        $user = Auth::user();
        $collaborationRequest = CollaborationRequest::find($requestId);

        if (!$collaborationRequest) {
            return response()->json(['message' => 'Collaboration request not found'], 404);
        }

        if (!$collaborationRequest->canBeRespondedBy($user->id)) {
            return response()->json(['message' => 'You cannot respond to this request'], 403);
        }

        $action = $request->input('action'); // 'approve' or 'reject'

        if (!in_array($action, ['approve', 'reject'])) {
            return response()->json(['message' => 'Invalid action'], 400);
        }

        $collaborationRequest->update([
            'status' => $action === 'approve' ? 'approved' : 'rejected',
            'responded_at' => now(),
        ]);

        // If approved, add user to collaboration members
        if ($action === 'approve') {
            // You might want to add the requester to collaboration members here
            // This depends on your CollaborationMember model structure
        }

        Log::info('Collaboration request responded', [
            'request_id' => $collaborationRequest->id,
            'owner_id' => $user->id,
            'action' => $action
        ]);

        return response()->json([
            'message' => "Collaboration request {$action}d successfully"
        ]);
    }
}
