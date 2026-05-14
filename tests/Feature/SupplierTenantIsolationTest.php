<?php

namespace Tests\Feature;

use App\Models\Role;
use App\Models\Module;
use App\Models\Supplier;
use App\Models\SupplierPerformance;
use App\Models\Tenant;
use App\Models\TenantModule;
use App\Models\TenantSubscription;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class SupplierTenantIsolationTest extends TestCase
{
    use RefreshDatabase;

    public function test_supplier_available_years_are_scoped_by_tenant(): void
    {
        $managerRole = Role::query()->firstOrCreate(['name' => 'Manager Gudang']);

        $tenantA = Tenant::query()->create([
            'code' => 'TEN-A',
            'name' => 'Tenant A',
            'slug' => 'tenant-a',
            'status' => 'active',
            'timezone' => 'Asia/Makassar',
            'locale' => 'id',
        ]);

        $tenantB = Tenant::query()->create([
            'code' => 'TEN-B',
            'name' => 'Tenant B',
            'slug' => 'tenant-b',
            'status' => 'active',
            'timezone' => 'Asia/Makassar',
            'locale' => 'id',
        ]);

        $userA = User::query()->create([
            'tenant_id' => $tenantA->id,
            'role_id' => $managerRole->id,
            'name' => 'Manager A',
            'email' => 'manager-a@example.com',
            'password' => bcrypt('password'),
            'status' => 'active',
        ]);
        $userA->forceFill(['email_verified_at' => now()])->save();

        TenantSubscription::query()->create([
            'tenant_id' => $tenantA->id,
            'status' => 'trialing',
        ]);

        $invoicingModule = Module::query()->firstOrCreate(
            ['code' => 'invoicing'],
            ['name' => 'Invoicing', 'category' => 'Keuangan', 'is_core' => false]
        );

        TenantModule::query()->create([
            'tenant_id' => $tenantA->id,
            'module_id' => $invoicingModule->id,
            'is_enabled' => true,
            'source' => 'test',
        ]);

        $supplierA = Supplier::query()->create([
            'tenant_id' => $tenantA->id,
            'code' => 'SUP-A',
            'name' => 'Supplier A',
            'status' => 'active',
        ]);

        $supplierB = Supplier::query()->create([
            'tenant_id' => $tenantB->id,
            'code' => 'SUP-B',
            'name' => 'Supplier B',
            'status' => 'active',
        ]);

        SupplierPerformance::query()->create([
            'supplier_id' => $supplierA->id,
            'period_month' => 1,
            'period_year' => 2026,
            'total_orders' => 10,
            'on_time_deliveries' => 9,
            'late_deliveries' => 1,
            'avg_lead_time_days' => 2.0,
            'auto_score' => 90,
            'manual_adjustment' => 0,
            'performance_score' => 90,
        ]);

        SupplierPerformance::query()->create([
            'supplier_id' => $supplierB->id,
            'period_month' => 1,
            'period_year' => 2030,
            'total_orders' => 10,
            'on_time_deliveries' => 10,
            'late_deliveries' => 0,
            'avg_lead_time_days' => 1.0,
            'auto_score' => 98,
            'manual_adjustment' => 0,
            'performance_score' => 98,
        ]);

        $this->actingAs($userA)
            ->get(route('supplier'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Supplier')
                ->where('availableYears', [2026])
            );
    }
}
