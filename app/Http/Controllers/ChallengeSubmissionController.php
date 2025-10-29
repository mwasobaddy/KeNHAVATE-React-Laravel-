<?php

namespace App\Http\Controllers;

use App\Models\Challenge;
use App\Models\ChallengeSubmission;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Redirect;

class ChallengeSubmissionController extends Controller
{
    /**
     * Show the form for creating a new submission.
     */
    public function create(Challenge $challenge)
    {
        // Check if challenge is still open
        if (!$challenge->isOpen()) {
            return Redirect::route('challenges.show', $challenge)
                ->with('error', 'This challenge is no longer accepting submissions.');
        }

        // Check if user already submitted
        $existingSubmission = $challenge->submissions()
            ->where('submitted_by', auth()->id())
            ->first();

        if ($existingSubmission) {
            return Redirect::route('challenges.submissions.show', $existingSubmission)
                ->with('info', 'You have already submitted to this challenge.');
        }

        return Inertia::render('Challenges/Submit', [
            'challenge' => $challenge,
        ]);
    }

    /**
     * Store a newly created submission in storage.
     */
    public function store(Request $request, Challenge $challenge)
    {
        // Check if challenge is still open
        if (!$challenge->isOpen()) {
            return Redirect::route('challenges.show', $challenge)
                ->with('error', 'This challenge is no longer accepting submissions.');
        }

        // Check if user already submitted
        $existingSubmission = $challenge->submissions()
            ->where('submitted_by', auth()->id())
            ->first();

        if ($existingSubmission) {
            return Redirect::route('challenges.submissions.show', $existingSubmission)
                ->with('error', 'You have already submitted to this challenge.');
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'motivation' => 'required|string',
            'cost_of_implementation' => 'nullable|numeric|min:0',
            'original_disclaimer' => 'required|string',
            'attachment' => 'nullable|file|max:50240', // 50MB limit
            'submit_now' => 'boolean',
        ]);

        $submission = new ChallengeSubmission($validated);
        $submission->challenge_id = $challenge->id;
        $submission->submitted_by = auth()->id();

        // Handle file upload
        if ($request->hasFile('attachment')) {
            $file = $request->file('attachment');
            $path = $file->store('challenge-submissions/attachments', 'public');
            
            $submission->attachment_path = $path;
            $submission->attachment_name = $file->getClientOriginalName();
            $submission->attachment_mime_type = $file->getMimeType();
        }

        // Set status and submission time
        if ($request->boolean('submit_now')) {
            $submission->status = 'stage 1 review';
            $submission->submitted_at = now();
        } else {
            $submission->status = 'draft';
        }

        $submission->save();

        $message = $request->boolean('submit_now') 
            ? 'Submission submitted successfully and is now under review!'
            : 'Submission saved as draft. You can continue editing before the deadline.';

