<?php

namespace App\Http\Controllers\Idea;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Idea;
use App\Models\IdeaLike;
use App\Models\ThematicArea;
use App\Models\TeamMember;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Http\Request as HttpRequest;

class IdeaController extends Controller
{
    /**
     * Flash a message with specified type
     */
    private function flashMessage(string $message, string $type = 'success')
    {
        return redirect()->back()->with($type, $message);
    }

    /**
     * Flash a message and redirect to a specific route
     */
    private function flashMessageToRoute(string $route, string $message, array $params = [], string $type = 'success')
    {
        return redirect()->route($route, $params)->with($type, $message);
    }
    // index, show, create, store, edit, update, destroy methods would go here
    public function index()
    {
        // fetch and return a list of ideas
        $user = auth()->user();
        $likedIdeaIds = [];
        if ($user) {
            $likedIdeaIds = IdeaLike::where('user_id', $user->id)->pluck('idea_id')->toArray();
        }

        $ideas = Idea::with('user')->withTeam()->get()->map(function ($idea) use ($likedIdeaIds) {
            return [
                'id' => $idea->id,
                'title' => $idea->idea_title,
                'description' => $idea->abstract,
                'status' => $idea->status,
                'created_at' => $idea->created_at?->format('M d, Y'),
                'user' => $idea->user ? ['id' => $idea->user->id, 'name' => $idea->user->name] : null,
                'collaboration_enabled' => $idea->collaboration_enabled,
                'team_members_count' => $idea->team_members_count ?? 0,
                'comments_enabled' => $idea->comments_enabled,
                'collaboration_members_count' => $idea->collaboration_members_count ?? 0,
                'likes_count' => $idea->likes_count ?? 0,
                'current_revision_number' => $idea->current_revision_number,
                'slug' => $idea->slug,
                'liked_by_user' => in_array($idea->id, $likedIdeaIds),
            ];
        });

        return Inertia::render('Ideas/Index', compact('ideas'));

    }

    public function show($slug)
    {
        $idea = Idea::with('user', 'teamMembers', 'thematicArea')->withCount(['teamMembers', 'collaborationMembers', 'likes'])->where('slug', $slug)->first();
        if (!$idea) {
            return $this->flashMessageToRoute('ideas.index', 'Idea not found.', [], 'error');
        }
        return Inertia::render('Ideas/Show', compact('idea'));
    }

    public function create()
    {
        $thematicAreas = ThematicArea::active()->ordered()->get(['id', 'name']);
        return Inertia::render('Ideas/Create', compact('thematicAreas'));
    }

    public function store(Request $request)
    {
        $rules = [
            'idea_title' => 'required|string|min:10|max:50',
            'thematic_area_id' => 'required|integer|exists:thematic_areas,id',
            'abstract' => 'required|string|min:100|max:400',
            'problem_statement' => 'required|string|min:100|max:400',
            'proposed_solution' => 'required|string|min:100|max:400',
            'cost_benefit_analysis' => 'required|string|min:100|max:400',
            'declaration_of_interests' => 'required|string|min:100|max:400',
            'original_idea_disclaimer' => 'accepted',
            'collaboration_enabled' => 'boolean',
            'team_effort' => 'boolean',
            'comments_enabled' => 'boolean',
            'collaboration_deadline' => 'required_if:collaboration_enabled,true|nullable|date',
            'attachment' => 'required|file|mimes:pdf|max:5120',
            'team_members' => 'required_if:team_effort,true|array|min:1',
            'team_members.*.name' => 'required|string|max:255',
            'team_members.*.email' => 'required|email|max:255',
            'team_members.*.role' => 'required|string|max:255',
        ];

        $messages = [
            'team_members.required' => 'At least one team member is required when team effort is enabled.',
            'team_members.min' => 'At least one team member is required when team effort is enabled.',
            'team_members.*.name.required' => 'The team member name field is required.',
            'team_members.*.email.required' => 'The team member email field is required.',
            'team_members.*.email.email' => 'The team member email must be a valid email address.',
            'team_members.*.role.required' => 'The team member role field is required.',
        ];

        $validated = $request->validate($rules, $messages);

        // set user
        $validated['user_id'] = Auth::id();
        $validated['status'] = 'stage 1 review';

        // handle attachment
        if ($request->hasFile('attachment')) {
            $file = $request->file('attachment');
            $validated['attachment'] = file_get_contents($file->getRealPath());
            $validated['attachment_filename'] = $file->getClientOriginalName();
            $validated['attachment_mime'] = $file->getClientMimeType();
            $validated['attachment_size'] = $file->getSize();
        }

        // create idea
        $idea = Idea::create($validated);

        // create team members if provided
        if ($request->team_members) {
            foreach ($request->team_members as $member) {
                TeamMember::create([
                    'idea_id' => $idea->id,
                    'name' => $member['name'],
                    'email' => $member['email'],
                    'role' => $member['role'],
                ]);
            }
        }

        return $this->flashMessageToRoute('ideas.index', 'Idea created successfully!');
    }

