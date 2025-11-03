<?php

namespace App\Http\Controllers;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class ProfileController extends Controller
{
    public function show(Request $request)
    {
        return Inertia::render('settings/profile', [
            'user' => Auth::user(),
            'isCompletion' => true,
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status' => $request->session()->get('status'),
        ]);
    }

    public function update(Request $request)
    {
        $user = Auth::user();

        $request->validate([
            'name' => 'required|string|max:255',
            'username' => ['required', 'string', 'max:255', 'unique:users,username,' . $user->id],
            'slug' => ['required', 'string', 'max:255', 'unique:users,slug,' . $user->id, 'regex:/^[a-z0-9-]+$/'],
        ]);

        $user->update([
            'name' => $request->name,
            'username' => $request->username,
            'slug' => $request->slug,
        ]);

        return redirect()->intended(route('dashboard', absolute: false));
    }
}
