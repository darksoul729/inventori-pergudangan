<?php

namespace Tests\Feature\Auth;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RegistrationTest extends TestCase
{
    use RefreshDatabase;

    public function test_registration_screen_can_be_rendered(): void
    {
        $response = $this->get('/register');

        $response->assertOk();
    }

    public function test_public_users_can_register_trial_account(): void
    {
        \App\Models\Role::query()->firstOrCreate(
            ['name' => 'Manager'],
            ['description' => 'Akses penuh operasional gudang']
        );

        $response = $this->post('/register', [
            'name' => 'PIC Test',
            'phone' => '081234567890',
            'email' => 'test@example.com',
            'company_name' => 'PT Test Registrasi',
            'warehouse_name' => 'Gudang Utama Test',
            'city' => 'Makassar',
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
            'selected_modules' => ['core_inventory'],
        ]);

        $response->assertRedirect(route('dashboard', absolute: false));
        $this->assertAuthenticated();
    }
}