    public function edit($slug)
    {
        $idea = Idea::with('teamMembers', 'thematicArea')->withCount(['teamMembers', 'collaborationMembers', 'likes'])->where('slug', $slug)->first();
        if (!$idea) {
            return $this->flashMessageToRoute('ideas.index', 'Idea not found.', [], 'error');
        }
        // Check ownership
        if ($idea->user_id !== Auth::id()) {
            return $this->flashMessageToRoute('ideas.index', 'You do not have permission to edit this idea.', [], 'error');
        }
        $thematicAreas = ThematicArea::active()->ordered()->get(['id', 'name']);
        return Inertia::render('Ideas/Edit', compact('idea', 'thematicAreas'));
    }

    public function update(Request $request, $slug)
    {
        $idea = Idea::where('slug', $slug)->first();
        if (!$idea) {
            return response()->json(['message' => 'Idea not found'], 404);
        }
        // Check ownership
        if ($idea->user_id !== Auth::id()) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $rules = [
            'idea_title' => 'required|string|min:10|max:50',
            'thematic_area_id' => 'required|integer|exists:thematic_areas,id',
            'abstract' => 'required|string|min:100|max:400',
            'problem_statement' => 'required|string|min:100|max:400',
            'proposed_solution' => 'required|string|min:100|max:400',
            'cost_benefit_analysis' => 'required|string|min:100|max:400',
            'declaration_of_interests' => 'required|string|min:100|max:400',
            'original_idea_disclaimer' => 'accepted',
            'collaboration_enabled' => 'boolean',
            'team_effort' => 'boolean',
            'comments_enabled' => 'boolean',
            'collaboration_deadline' => 'required_if:collaboration_enabled,true|nullable|date',
            'attachment' => 'nullable|file|mimes:pdf|max:5120',
            'team_members' => 'required_if:team_effort,true|array|min:1',
            'team_members.*.name' => 'required|string|max:255',
            'team_members.*.email' => 'required|email|max:255',
            'team_members.*.role' => 'required|string|max:255',
        ];

        $messages = [
            'team_members.required' => 'At least one team member is required when team effort is enabled.',
            'team_members.min' => 'At least one team member is required when team effort is enabled.',
            'team_members.*.name.required' => 'The team member name field is required.',
            'team_members.*.email.required' => 'The team member email field is required.',
            'team_members.*.email.email' => 'The team member email must be a valid email address.',
            'team_members.*.role.required' => 'The team member role field is required.',
        ];

        // Validate basic rules
        $validated = $request->validate($rules, $messages);

        // Add custom validation for attachment requirement
        $request->validate([
            'attachment' => [
                'nullable',
                'file',
                'mimes:pdf',
                'max:5120',
                function ($attribute, $value, $fail) use ($idea, $request) {
                    // Require attachment if no existing attachment and not removing
                    if (!$idea->attachment_filename && !$request->hasFile('attachment')) {
                        $fail('The attachment field is required.');
                    }
                },
            ],
        ], $messages);

        // handle attachment
        if ($request->hasFile('attachment')) {
            $file = $request->file('attachment');
            $validated['attachment'] = file_get_contents($file->getRealPath());
            $validated['attachment_filename'] = $file->getClientOriginalName();
            $validated['attachment_mime'] = $file->getClientMimeType();
            $validated['attachment_size'] = $file->getSize();
        }

        // update idea
        $idea->update($validated);

        // update team members: delete existing and create new
        TeamMember::where('idea_id', $idea->id)->delete();
        if ($request->team_members) {
            foreach ($request->team_members as $member) {
                TeamMember::create([
                    'idea_id' => $idea->id,
                    'name' => $member['name'],
                    'email' => $member['email'],
                    'role' => $member['role'],
                ]);
            }
        }

        return $this->flashMessageToRoute('ideas.show', 'Idea updated successfully!', [$idea->slug]);
    }

