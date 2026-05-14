<?php

namespace Tests\Feature;

use App\Models\Role;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RoleTenantIsolationTest extends TestCase
{
    use RefreshDatabase;

    public function test_manager_creates_staff_in_same_tenant(): void
    {
        $managerRole = Role::query()->firstOrCreate(['name' => 'Manager'], ['description' => 'Manager']);
        $staffRole = Role::query()->firstOrCreate(['name' => 'Staff'], ['description' => 'Staff']);

        $tenant = Tenant::query()->create([
            'code' => 'TEN-R1',
            'name' => 'Tenant R1',
            'slug' => 'tenant-r1',
            'status' => 'active',
            'timezone' => 'Asia/Makassar',
            'locale' => 'id',
        ]);

        $manager = User::factory()->create([
            'role_id' => $managerRole->id,
            'tenant_id' => $tenant->id,
            'email_verified_at' => now(),
        ]);

        $this->actingAs($manager)->post(route('settings.staff.store'), [
            'name' => 'Staff Tenant R1',
            'email' => 'staff-r1@example.com',
            'phone' => '081234567890',
            'role' => 'Staff',
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
        ])->assertRedirect();

        $created = User::query()->where('email', 'staff-r1@example.com')->first();
        $this->assertNotNull($created);
        $this->assertSame($tenant->id, $created->tenant_id);
        $this->assertSame($staffRole->id, $created->role_id);
    }

    public function test_manager_cannot_update_staff_from_other_tenant(): void
    {
        $managerRole = Role::query()->firstOrCreate(['name' => 'Manager'], ['description' => 'Manager']);
        $staffRole = Role::query()->firstOrCreate(['name' => 'Staff'], ['description' => 'Staff']);

        $tenantA = Tenant::query()->create([
            'code' => 'TEN-RA',
            'name' => 'Tenant RA',
            'slug' => 'tenant-ra',
            'status' => 'active',
            'timezone' => 'Asia/Makassar',
            'locale' => 'id',
        ]);

        $tenantB = Tenant::query()->create([
            'code' => 'TEN-RB',
            'name' => 'Tenant RB',
            'slug' => 'tenant-rb',
            'status' => 'active',
            'timezone' => 'Asia/Makassar',
            'locale' => 'id',
        ]);

        $managerA = User::factory()->create([
            'role_id' => $managerRole->id,
            'tenant_id' => $tenantA->id,
            'email_verified_at' => now(),
        ]);

        $staffB = User::factory()->create([
            'role_id' => $staffRole->id,
            'tenant_id' => $tenantB->id,
            'status' => 'active',
            'email_verified_at' => now(),
        ]);

        $this->actingAs($managerA)
            ->put(route('settings.staff.status', $staffB), ['status' => 'inactive'])
            ->assertForbidden();

        $this->assertSame('active', $staffB->fresh()->status);
    }
}

