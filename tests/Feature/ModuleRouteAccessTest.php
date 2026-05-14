<?php

namespace Tests\Feature;

use App\Models\Plan;
use App\Models\Role;
use App\Models\Tenant;
use App\Models\TenantSubscription;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ModuleRouteAccessTest extends TestCase
{
    use RefreshDatabase;

    public function test_invoicing_route_forbidden_when_module_not_enabled(): void
    {
        $managerRole = Role::query()->firstOrCreate(['name' => 'Manager'], ['description' => 'Manager']);

        $tenant = Tenant::query()->create([
            'code' => 'TEN-MOD-01',
            'name' => 'Tenant Mod 01',
            'slug' => 'tenant-mod-01',
            'status' => 'active',
            'timezone' => 'Asia/Makassar',
            'locale' => 'id',
        ]);

        $plan = Plan::query()->create([
            'code' => 'custom_no_modules',
            'name' => 'Custom No Modules',
            'monthly_price' => 0,
            'yearly_price' => 0,
            'is_public' => false,
        ]);

        TenantSubscription::query()->create([
            'tenant_id' => $tenant->id,
            'plan_id' => $plan->id,
            'status' => 'active',
            'starts_at' => now(),
            'trial_ends_at' => now()->addDays(3),
        ]);

        $user = User::factory()->create([
            'role_id' => $managerRole->id,
            'tenant_id' => $tenant->id,
            'email_verified_at' => now(),
            'status' => 'active',
        ]);

        $this->actingAs($user)
            ->get(route('invoices.index'))
            ->assertForbidden();
    }
}