        return Redirect::route('challenges.submissions.show', $submission)
            ->with('success', $message);
    }

    /**
     * Display the specified submission.
     */
    public function show(ChallengeSubmission $submission)
    {
        // Check if user can view this submission
        if ($submission->submitted_by !== auth()->id() && !auth()->user()->can('review.challenge-submissions')) {
            abort(403);
        }

        $submission->load('challenge', 'submitter', 'reviews.reviewer', 'reviewDecisions.decider');

        return Inertia::render('Challenges/Submissions/Show', [
            'submission' => $submission,
            'canEdit' => $submission->submitted_by === auth()->id() && in_array($submission->status, ['draft', 'stage 1 revise', 'stage 2 revise']),
        ]);
    }

    /**
     * Show the form for editing the specified submission.
     */
    public function edit(ChallengeSubmission $submission)
    {
        // Check if user can edit this submission
        if ($submission->submitted_by !== auth()->id()) {
            abort(403);
        }

        // Check if submission can be edited
        if (!in_array($submission->status, ['draft', 'stage 1 revise', 'stage 2 revise'])) {
            return Redirect::route('challenges.submissions.show', $submission)
                ->with('error', 'This submission cannot be edited in its current status.');
        }

        // Check if challenge is still open
        if (!$submission->challenge->isOpen()) {
            return Redirect::route('challenges.submissions.show', $submission)
                ->with('error', 'The challenge deadline has passed. You cannot edit your submission.');
        }

        $submission->load('challenge');

        return Inertia::render('Challenges/Submissions/Edit', [
            'submission' => $submission,
        ]);
    }

    /**
     * Update the specified submission in storage.
     */
    public function update(Request $request, ChallengeSubmission $submission)
    {
        // Check if user can edit this submission
        if ($submission->submitted_by !== auth()->id()) {
            abort(403);
        }

        // Check if submission can be edited
        if (!in_array($submission->status, ['draft', 'stage 1 revise', 'stage 2 revise'])) {
            return Redirect::route('challenges.submissions.show', $submission)
                ->with('error', 'This submission cannot be edited in its current status.');
        }

        // Check if challenge is still open
        if (!$submission->challenge->isOpen()) {
            return Redirect::route('challenges.submissions.show', $submission)
                ->with('error', 'The challenge deadline has passed. You cannot edit your submission.');
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'motivation' => 'required|string',
            'cost_of_implementation' => 'nullable|numeric|min:0',
            'original_disclaimer' => 'required|string',
            'attachment' => 'nullable|file|max:50240', // 50MB limit
            'remove_attachment' => 'nullable|boolean',
            'submit_now' => 'boolean',
        ]);

        // Handle attachment removal
        if ($request->boolean('remove_attachment') && $submission->attachment_path) {
            Storage::disk('public')->delete($submission->attachment_path);
            $submission->attachment_path = null;
            $submission->attachment_name = null;
            $submission->attachment_mime_type = null;
        }

        // Handle new file upload
        if ($request->hasFile('attachment')) {
            // Delete old file if exists
            if ($submission->attachment_path) {
                Storage::disk('public')->delete($submission->attachment_path);
            }

            $file = $request->file('attachment');
            $path = $file->store('challenge-submissions/attachments', 'public');
            
            $submission->attachment_path = $path;
            $submission->attachment_name = $file->getClientOriginalName();
            $submission->attachment_mime_type = $file->getMimeType();
        }

        $submission->fill($validated);

        // Update status if submitting
        if ($request->boolean('submit_now') && $submission->status === 'draft') {
            $submission->status = 'stage 1 review';
            $submission->submitted_at = now();
        } elseif ($request->boolean('submit_now') && in_array($submission->status, ['stage 1 revise', 'stage 2 revise'])) {
            // Resubmit for review
            $submission->status = str_replace(' revise', ' review', $submission->status);
            $submission->submitted_at = now();
        }

        $submission->save();

        $message = $request->boolean('submit_now') 
            ? 'Submission updated and submitted successfully!'
            : 'Submission updated and saved as draft.';

        return Redirect::route('challenges.submissions.show', $submission)
            ->with('success', $message);
    }

    /**
     * Display user's submissions.
     */
    public function mySubmissions()
    {
        $submissions = ChallengeSubmission::with('challenge')
            ->where('submitted_by', auth()->id())
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return Inertia::render('Challenges/Submissions/MySubmissions', [
            'submissions' => $submissions,
        ]);
    }

    /**
     * Download submission attachment.
     */
    public function attachment(ChallengeSubmission $submission)
    {
        // Check if user can access this attachment
        if ($submission->submitted_by !== auth()->id() && !auth()->user()->can('review.challenge-submissions')) {
            abort(403);
        }

        if (!$submission->attachment_path || !Storage::disk('public')->exists($submission->attachment_path)) {
            abort(404);
        }

        return Storage::disk('public')->download(
            $submission->attachment_path,
            $submission->attachment_name
        );
    }
}
