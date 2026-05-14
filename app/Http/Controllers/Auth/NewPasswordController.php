<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class NewPasswordController extends Controller
{
    private const RESET_SESSION_TTL_MINUTES = 10;

    public function otpForm(Request $request): Response
    {
        $email = (string) $request->query('email', '');
        $user = $email !== '' ? User::query()->where('email', $email)->first() : null;

        return Inertia::render('Auth/ResetPasswordOtp', [
            'status' => session('status'),
            'email' => $email,
            'resendAvailableInSeconds' => (int) session('resend_available_in_seconds', $user?->passwordResetResendAvailableInSeconds() ?? 0),
            'otpMeta' => $user?->passwordResetOtpMeta() ?? [],
        ]);
    }

    public function resetForm(Request $request): Response|RedirectResponse
    {
        $email = (string) $request->query('email', '');
        $token = (string) $request->query('reset_session_token', '');

        if ($email === '' || $token === '') {
            return redirect()->route('password.request');
        }

        $expectedToken = Cache::get($this->resetSessionCacheKey($email));
        if (!$expectedToken || !hash_equals((string) $expectedToken, $token)) {
            return redirect()
                ->route('password.otp', ['email' => $email])
                ->withErrors(['code' => 'Sesi reset tidak valid. Silakan verifikasi OTP ulang.']);
        }

        return Inertia::render('Auth/ResetPasswordOtpNewPassword', [
            'status' => session('status'),
            'email' => $email,
            'resetSessionToken' => $token,
        ]);
    }

    public function resendOtp(Request $request): RedirectResponse
    {
        $request->validate([
            'email' => 'required|email',
        ]);

        $user = User::query()->where('email', $request->string('email'))->first();
        if (!$user) {
            return back()->with('status', 'password-otp-sent');
        }

        $remaining = $user->passwordResetResendAvailableInSeconds();
        if ($remaining > 0) {
            return back()
                ->with('status', 'password-otp-resend-cooldown')
                ->with('resend_available_in_seconds', $remaining);
        }

        $user->sendPasswordResetOtpNotification();

        return back()
            ->with('status', 'password-otp-sent')
            ->with('resend_available_in_seconds', $user->passwordResetResendAvailableInSeconds());
    }

    /**
     * Handle an incoming new password request using OTP.
     */
    public function verifyOtp(Request $request): RedirectResponse
    {
        $request->validate([
            'email' => 'required|email',
            'code' => 'required|digits:6',
        ]);

        $user = User::query()->where('email', $request->string('email'))->first();
        if (!$user) {
            return back()->withErrors([
                'code' => 'Kode OTP tidak valid.',
            ]);
        }

        $otpStatus = $user->verifyPasswordResetOtpStatus((string) $request->input('code'));
        if ($otpStatus !== 'ok') {
            $message = match ($otpStatus) {
                'expired' => 'Kode OTP sudah kedaluwarsa. Silakan kirim ulang OTP.',
                'invalid' => 'Kode OTP salah. Periksa kembali 6 digit kode Anda.',
                default => 'Kode OTP belum tersedia. Silakan kirim OTP terlebih dahulu.',
            };
            return back()->withErrors(['code' => $message]);
        }

        $token = Str::random(64);
        Cache::put($this->resetSessionCacheKey((string) $request->input('email')), $token, now()->addMinutes(self::RESET_SESSION_TTL_MINUTES));

        return redirect()
            ->route('password.otp.reset-form', [
                'email' => (string) $request->input('email'),
                'reset_session_token' => $token,
            ])
            ->with('status', 'otp-verified');
    }

    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'email' => 'required|email',
            'reset_session_token' => 'required|string',
            'password' => [
                'required',
                'confirmed',
                'min:8',
                'regex:/[A-Z]/',
                'regex:/[0-9]/',
                'regex:/[^A-Za-z0-9]/',
                Rules\Password::defaults(),
            ],
        ]);

        $expectedToken = Cache::get($this->resetSessionCacheKey((string) $request->input('email')));
        if (!$expectedToken || !hash_equals((string) $expectedToken, (string) $request->input('reset_session_token'))) {
            return redirect()
                ->route('password.otp', ['email' => (string) $request->input('email')])
                ->withErrors(['code' => 'Sesi reset tidak valid. Silakan verifikasi OTP ulang.']);
        }

        $user = User::query()->where('email', $request->string('email'))->first();
        if (!$user) {
            return back()->withErrors([
                'email' => 'Akun tidak ditemukan.',
            ]);
        }

        $user->forceFill([
            'password' => Hash::make((string) $request->input('password')),
            'remember_token' => Str::random(60),
        ])->save();
        Cache::forget($this->resetSessionCacheKey((string) $request->input('email')));

        event(new PasswordReset($user));

        return redirect()->route('login')->with('status', 'Password berhasil direset. Silakan login.');
    }

    private function resetSessionCacheKey(string $email): string
    {
        return 'password_reset_session:' . sha1(strtolower(trim($email)));
    }
}