    public function removeAttachment(Request $request, $slug)
    {
        $idea = Idea::where('slug', $slug)->first();
        if (!$idea) {
            return response()->json(['message' => 'Idea not found'], 404);
        }
        
        // Check ownership
        if ($idea->user_id !== Auth::id()) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        // Remove attachment
        $idea->update([
            'attachment' => null,
            'attachment_filename' => null,
            'attachment_mime' => null,
            'attachment_size' => null,
        ]);

        return response()->json(['message' => 'Attachment removed successfully']);
    }

    public function attachment($slug)
    {
        $idea = Idea::where('slug', $slug)->first();
        if (!$idea) {
            return response()->json(['message' => 'Idea not found'], 404);
        }

        // Check if user can access (owner or admin)
        $user = Auth::user();
        if ($idea->user_id !== $user->id && (!$user->role || $user->role !== 'admin')) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        if (!$idea->attachment) {
            return response()->json(['message' => 'No attachment found'], 404);
        }

        return response($idea->attachment, 200, [
            'Content-Type' => $idea->attachment_mime ?? 'application/pdf',
            'Content-Disposition' => 'inline; filename="' . $idea->attachment_filename . '"',
        ]);
    }

    public function destroy($id)
    {
        $user = Auth::user();
        $idea = Idea::find($id);
        if (!$idea) {
            return response()->json(['message' => 'Idea not found'], 404);
        }

        // simple ownership/admin check: allow if owner or user has 'admin' role (assumption)
        if ($idea->user_id !== $user->id && (!$user->role || $user->role !== 'admin')) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        if (($idea->status ?? '') === 'draft') {
            // permanently remove drafts
            $idea->forceDelete();
            Log::info('Idea force deleted', ['idea_id' => $idea->id, 'user_id' => $user->id]);
        } else {
            // soft delete others
            $idea->delete();
            Log::info('Idea soft deleted', ['idea_id' => $idea->id, 'user_id' => $user->id]);
        }

        return response()->json(['message' => 'Idea deleted successfully']);
    }

    public function destroySelected(HttpRequest $request)
    {
        $user = Auth::user();
        $ids = $request->input('ids', []);
        if (!is_array($ids) || empty($ids)) {
            return response()->json(['message' => 'No ids provided'], 422);
        }

        $deleted = [];
        foreach ($ids as $id) {
            $idea = Idea::find($id);
            if (!$idea) continue;

            if ($idea->user_id !== $user->id && (!$user->role || $user->role !== 'admin')) {
                continue; // skip forbidden
            }

            if (($idea->status ?? '') === 'draft') {
                $idea->forceDelete();
                $deleted[] = $id;
                Log::info('Idea force deleted (bulk)', ['idea_id' => $id, 'user_id' => $user->id]);
            } else {
                $idea->delete();
                $deleted[] = $id;
                Log::info('Idea soft deleted (bulk)', ['idea_id' => $id, 'user_id' => $user->id]);
            }
        }

        return response()->json(['deleted' => $deleted]);
    }

    public function toggleCollaboration(Idea $idea)
    {
        $user = Auth::user();
        if ($idea->user_id !== $user->id && (!$user->role || $user->role !== 'admin')) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $idea->collaboration_enabled = !$idea->collaboration_enabled;
        $idea->save();

        Log::info('Collaboration toggled', [
            'idea_id' => $idea->id,
            'user_id' => $user->id,
            'collaboration_enabled' => $idea->collaboration_enabled
        ]);

        return response()->json([
            'collaboration_enabled' => $idea->collaboration_enabled
        ]);
    }

    public function toggleComment(Idea $idea)
    {
        $user = Auth::user();
        if ($idea->user_id !== $user->id && (!$user->role || $user->role !== 'admin')) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $idea->comments_enabled = !$idea->comments_enabled;
        $idea->save();

        Log::info('Comments toggled', [
            'idea_id' => $idea->id,
            'user_id' => $user->id,
            'comments_enabled' => $idea->comments_enabled
        ]);

        return response()->json([
            'comments_enabled' => $idea->comments_enabled
        ]);
    }

