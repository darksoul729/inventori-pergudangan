<?php

namespace App\Http\Controllers;

use App\Models\Module;
use App\Models\Role;
use App\Models\SaasAuditLog;
use App\Models\Tenant;
use App\Models\TenantModule;
use App\Models\SubscriptionPayment;
use App\Models\TenantSubscription;
use App\Models\User;
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
            ->first();

        if (!$subscription) {
            return back()->with('error', 'Tenant belum memiliki subscription aktif.');
        }

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

    public function auditLog(): Response
    {
        $logs = SaasAuditLog::query()
            ->with(['tenant:id,name,code', 'actor:id,name,email'])
            ->latest()
            ->paginate(20)
            ->through(fn (SaasAuditLog $log) => [
                'id' => $log->id,
                'event_type' => $log->event_type,
                'tenant_name' => $log->tenant?->name ?? '-',
                'actor_name' => $log->actor?->name ?? 'System',
                'payload' => $log->payload,
                'created_at' => $log->created_at?->format('d M Y, H:i'),
            ]);

        return Inertia::render('Saas/AuditLog', ['logs' => $logs]);
    }

    public function stats(): Response
    {
        $totalTenants = Tenant::count();
        $activeSubs = TenantSubscription::where('status', 'active')->count();
        $trialSubs = TenantSubscription::where('status', 'trialing')->count();
        $totalRevenue = SubscriptionPayment::query()->where('status', 'paid')->sum('amount');
        $recentPayments = SubscriptionPayment::query()
            ->where('status', 'paid')
            ->orderByDesc('created_at')
            ->limit(10)
            ->get(['provider_order_id', 'amount', 'status', 'created_at'])
            ->map(fn (SubscriptionPayment $payment) => [
                'order_id' => $payment->provider_order_id,
                'amount' => $payment->amount,
                'status' => $payment->status,
                'created_at' => $payment->created_at,
            ]);

        return Inertia::render('Saas/Stats', [
            'stats' => [
                'total_tenants' => $totalTenants,
                'active_subscriptions' => $activeSubs,
                'trial_subscriptions' => $trialSubs,
                'total_revenue' => $totalRevenue,
            ],
            'recentPayments' => $recentPayments,
        ]);
    }

    public function users(Request $request): Response
    {
        $search = trim((string) $request->query('search', ''));
        $status = trim((string) $request->query('status', 'all'));
        $roleFilter = trim((string) $request->query('role', 'all'));
        $tenantFilter = (int) $request->query('tenant', 0);

        $users = User::query()
            ->with(['role:id,name', 'tenant:id,name,code'])
            ->when($search !== '', function ($q) use ($search) {
                $q->where(function ($sub) use ($search) {
                    $sub->where('name', 'like', '%' . $search . '%')
                        ->orWhere('email', 'like', '%' . $search . '%')
                        ->orWhere('phone', 'like', '%' . $search . '%');
                });
            })
            ->when(in_array($status, ['active', 'inactive'], true), fn ($q) => $q->where('status', $status))
            ->when($roleFilter !== '' && $roleFilter !== 'all', function ($q) use ($roleFilter) {
                $q->whereHas('role', fn ($rq) => $rq->whereRaw('LOWER(name) = ?', [strtolower($roleFilter)]));
            })
            ->when($tenantFilter > 0, fn ($q) => $q->where('tenant_id', $tenantFilter))
            ->orderByDesc('id')
            ->paginate(20)
            ->withQueryString()
            ->through(fn (User $user) => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'status' => $user->status,
                'role' => $user->role?->name ?? '-',
                'tenant_id' => $user->tenant_id,
                'tenant_name' => $user->tenant?->name ?? '-',
                'tenant_code' => $user->tenant?->code ?? '-',
                'created_at' => $user->created_at?->format('d M Y, H:i'),
            ]);

        $roles = Role::query()
            ->orderBy('name')
            ->get(['id', 'name'])
            ->map(fn (Role $role) => ['id' => $role->id, 'name' => $role->name]);

        $tenants = Tenant::query()
            ->orderBy('name')
            ->get(['id', 'name', 'code'])
            ->map(fn (Tenant $tenant) => [
                'id' => $tenant->id,
                'name' => $tenant->name,
                'code' => $tenant->code,
            ]);

        return Inertia::render('Saas/Users', [
            'users' => $users,
            'roles' => $roles,
            'tenants' => $tenants,
            'filters' => [
                'search' => $search,
                'status' => $status,
                'role' => $roleFilter,
                'tenant' => $tenantFilter > 0 ? $tenantFilter : null,
            ],
        ]);
    }

    public function updateUser(Request $request, User $user): RedirectResponse
    {
        $validated = $request->validate([
            'role' => ['nullable', 'string', 'exists:roles,name'],
            'status' => ['nullable', 'in:active,inactive'],
        ]);

        $actor = $request->user();
        $updatingSelf = (int) ($actor?->id ?? 0) === (int) $user->id;

        if ($updatingSelf && (($validated['status'] ?? null) === 'inactive')) {
            return back()->with('error', 'Akun Anda sendiri tidak bisa dinonaktifkan.');
        }

        if ($updatingSelf && !empty($validated['role']) && strtolower((string) $validated['role']) !== 'admin sistem') {
            return back()->with('error', 'Role akun Anda sendiri tidak boleh diturunkan.');
        }

        $changes = [];
        if (!empty($validated['role'])) {
            $role = Role::query()->where('name', $validated['role'])->firstOrFail();
            if ((int) $user->role_id !== (int) $role->id) {
                $changes['role'] = ['from' => $user->role?->name, 'to' => $role->name];
                $user->role_id = $role->id;
            }
        }

        if (!empty($validated['status']) && $validated['status'] !== $user->status) {
            $changes['status'] = ['from' => $user->status, 'to' => $validated['status']];
            $user->status = $validated['status'];
        }

        if (empty($changes)) {
            return back()->with('success', 'Tidak ada perubahan data user.');
        }

        $user->save();

        SaasAuditLog::query()->create([
            'tenant_id' => $user->tenant_id,
            'actor_user_id' => auth()->id(),
            'event_type' => 'user_global_updated',
            'target_type' => 'user',
            'target_id' => $user->id,
            'payload' => [
                'user_email' => $user->email,
                'changes' => $changes,
            ],
        ]);

        return back()->with('success', 'User berhasil diperbarui.');
    }
}
