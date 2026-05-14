<?php

namespace App\Support;

use App\Models\TenantModule;
use App\Models\TenantSubscription;
use App\Models\User;

class SaasEntitlement
{
    public function resolveForUser(?User $user): array
    {
        $allModuleCodes = array_keys(config('saas.modules', []));

        // Fix #2: Jika tidak ada user/tenant, hanya aktifkan modul yang `required` saja,
        // bukan semua modul. Ini mencegah bypass gating untuk user tanpa tenant.
        if (!$user || !$user->tenant_id) {
            return $this->fallbackCoreOnly($allModuleCodes);
        }

        $tenantId = (int) $user->tenant_id;
        $subscription = TenantSubscription::query()
            ->with('plan')
            ->where('tenant_id', $tenantId)
            ->latest('id')
            ->first();

        $enabled = array_fill_keys($allModuleCodes, false);

        $planCode    = $subscription?->plan?->code ?? 'trial_3d';
        $planModules = config("saas.plans.{$planCode}.modules", []);
        foreach ($planModules as $code) {
            if (array_key_exists($code, $enabled)) {
                $enabled[$code] = true;
            }
        }

        // Fix #4: TenantModule grant hanya diizinkan jika modul tersebut
        // memang ada di plan aktif, atau merupakan modul yang di-override oleh admin sistem.
        // Untuk sekarang: admin bisa grant modul apapun (existing behavior),
        // tapi grant ini di-strip jika subscription tidak aktif (past_due/canceled).
        $tenantModules = TenantModule::query()
            ->where('tenant_id', $tenantId)
            ->where('is_enabled', true)
            ->with('module:id,code')
            ->get();

        foreach ($tenantModules as $row) {
            $code = $row->module?->code;
            if ($code && array_key_exists($code, $enabled)) {
                $enabled[$code] = true;
            }
        }

        $status     = $subscription?->status ?? 'trialing';
        $planCode   = $subscription?->plan?->code ?? 'trial_3d';
        $graceDays  = (int) (config("saas.plan_grace_days.{$planCode}") ?? config('saas.billing_grace_days', 3));
        $graceUntil = null;
        $writeLocked = false;

        // Fix #3: Cek apakah trial sudah expired berdasarkan trial_ends_at.
        // Jika sudah expired dan status masih 'trialing', perlakukan seperti 'past_due'.
        $isTrialExpired = false;
        if ($status === 'trialing') {
            $trialEndsAt = $subscription?->trial_ends_at ?? $subscription?->ends_at;
            if ($trialEndsAt && now()->greaterThan($trialEndsAt)) {
                $isTrialExpired = true;
                // Trial sudah habis: hanya biarkan modul required tetap aktif
                $status = 'past_due'; // treat same as past_due for gating purposes
                $graceUntil = $trialEndsAt->copy()->addDays($graceDays);
                $writeLocked = now()->greaterThan($graceUntil);
            }
        }

        if ($status === 'past_due') {
            $dueBase = $subscription?->ends_at ?? $subscription?->trial_ends_at ?? $subscription?->updated_at;
            if ($dueBase && !$isTrialExpired) { // avoid double-setting if already set above
                $graceUntil  = $dueBase->copy()->addDays($graceDays);
                $writeLocked = now()->greaterThan($graceUntil);
            }
        }

        if (in_array($status, ['canceled'], true)) {
            $writeLocked = true;
        }

        // Gate: past_due atau canceled → matikan semua non-required modul.
        // Ini juga mencakup trial yang sudah expired (karena di-remap ke 'past_due').
        if (in_array($status, ['past_due', 'canceled'], true)) {
            foreach (config('saas.modules', []) as $code => $config) {
                $isCore = (bool) ($config['required'] ?? false);
                if (!$isCore && array_key_exists($code, $enabled)) {
                    $enabled[$code] = false;
                }
            }
        }

        return [
            'tenant_id'           => $tenantId,
            'plan'                => $subscription?->plan?->code ?? 'trial_3d',
            'subscription_status' => $status,
            'trial_expired'       => $isTrialExpired,
            'grace_until'         => $graceUntil?->toIso8601String(),
            'write_locked'        => $writeLocked,
            'modules'             => $enabled,
        ];
    }

    public function moduleEnabledForUser(?User $user, string $moduleCode): bool
    {
        $entitlement = $this->resolveForUser($user);
        return (bool) ($entitlement['modules'][$moduleCode] ?? false);
    }

    /**
     * Fix #2: Fallback aman — hanya aktifkan modul yang memang wajib (required).
     * Sebelumnya `fallbackAllEnabled` mengaktifkan SEMUA modul,
     * yang bisa di-bypass oleh user tanpa tenant_id (mis. user yang baru dibuat).
     */
    private function fallbackCoreOnly(array $moduleCodes): array
    {
        $modules = [];
        foreach ($moduleCodes as $code) {
            $cfg = config("saas.modules.{$code}", []);
            $modules[$code] = (bool) ($cfg['required'] ?? false);
        }

        return [
            'tenant_id'           => null,
            'plan'                => 'trial_3d',
            'subscription_status' => 'trialing',
            'trial_expired'       => false,
            'grace_until'         => null,
            'write_locked'        => false,
            'modules'             => $modules,
        ];
    }
}