    public function comments($slug)
    {
        $idea = Idea::with('user')->where('slug', $slug)->first();
        if (!$idea) {
            return $this->flashMessageToRoute('ideas.index', 'The idea you are looking for does not exist.', [], 'error');
        }

        // Check if comments are enabled
        if (!$idea->comments_enabled) {
            // Still allow viewing if user is the owner or admin
            $user = Auth::user();
            if ($idea->user_id !== $user->id && (!$user->role || $user->role !== 'admin')) {
                return $this->flashMessageToRoute('ideas.index', 'Comments are disabled for this idea.', [], 'error');
            }
        }

        $comments = $idea->comments()->with('user')->orderBy('created_at', 'desc')->get();

        // Format idea data to match frontend expectations
        $ideaData = [
            'id' => $idea->id,
            'title' => $idea->idea_title,
            'description' => $idea->abstract,
            'status' => $idea->status,
            'created_at' => $idea->created_at?->format('M d, Y'),
            'updated_at' => $idea->updated_at?->format('M d, Y'),
            'user' => $idea->user ? ['id' => $idea->user->id, 'name' => $idea->user->name] : null,
            'collaboration_enabled' => $idea->collaboration_enabled,
            'comments_enabled' => $idea->comments_enabled,
            'slug' => $idea->slug,
        ];

        // Add attachment info to idea data
        if ($idea->attachment_filename) {
            $ideaData['attachment_filename'] = $idea->attachment_filename;
            $ideaData['attachment_size'] = $idea->attachment_size;
            $ideaData['attachment_mime'] = $idea->attachment_mime;
        }

        return Inertia::render('Ideas/Comments/Index', [
            'idea' => $ideaData,
            'comments' => $comments
        ]);
    }

    public function storeComment(Request $request, $slug)
    {
        $idea = Idea::where('slug', $slug)->first();
        if (!$idea) {
            return response()->json(['message' => 'Idea not found'], 404);
        }

        // Check if comments are enabled
        if (!$idea->comments_enabled) {
            $user = Auth::user();
            if ($idea->user_id !== $user->id && (!$user->role || $user->role !== 'admin')) {
                return response()->json(['message' => 'Comments are disabled for this idea'], 403);
            }
        }

        $request->validate([
            'content' => 'required|string|max:1000',
        ]);

        $comment = $idea->comments()->create([
            'user_id' => Auth::id(),
            'content' => $request->content,
        ]);

        Log::info('Comment created', [
            'idea_id' => $idea->id,
            'comment_id' => $comment->id,
            'user_id' => Auth::id()
        ]);

        return $this->flashMessage('Comment added successfully!');
    }

    public function updateComment(Request $request, $slug, $commentId)
    {
        $idea = Idea::where('slug', $slug)->first();
        if (!$idea) {
            return response()->json(['message' => 'Idea not found'], 404);
        }

        $comment = $idea->comments()->find($commentId);
        if (!$comment) {
            return response()->json(['message' => 'Comment not found'], 404);
        }

        // Check if user owns the comment
        if ($comment->user_id !== Auth::id()) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $request->validate([
            'content' => 'required|string|max:1000',
        ]);

        $comment->update([
            'content' => $request->content,
        ]);

        Log::info('Comment updated', [
            'idea_id' => $idea->id,
            'comment_id' => $comment->id,
            'user_id' => Auth::id()
        ]);

        return response()->json(['message' => 'Comment updated successfully']);
    }

    public function destroyComment($slug, $commentId)
    {
        $idea = Idea::where('slug', $slug)->first();
        if (!$idea) {
            return response()->json(['message' => 'Idea not found'], 404);
        }

        $comment = $idea->comments()->find($commentId);
        if (!$comment) {
            return response()->json(['message' => 'Comment not found'], 404);
        }

        // Check if user owns the comment
        if ($comment->user_id !== Auth::id()) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        // Instead of deleting, mark as deleted by updating content
        $comment->update([
            'content' => 'You deleted this comment',
        ]);

        Log::info('Comment marked as deleted', [
            'idea_id' => $idea->id,
            'comment_id' => $comment->id,
            'user_id' => Auth::id()
        ]);

        return response()->json(['message' => 'Comment deleted successfully']);
    }
}