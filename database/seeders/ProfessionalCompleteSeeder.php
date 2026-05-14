<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class ProfessionalCompleteSeeder extends Seeder
{
    public function run(): void
    {
        $roles = $this->seedRoles();
        $this->seedSystemAdminOnly($roles);
    }

    private function seedRoles(): array
    {
        $items = [
            ['name' => 'Manager', 'description' => 'Akses operasional gudang'],
            ['name' => 'Supervisor', 'description' => 'Koordinasi operasional gudang'],
            ['name' => 'Staff', 'description' => 'Operasional harian gudang'],
            ['name' => 'Driver', 'description' => 'Pengiriman dan update lokasi'],
            ['name' => 'Admin Sistem', 'description' => 'Mengelola seluruh sistem SaaS Petayu'],
        ];

        $roles = [];
        foreach ($items as $item) {
            $roles[$item['name']] = Role::query()->updateOrCreate(
                ['name' => $item['name']],
                ['description' => $item['description']]
            );
        }

        return $roles;
    }

    private function seedSystemAdminOnly(array $roles): void
    {
        User::query()->where('email', 'admin@petayu.com')->delete();

        User::query()->updateOrCreate(
            ['email' => 'sysadmin@petayu.com'],
            [
                'tenant_id' => null,
                'role_id' => $roles['Admin Sistem']->id,
                'name' => 'Sysadmin Petayu',
                'phone' => '081200000999',
                'password' => Hash::make('password123'),
                'status' => 'active',
                'email_verified_at' => now(),
                'remember_token' => Str::random(10),
            ]
        );
    }
}

