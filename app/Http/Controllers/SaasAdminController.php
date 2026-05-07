<?php

namespace App\Http\Controllers;

use App\Models\Module;
use App\Models\SaasAuditLog;
use App\Models\Tenant;
use App\Models\TenantModule;
use App\Models\TenantSubscription;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class SaasAdminController extends Controller
{
    public function index(): Response
    {
        $tenants = Tenant::query()
            ->with(['subscriptions.plan', 'modules.module'])
            ->orderBy('name')
            ->get()
            ->map(function (Tenant $tenant) {
                $subscription = $tenant->subscriptions->sortByDesc('id')->first();
                $enabledMap = $tenant->modules
                    ->where('is_enabled', true)
                    ->keyBy(fn ($tm) => $tm->module?->code)
                    ->map(fn () => true)
                    ->toArray();

                return [
                    'id' => $tenant->id,
                    'name' => $tenant->name,
                    'code' => $tenant->code,
                    'status' => $tenant->status,
                    'plan' => $subscription?->plan?->name ?? '-',
                    'plan_code' => $subscription?->plan?->code ?? null,
                    'subscription_status' => $subscription?->status ?? 'trialing',
                    'enabled_modules' => $enabledMap,
                ];
            });

        $modules = Module::query()
            ->orderBy('is_core', 'desc')
            ->orderBy('name')
            ->get(['id', 'code', 'name', 'is_core'])
            ->map(fn (Module $module) => [
                'id' => $module->id,
                'code' => $module->code,
                'name' => $module->name,
                'is_core' => (bool) $module->is_core,
            ]);

        return Inertia::render('Saas/Admin', [
            'tenants' => $tenants,
            'modules' => $modules,
        ]);
    }

    public function updateModules(Request $request, Tenant $tenant): RedirectResponse
    {
        $validated = $request->validate([
            'modules' => ['required', 'array'],
            'modules.*' => ['string', 'exists:modules,code'],
        ]);

        $enabledCodes = collect($validated['modules'])->unique()->values();
        $allModules = Module::query()->get(['id', 'code', 'is_core']);

        DB::transaction(function () use ($tenant, $allModules, $enabledCodes) {
            $changes = [];
            foreach ($allModules as $module) {
                $shouldEnable = (bool) $module->is_core || $enabledCodes->contains($module->code);
                $record = TenantModule::query()->updateOrCreate(
                    ['tenant_id' => $tenant->id, 'module_id' => $module->id],
                    ['is_enabled' => $shouldEnable, 'source' => 'manual', 'starts_at' => now()]
                );
                $changes[] = [
                    'module_code' => $module->code,
                    'enabled' => (bool) $record->is_enabled,
                ];
            }

            SaasAuditLog::query()->create([
                'tenant_id' => $tenant->id,
                'actor_user_id' => auth()->id(),
                'event_type' => 'tenant_modules_updated',
                'target_type' => 'tenant',
                'target_id' => $tenant->id,
                'payload' => ['changes' => $changes],
            ]);
        });

        return back()->with('success', 'Modul tenant berhasil diperbarui.');
    }

    public function updateSubscriptionStatus(Request $request, Tenant $tenant): RedirectResponse
    {
        $validated = $request->validate([
            'status' => ['required', 'in:trialing,active,past_due,canceled'],
        ]);

        $subscription = TenantSubscription::query()
            ->where('tenant_id', $tenant->id)
            ->latest('id')
            ->firstOrFail();

        $subscription->update([
            'status' => $validated['status'],
        ]);

        SaasAuditLog::query()->create([
            'tenant_id' => $tenant->id,
            'actor_user_id' => auth()->id(),
            'event_type' => 'subscription_status_updated',
            'target_type' => 'tenant_subscription',
            'target_id' => $subscription->id,
            'payload' => [
                'status' => $validated['status'],
            ],
        ]);

        return back()->with('success', 'Status subscription berhasil diperbarui.');
    }
}
