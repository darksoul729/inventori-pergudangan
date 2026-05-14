<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\SubscriptionPayment;
use App\Models\TenantSubscription;
use Illuminate\Auth\Events\Verified;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;

class VerifyEmailCodeController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'code' => ['required', 'digits:6'],
        ]);

        $user = $request->user();
        if (!$user) {
            return redirect()->route('login');
        }

        if ($user->hasVerifiedEmail()) {
            return $this->resolvePostVerificationRedirect($request, $user->tenant_id);
        }

        if (!$user->verifyEmailOtp((string) $request->input('code'))) {
            return back()->withErrors([
                'code' => 'Kode verifikasi tidak valid atau sudah kedaluwarsa. Silakan kirim ulang.',
            ]);
        }

        if ($user->markEmailAsVerified()) {
            event(new Verified($user));
        }

        return $this->resolvePostVerificationRedirect($request, $user->tenant_id);
    }

    private function resolvePostVerificationRedirect(Request $request, ?int $tenantId)
    {
        if (!$tenantId) {
            return redirect()->intended(route('panduan-setup', absolute: false) . '?verified=1');
        }

        $subscription = TenantSubscription::query()
            ->where('tenant_id', $tenantId)
            ->latest('id')
            ->first();

        $isPaidOnboardingFlow = $subscription
            && $subscription->status === 'past_due'
            && $subscription->trial_ends_at === null;

        if (!$isPaidOnboardingFlow) {
            return redirect()->intended(route('panduan-setup', absolute: false) . '?verified=1');
        }

        $pendingPayment = SubscriptionPayment::query()
            ->where('tenant_id', $tenantId)
            ->where('status', 'pending')
            ->latest('id')
            ->first();

        if ($pendingPayment) {
            $raw = is_array($pendingPayment->raw_payload) ? $pendingPayment->raw_payload : [];
            $expiresAt = data_get($raw, 'expires_at');
            $isExpired = false;
            if (is_string($expiresAt) && trim($expiresAt) !== '') {
                try {
                    $isExpired = now()->greaterThan(\Carbon\Carbon::parse($expiresAt));
                } catch (\Throwable) {
                    $isExpired = false;
                }
            }

            if (!$isExpired && !empty($pendingPayment->payment_url)) {
                return Inertia::location($pendingPayment->payment_url);
            }
        }

        return redirect()->route('settings.billing');
    }
}
