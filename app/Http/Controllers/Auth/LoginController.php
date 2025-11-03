<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Mail\LoginOTP;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Laravel\Fortify\Features;

class LoginController extends Controller
{
    /**
     * Show the login form (Step 1: Email input)
     */
    public function showLoginForm(Request $request)
    {
        return Inertia::render('auth/login', [
            'canRegister' => Features::enabled(Features::registration()),
            'status' => $request->session()->get('status'),
        ]);
    }

    /**
     * Handle the email submission (Step 1)
     */
    public function submitEmail(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
        ]);

        $email = $request->email;

        // Check rate limiting
        if (RateLimiter::tooManyAttempts($this->throttleKey($request), 5)) {
            $seconds = RateLimiter::availableIn($this->throttleKey($request));

            throw ValidationException::withMessages([
                'email' => ['Too many login attempts. Please try again in ' . $seconds . ' seconds.'],
            ]);
        }

        // Generate OTP
        $otp = $this->generateOTP();
        $expiresAt = now()->addMinutes(10);

        // Store OTP in session
        $request->session()->put('login_otp', [
            'email' => $email,
            'otp' => Hash::make($otp),
            'expires_at' => $expiresAt,
        ]);

        // Send OTP email
        $this->sendOTPEmail($email, $otp);

        // Increment rate limiter
        RateLimiter::hit($this->throttleKey($request), 60); // 1 minute

        // Redirect to OTP verification page
        return redirect()->route('login.verify');
    }

    /**
     * Show the OTP verification form (Step 2)
     */
    public function showOTPForm(Request $request)
    {
        // Check if OTP session exists
        if (!$request->session()->has('login_otp')) {
            return redirect()->route('login');
        }

        $otpData = $request->session()->get('login_otp');

        // Check if OTP has expired
        if (now()->isAfter($otpData['expires_at'])) {
            $request->session()->forget('login_otp');
            return redirect()->route('login')->withErrors([
                'email' => 'OTP has expired. Please try again.',
            ]);
        }

        return Inertia::render('auth/VerifyOTP', [
            'email' => $otpData['email'],
        ]);
    }

    /**
     * Verify the OTP and log in the user
     */
    public function verifyOTP(Request $request)
    {
        $request->validate([
            'otp' => 'required|string|size:6',
        ]);

        // Check if OTP session exists
        if (!$request->session()->has('login_otp')) {
            return redirect()->route('login');
        }

        $otpData = $request->session()->get('login_otp');

        // Check if OTP has expired
        if (now()->isAfter($otpData['expires_at'])) {
            $request->session()->forget('login_otp');
            throw ValidationException::withMessages([
                'otp' => 'OTP has expired. Please try again.',
            ]);
        }

        // Verify OTP
        if (!Hash::check($request->otp, $otpData['otp'])) {
            throw ValidationException::withMessages([
                'otp' => 'Invalid OTP. Please try again.',
            ]);
        }

        $email = $otpData['email'];

        // Find or create user
        $user = User::where('email', $email)->first();

        if (!$user) {
            // Create new user
            $user = User::create([
                'email' => $email,
                'password' => Hash::make(Str::random(32)), // Random password
                'email_verified_at' => now(),
            ]);
        }

        // Log the user in
        Auth::login($user, $request->boolean('remember', false));

        // Clear OTP session
        $request->session()->forget('login_otp');

        // Clear rate limiter
        RateLimiter::clear($this->throttleKey($request));

        // Redirect to intended page or dashboard
        return redirect()->intended(route('dashboard', absolute: false));
    }

    /**
     * Resend OTP
     */
    public function resendOTP(Request $request)
    {
        // Check if OTP session exists
        if (!$request->session()->has('login_otp')) {
            return redirect()->route('login');
        }

        $otpData = $request->session()->get('login_otp');

        // Check rate limiting for resend
        if (RateLimiter::tooManyAttempts($this->resendThrottleKey($request), 3)) {
            $seconds = RateLimiter::availableIn($this->resendThrottleKey($request));

            throw ValidationException::withMessages([
                'otp' => ['Too many resend attempts. Please try again in ' . $seconds . ' seconds.'],
            ]);
        }

        // Generate new OTP
        $otp = $this->generateOTP();
        $expiresAt = now()->addMinutes(10);

        // Update OTP in session
        $request->session()->put('login_otp', [
            'email' => $otpData['email'],
            'otp' => Hash::make($otp),
            'expires_at' => $expiresAt,
        ]);

        // Send OTP email
        $this->sendOTPEmail($otpData['email'], $otp);

        // Increment resend rate limiter
        RateLimiter::hit($this->resendThrottleKey($request), 60); // 1 minute

        return back()->with('status', 'OTP sent successfully.');
    }

    /**
     * Generate a 6-digit OTP
     */
    private function generateOTP(): string
    {
        return str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);
    }

    /**
     * Send OTP email
     */
    private function sendOTPEmail(string $email, string $otp): void
    {
        // Send OTP via email
        Mail::to($email)->send(new LoginOTP($email, $otp));

        // Also log for debugging purposes
        \Log::info("OTP sent to {$email}: {$otp}");
    }

    /**
     * Get the throttle key for the request
     */
    private function throttleKey(Request $request): string
    {
        return Str::transliterate(Str::lower($request->input('email', '')) . '|' . $request->ip());
    }

    /**
     * Get the resend throttle key for the request
     */
    private function resendThrottleKey(Request $request): string
    {
        return 'resend|' . $this->throttleKey($request);
    }
}