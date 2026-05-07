<?php

namespace Database\Seeders;

use App\Models\Module;
use App\Models\Plan;
use App\Models\PlanModule;
use App\Models\Tenant;
use App\Models\TenantModule;
use App\Models\TenantSubscription;
use App\Models\User;
use Illuminate\Database\Seeder;

class SaasSeeder extends Seeder
{
    public function run(): void
    {
        $moduleConfig = config('saas.modules', []);
        $planConfig = config('saas.plans', []);

        foreach ($moduleConfig as $code => $item) {
            Module::query()->updateOrCreate(
                ['code' => $code],
                [
                    'name' => $item['name'] ?? $code,
                    'category' => $item['category'] ?? 'general',
                    'is_core' => (bool) ($item['required'] ?? false),
                ]
            );
        }

        foreach ($planConfig as $code => $item) {
            $plan = Plan::query()->updateOrCreate(
                ['code' => $code],
                [
                    'name' => $item['name'] ?? $code,
                    'monthly_price' => (int) ($item['price_monthly'] ?? 0),
                    'yearly_price' => (int) ($item['price_yearly'] ?? 0),
                    'is_public' => true,
                    'metadata' => ['addon_limit' => $item['addon_limit'] ?? null],
                ]
            );

            $enabledCodes = collect($item['modules'] ?? [])->values();
            foreach ($enabledCodes as $moduleCode) {
                $module = Module::query()->where('code', $moduleCode)->first();
                if (!$module) {
                    continue;
                }
                PlanModule::query()->updateOrCreate(
                    ['plan_id' => $plan->id, 'module_id' => $module->id],
                    ['is_enabled' => true]
                );
            }
        }

        $defaultTenant = Tenant::query()->first();
        if (!$defaultTenant) {
            return;
        }

        User::query()->whereNull('tenant_id')->update(['tenant_id' => $defaultTenant->id]);

        $defaultPlan = Plan::query()->where('code', 'pro')->first()
            ?? Plan::query()->where('code', 'trial_3d')->first();

        if ($defaultPlan) {
            TenantSubscription::query()->updateOrCreate(
                ['tenant_id' => $defaultTenant->id],
                [
                    'plan_id' => $defaultPlan->id,
                    'status' => 'active',
                    'starts_at' => now(),
                    'trial_ends_at' => now()->addDays((int) config('saas.trial_days', 3)),
                ]
            );

            $planModuleIds = PlanModule::query()
                ->where('plan_id', $defaultPlan->id)
                ->where('is_enabled', true)
                ->pluck('module_id');

            foreach ($planModuleIds as $moduleId) {
                TenantModule::query()->updateOrCreate(
                    ['tenant_id' => $defaultTenant->id, 'module_id' => $moduleId],
                    [
                        'is_enabled' => true,
                        'source' => 'plan',
                        'starts_at' => now(),
                    ]
                );
            }
        }
    }
}
