<?php

namespace Tests\Feature;

use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SaasAdminAccessTest extends TestCase
{
    use RefreshDatabase;

    public function test_manager_cannot_access_saas_admin_page(): void
    {
        $managerRole = Role::query()->firstOrCreate(['name' => 'Manager'], ['description' => 'Manager']);

        $manager = User::factory()->create([
            'role_id' => $managerRole->id,
            'email_verified_at' => now(),
            'status' => 'active',
        ]);

        $this->actingAs($manager)
            ->get(route('settings.saas'))
            ->assertForbidden();
    }

    public function test_system_admin_can_access_saas_admin_page(): void
    {
        $systemAdminRole = Role::query()->firstOrCreate(['name' => 'Admin Sistem'], ['description' => 'Admin Sistem']);

        $sysadmin = User::factory()->create([
            'role_id' => $systemAdminRole->id,
            'tenant_id' => null,
            'email_verified_at' => now(),
            'status' => 'active',
        ]);

        $this->actingAs($sysadmin)
            ->get(route('settings.saas'))
            ->assertOk();
    }
}

