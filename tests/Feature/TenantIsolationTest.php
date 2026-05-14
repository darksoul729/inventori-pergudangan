<?php

namespace Tests\Feature;

use App\Models\Report;
use App\Models\Role;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TenantIsolationTest extends TestCase
{
    use RefreshDatabase;

    public function test_billing_is_forbidden_when_user_has_no_tenant(): void
    {
        $managerRole = Role::query()->firstOrCreate(
            ['name' => 'Manager'],
            ['description' => 'Akses penuh operasional gudang']
        );

        $user = User::factory()->create([
            'role_id' => $managerRole->id,
            'tenant_id' => null,
            'email_verified_at' => now(),
        ]);

        $this->actingAs($user)
            ->get(route('settings.billing'))
            ->assertForbidden();
    }

    public function test_user_cannot_download_report_from_other_tenant(): void
    {
        $managerRole = Role::query()->firstOrCreate(
            ['name' => 'Manager'],
            ['description' => 'Akses penuh operasional gudang']
        );

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

        $userA = User::factory()->create([
            'role_id' => $managerRole->id,
            'tenant_id' => $tenantA->id,
            'email_verified_at' => now(),
        ]);

        $userB = User::factory()->create([
            'role_id' => $managerRole->id,
            'tenant_id' => $tenantB->id,
            'email_verified_at' => now(),
        ]);

        $reportB = Report::query()->create([
            'name' => 'tenant-b-report.pdf',
            'type' => 'PDF',
            'file_path' => 'reports/tenant-b-report.pdf',
            'user_id' => $userB->id,
            'status' => 'completed',
            'metadata' => ['source' => 'test'],
        ]);

        $this->actingAs($userA)
            ->get(route('reports.download', $reportB))
            ->assertForbidden();
    }
}

