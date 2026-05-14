<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\SubscriptionPayment;
use App\Models\TenantSubscription;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class EmailVerificationPromptController extends Controller
{
    /**
     * Display the email verification prompt.
     */
    public function __invoke(Request $request): RedirectResponse|Response
    {
        if ($request->user()->hasVerifiedEmail()) {
            return $this->resolvePostVerificationRedirect($request->user()->tenant_id);
        }

        return Inertia::render('Auth/VerifyEmail', [
            'status' => session('status'),
            'email' => $request->user()->email,
            'meta' => array_merge(
                $request->user()->emailVerificationMeta(),
                ['resend_available_in_seconds' => (int) session('resend_available_in_seconds', $request->user()->verificationResendAvailableInSeconds())]
            ),
        ]);
    }

    private function resolvePostVerificationRedirect(?int $tenantId): RedirectResponse
    {
        if (!$tenantId) {
            return redirect()->intended(route('dashboard', absolute: false));
        }

        $subscription = TenantSubscription::query()
            ->where('tenant_id', $tenantId)
            ->latest('id')
            ->first();

        $isPaidOnboardingFlow = $subscription
            && $subscription->status === 'past_due'
            && $subscription->trial_ends_at === null;

        if (!$isPaidOnboardingFlow) {
            return redirect()->intended(route('dashboard', absolute: false));
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
