<?php

namespace App\Http\Controllers\Idea;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Idea;
use App\Models\IdeaLike;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class IdeaLikeController extends Controller
{
    public function toggle(Idea $idea, Request $request)
    {
        Log::info('IdeaLike toggle called', ['idea_id' => $idea->id, 'ip' => $request->ip(), 'user_id' => Auth::id()]);
        $user = Auth::user();
        if (!$user) {
            Log::warning('IdeaLike toggle unauthenticated attempt', ['idea_id' => $idea->id, 'ip' => $request->ip()]);
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        $existing = IdeaLike::where('idea_id', $idea->id)->where('user_id', $user->id)->first();
        if ($existing) {
            $existing->delete();
            $liked = false;
            Log::info('IdeaLike removed', ['idea_id' => $idea->id, 'user_id' => $user->id]);
        } else {
            IdeaLike::create(['idea_id' => $idea->id, 'user_id' => $user->id]);
            $liked = true;
            Log::info('IdeaLike created', ['idea_id' => $idea->id, 'user_id' => $user->id]);
        }

        $likesCount = IdeaLike::where('idea_id', $idea->id)->count();

        return response()->json(['liked' => $liked, 'likes_count' => $likesCount]);
    }
}
