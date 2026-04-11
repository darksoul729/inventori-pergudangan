<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $roles = [
            ['name' => 'Admin Gudang', 'description' => 'Input data barang & supplier, mencatat stok masuk/keluar'],
            ['name' => 'Manajer/Owner', 'description' => 'Meninjau dashboard dan laporan'],
        ];

        foreach ($roles as $role) {
            \App\Models\Role::firstOrCreate(['name' => $role['name']], $role);
        }

        $adminRole = \App\Models\Role::where('name', 'Admin Gudang')->first();

        User::query()->updateOrCreate([
            'email' => 'admin@example.com',
        ], [
            'role_id' => $adminRole->id,
            'name' => 'Test Admin',
            'email_verified_at' => now(),
            'password' => Hash::make('password'),
            'phone' => '08123456789',
            'status' => 'active',
        ]);

        $this->call(WarehouseManagementSeeder::class);
    }
}
