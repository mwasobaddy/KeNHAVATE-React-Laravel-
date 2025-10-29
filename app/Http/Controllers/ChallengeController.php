<?php

namespace App\Http\Controllers;

use App\Models\Challenge;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Validation\Rule;

class ChallengeController extends Controller
{
    /**
     * Display a listing of challenges for management (admin/dd).
     */
    public function index()
    {
        $challenges = Challenge::with('creator')
            ->withCount('submissions')
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return Inertia::render('Challenges/Index', [
            'challenges' => $challenges,
        ]);
    }

    /**
     * Display a listing of active challenges for public participation.
     */
    public function publicIndex()
    {
        $challenges = Challenge::with('creator')
            ->withCount('activeSubmissions')
            ->where('status', 'active')
            ->orderBy('deadline', 'asc')
            ->paginate(12);

        return Inertia::render('Challenges/PublicIndex', [
            'challenges' => $challenges,
        ]);
    }

    /**
     * Show the form for creating a new challenge.
     */
    public function create()
    {
        return Inertia::render('Challenges/Create');
    }

    /**
     * Store a newly created challenge in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'deadline' => 'required|date|after:now',
            'guidelines' => 'required|string',
            'reward' => 'required|string',
            'attachment' => 'nullable|file|mimes:pdf,doc,docx,ppt,pptx,jpg,jpeg,png|max:10240',
        ]);

        $challenge = new Challenge($validated);
        $challenge->created_by = auth()->id();

        // Handle file upload
        if ($request->hasFile('attachment')) {
            $file = $request->file('attachment');
            $path = $file->store('challenges/attachments', 'public');
            
            $challenge->attachment_path = $path;
            $challenge->attachment_name = $file->getClientOriginalName();
            $challenge->attachment_mime_type = $file->getMimeType();
        }

        $challenge->save();

        return Redirect::route('dd.challenges.index')->with('success', 'Challenge created successfully!');
    }

    /**
     * Display the specified challenge.
     */
    public function show(Challenge $challenge)
    {
        $challenge->load('creator', 'submissions.submitter');

        return Inertia::render('Challenges/Show', [
            'challenge' => $challenge,
            'userCanSubmit' => $challenge->isOpen() && !$challenge->submissions()->where('submitted_by', auth()->id())->exists(),
        ]);
    }

    /**
     * Show the form for editing the specified challenge.
     */
    public function edit(Challenge $challenge)
    {
        return Inertia::render('Challenges/Edit', [
            'challenge' => $challenge,
        ]);
    }

    /**
     * Update the specified challenge in storage.
     */
    public function update(Request $request, Challenge $challenge)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'deadline' => 'required|date|after:now',
            'guidelines' => 'required|string',
            'reward' => 'required|string',
            'attachment' => 'nullable|file|mimes:pdf,doc,docx,ppt,pptx,jpg,jpeg,png|max:10240',
            'remove_attachment' => 'nullable|boolean',
        ]);

        // Handle attachment removal
        if ($request->boolean('remove_attachment') && $challenge->attachment_path) {
            Storage::disk('public')->delete($challenge->attachment_path);
            $challenge->attachment_path = null;
            $challenge->attachment_name = null;
            $challenge->attachment_mime_type = null;
        }

        // Handle new file upload
        if ($request->hasFile('attachment')) {
            // Delete old file if exists
            if ($challenge->attachment_path) {
                Storage::disk('public')->delete($challenge->attachment_path);
            }

            $file = $request->file('attachment');
            $path = $file->store('challenges/attachments', 'public');
            
            $challenge->attachment_path = $path;
            $challenge->attachment_name = $file->getClientOriginalName();
            $challenge->attachment_mime_type = $file->getMimeType();
        }

        $challenge->fill($validated);
        $challenge->save();

        return Redirect::route('dd.challenges.index')->with('success', 'Challenge updated successfully!');
    }

    /**
     * Remove the specified challenge from storage.
     */
    public function destroy(Challenge $challenge)
    {
        // Delete attachment if exists
        if ($challenge->attachment_path) {
            Storage::disk('public')->delete($challenge->attachment_path);
        }

        $challenge->delete();

        return Redirect::route('dd.challenges.index')->with('success', 'Challenge deleted successfully!');
    }

    /**
     * Activate the challenge.
     */
    public function activate(Challenge $challenge)
    {
        $challenge->update(['status' => 'active']);

        return Redirect::back()->with('success', 'Challenge activated successfully!');
    }

    /**
     * Close the challenge.
     */
    public function close(Challenge $challenge)
    {
        $challenge->update(['status' => 'closed']);

        return Redirect::back()->with('success', 'Challenge closed successfully!');
    }

    /**
     * Download challenge attachment.
     */
    public function attachment(Challenge $challenge)
    {
        if (!$challenge->attachment_path || !Storage::disk('public')->exists($challenge->attachment_path)) {
            abort(404);
        }

        return Storage::disk('public')->download(
            $challenge->attachment_path,
            $challenge->attachment_name
        );
    }
}
