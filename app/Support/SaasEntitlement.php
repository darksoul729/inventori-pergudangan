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
        if (!$user || !$user->tenant_id) {
            return $this->fallbackAllEnabled($allModuleCodes);
        }

        $tenantId = (int) $user->tenant_id;
        $subscription = TenantSubscription::query()
            ->with('plan')
            ->where('tenant_id', $tenantId)
            ->latest('id')
            ->first();

        $enabled = array_fill_keys($allModuleCodes, false);

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

        // Fallback ke plan config jika tenant_modules belum di-seed
        if (!in_array(true, $enabled, true)) {
            $planCode = $subscription?->plan?->code ?? 'trial_3d';
            $planModules = config("saas.plans.{$planCode}.modules", []);
            foreach ($planModules as $code) {
                if (array_key_exists($code, $enabled)) {
                    $enabled[$code] = true;
                }
            }
        }

        // Billing gate: non-core module otomatis off jika subscription tidak sehat
        $status = $subscription?->status ?? 'trialing';
        if (in_array($status, ['past_due', 'canceled'], true)) {
            foreach (config('saas.modules', []) as $code => $config) {
                $isCore = (bool) ($config['required'] ?? false);
                if (!$isCore && array_key_exists($code, $enabled)) {
                    $enabled[$code] = false;
                }
            }
        }

        return [
            'tenant_id' => $tenantId,
            'plan' => $subscription?->plan?->code ?? 'trial_3d',
            'subscription_status' => $status,
            'modules' => $enabled,
        ];
    }

    public function moduleEnabledForUser(?User $user, string $moduleCode): bool
    {
        $entitlement = $this->resolveForUser($user);
        return (bool) ($entitlement['modules'][$moduleCode] ?? false);
    }

    private function fallbackAllEnabled(array $moduleCodes): array
    {
        return [
            'tenant_id' => null,
            'plan' => 'trial_3d',
            'subscription_status' => 'trialing',
            'modules' => array_fill_keys($moduleCodes, true),
        ];
    }
}
