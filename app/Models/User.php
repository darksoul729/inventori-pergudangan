<?php

namespace App\Models;

use App\Mail\PetayuSystemMail;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Mail;
use Laravel\Sanctum\HasApiTokens;

#[Fillable(['tenant_id', 'role_id', 'name', 'email', 'password', 'phone', 'profile_photo_path', 'status'])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable implements MustVerifyEmail
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * Get the role associated with the user.
     */
    public function role()
    {
        return $this->belongsTo(Role::class);
    }

    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }

    /**
     * Get the driver associated with the user.
     */
    public function driver()
    {
        return $this->hasOne(Driver::class);
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function sendPasswordResetNotification($token): void
    {
        // Reset via link dinonaktifkan total. Semua alur reset pakai OTP.
        $this->sendPasswordResetOtpNotification();
    }

    public function sendPasswordResetOtpNotification(): void
    {
        $code = (string) random_int(100000, 999999);
        $now = Carbon::now('Asia/Makassar');
        $expiresAt = $now->copy()->addMinutes(15);

        Cache::put($this->passwordResetOtpCacheKey(), [
            'code' => $code,
            'expires_at' => $expiresAt->toIso8601String(),
            'sent_at' => $now->toIso8601String(),
        ], $expiresAt);

        Mail::to($this->email)->send(new PetayuSystemMail(
            subjectLine: 'Kode Reset Password Akun Petayu WMS',
            heading: 'Konfirmasi Reset Password',
            lines: [
                'Kami menerima permintaan reset password untuk akun Anda.',
                'Masukkan kode OTP di bawah pada halaman reset password.',
                'Jika Anda tidak meminta reset, abaikan email ini.',
            ],
            ctaLabel: null,
            ctaUrl: null,
            meta: [
                'Nama PIC' => $this->name,
                'Email Login' => $this->email,
                'Kode OTP' => $code,
                'Berlaku Sampai' => $expiresAt->format('d M Y H:i') . ' WITA',
            ]
        ));
    }

    public function verifyPasswordResetOtp(string $code): bool
    {
        return $this->verifyPasswordResetOtpStatus($code) === 'ok';
    }

    public function verifyPasswordResetOtpStatus(string $code): string
    {
        $payload = Cache::get($this->passwordResetOtpCacheKey());
        if (!is_array($payload) || empty($payload['code']) || empty($payload['expires_at'])) {
            return 'not_found';
        }

        if (Carbon::parse((string) $payload['expires_at'])->isPast()) {
            Cache::forget($this->passwordResetOtpCacheKey());
            return 'expired';
        }

        if (!hash_equals((string) $payload['code'], trim($code))) {
            return 'invalid';
        }

        Cache::forget($this->passwordResetOtpCacheKey());
        return 'ok';
    }

    public function passwordResetResendAvailableInSeconds(): int
    {
        $payload = Cache::get($this->passwordResetOtpCacheKey(), []);
        if (!is_array($payload) || empty($payload['sent_at'])) {
            return 0;
        }

        $sentAt = Carbon::parse((string) $payload['sent_at']);
        $nextAllowed = $sentAt->copy()->addSeconds(60);
        if ($nextAllowed->isPast()) {
            return 0;
        }

        $remaining = $nextAllowed->timestamp - Carbon::now($sentAt->getTimezone())->timestamp;
        return max(0, $remaining);
    }

    public function passwordResetOtpMeta(): array
    {
        $payload = Cache::get($this->passwordResetOtpCacheKey(), []);
        if (!is_array($payload)) {
            return [];
        }

        return [
            'sent_at' => $payload['sent_at'] ?? null,
            'expires_at' => $payload['expires_at'] ?? null,
            'resend_available_in_seconds' => $this->passwordResetResendAvailableInSeconds(),
        ];
    }

    public function sendEmailVerificationNotification(): void
    {
        $code = (string) random_int(100000, 999999);
        $now = Carbon::now('Asia/Makassar');
        $expiresAt = $now->copy()->addMinutes(15);

        Cache::put($this->emailVerificationCacheKey(), [
            'code' => $code,
            'expires_at' => $expiresAt->toIso8601String(),
            'sent_at' => $now->toIso8601String(),
        ], $expiresAt);

        Mail::to($this->email)->send(new PetayuSystemMail(
            subjectLine: 'Kode Verifikasi Petayu WMS: ' . $code,
            heading: $code,
            lines: [
                'Halo ' . ($this->name ?? 'Pengguna') . ',',
                'Seseorang mencoba memverifikasi alamat email untuk akun Petayu WMS. Jika ini memang Anda, gunakan kode verifikasi di atas untuk menyelesaikan proses aktivasi.',
                'Kode ini berlaku selama 15 menit. Jika Anda tidak meminta kode ini, abaikan email ini.',
            ],
            ctaLabel: null,
            ctaUrl: null,
            meta: [
                'Kode OTP' => $code,
                'Berlaku Sampai' => $expiresAt->format('d M Y, H:i') . ' WITA',
                'Akun' => $this->email,
            ],
        ));
    }

    public function verifyEmailOtp(string $code): bool
    {
        $payload = Cache::get($this->emailVerificationCacheKey());
        if (!is_array($payload) || empty($payload['code']) || empty($payload['expires_at'])) {
            return false;
        }

        $expiresAt = Carbon::parse((string) $payload['expires_at']);
        if ($expiresAt->isPast()) {
            Cache::forget($this->emailVerificationCacheKey());
            return false;
        }

        if (!hash_equals((string) $payload['code'], trim($code))) {
            return false;
        }

        Cache::forget($this->emailVerificationCacheKey());
        return true;
    }

    public function emailVerificationMeta(): array
    {
        $payload = Cache::get($this->emailVerificationCacheKey(), []);
        if (!is_array($payload)) {
            return [];
        }

        return [
            'sent_at' => $payload['sent_at'] ?? null,
            'expires_at' => $payload['expires_at'] ?? null,
            'resend_available_in_seconds' => $this->verificationResendAvailableInSeconds(),
        ];
    }

    public function verificationResendAvailableInSeconds(): int
    {
        $payload = Cache::get($this->emailVerificationCacheKey(), []);
        if (!is_array($payload) || empty($payload['sent_at'])) {
            return 0;
        }

        $sentAt = Carbon::parse((string) $payload['sent_at']);
        $nextAllowed = $sentAt->copy()->addSeconds(60);
        if ($nextAllowed->isPast()) {
            return 0;
        }

        $remaining = $nextAllowed->timestamp - Carbon::now($sentAt->getTimezone())->timestamp;
        return max(0, $remaining);
    }

    protected function emailVerificationCacheKey(): string
    {
        return 'email_verification_otp:user:' . $this->id;
    }

    protected function passwordResetOtpCacheKey(): string
    {
        return 'password_reset_otp:user:' . $this->id;
    }
}
