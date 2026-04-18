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
            ['name' => 'Manager', 'description' => 'Akses penuh operasional gudang, persetujuan, dan monitoring kinerja'],
            ['name' => 'Staff', 'description' => 'Operasional harian gudang dengan akses terbatas sesuai tugas'],
            ['name' => 'Driver', 'description' => 'Melakukan pengiriman dan update lokasi'],
        ];

        foreach ($roles as $role) {
            \App\Models\Role::firstOrCreate(['name' => $role['name']], $role);
        }

        $managerRole = \App\Models\Role::where('name', 'Manager')->first();

        User::query()->updateOrCreate([
            'email' => 'admin@example.com',
        ], [
            'role_id' => $managerRole->id,
            'name' => 'Test Admin',
            'email_verified_at' => now(),
            'password' => Hash::make('password'),
            'phone' => '08123456789',
            'status' => 'active',
        ]);
        
        $driverRole = \App\Models\Role::where('name', 'Driver')->first();
        
        $driverUser = User::query()->updateOrCreate([
            'email' => 'driver@example.com',
        ], [
            'role_id' => $driverRole->id,
            'name' => 'Test Driver',
            'email_verified_at' => now(),
            'password' => Hash::make('password'),
            'phone' => '08123456788',
            'status' => 'active',
        ]);

        \App\Models\Driver::query()->updateOrCreate([
            'user_id' => $driverUser->id,
        ], [
            'license_number' => 'D-12345-BT',
            'phone' => '08123456788',
            'status' => 'approved',
            'is_active' => true,
        ]);

        $this->call(WarehouseManagementSeeder::class);
        $this->call(SupplierSeeder::class);
        $this->call(ShipmentsSeeder::class);
    }
}
