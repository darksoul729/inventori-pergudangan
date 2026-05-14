<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\SubscriptionPayment;
use App\Models\TenantSubscription;
use Illuminate\Auth\Events\Verified;
use Illuminate\Foundation\Auth\EmailVerificationRequest;
use Illuminate\Http\RedirectResponse;

class VerifyEmailController extends Controller
{
    /**
     * Mark the authenticated user's email address as verified.
     */
    public function __invoke(EmailVerificationRequest $request): RedirectResponse
    {
        if ($request->user()->hasVerifiedEmail()) {
            return $this->resolvePostVerificationRedirect($request->user()->tenant_id);
        }

        if ($request->user()->markEmailAsVerified()) {
            event(new Verified($request->user()));
        }

        return $this->resolvePostVerificationRedirect($request->user()->tenant_id);
    }

    private function resolvePostVerificationRedirect(?int $tenantId): RedirectResponse
    {
        if (!$tenantId) {
            return redirect()->intended(route('dashboard', absolute: false) . '?verified=1');
        }

        $subscription = TenantSubscription::query()
            ->where('tenant_id', $tenantId)
            ->latest('id')
            ->first();

        $isPaidOnboardingFlow = $subscription
            && $subscription->status === 'past_due'
            && $subscription->trial_ends_at === null;

        if (!$isPaidOnboardingFlow) {
            return redirect()->intended(route('dashboard', absolute: false) . '?verified=1');
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
                return redirect()->away($pendingPayment->payment_url);
            }
        }

        return redirect()->route('settings.billing');
    }
}
