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
            ['name' => 'Supervisor', 'description' => 'Koordinasi operasional shift, validasi transaksi, laporan, dan approval harian gudang'],
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

        $supervisorRole = \App\Models\Role::where('name', 'Supervisor')->first();

        User::query()->updateOrCreate([
            'email' => 'supervisor@example.com',
        ], [
            'role_id' => $supervisorRole->id,
            'name' => 'Test Supervisor',
            'email_verified_at' => now(),
            'password' => Hash::make('password'),
            'phone' => '08123456786',
            'status' => 'active',
        ]);

        $staffRole = \App\Models\Role::where('name', 'Staff')->first();

        User::query()->updateOrCreate([
            'email' => 'staff@example.com',
        ], [
            'role_id' => $staffRole->id,
            'name' => 'Test Staff',
            'email_verified_at' => now(),
            'password' => Hash::make('password'),
            'phone' => '08123456787',
            'status' => 'active',
        ]);
        
        $driverRole = \App\Models\Role::where('name', 'Driver')->first();
        
        $driverUsersData = [
            [
                'email' => 'driver@example.com',
                'name' => 'Test Driver',
                'license' => 'D-12345-BT',
                'phone' => '08123456788',
            ],
            [
                'email' => 'driver2@example.com',
                'name' => 'Driver Budi',
                'license' => 'D-67890-JB',
                'phone' => '08123456789',
            ],
            [
                'email' => 'driver3@example.com',
                'name' => 'Driver Andi',
                'license' => 'D-11223-KT',
                'phone' => '08123456790',
            ],
            [
                'email' => 'driver4@example.com',
                'name' => 'Driver Citra',
                'license' => 'D-44556-LP',
                'phone' => '08123456791',
            ],
            [
                'email' => 'driver5@example.com',
                'name' => 'Driver Eko',
                'license' => 'D-77889-MN',
                'phone' => '08123456792',
            ],
        ];

        foreach ($driverUsersData as $data) {
            $user = User::query()->updateOrCreate([
                'email' => $data['email'],
            ], [
                'role_id' => $driverRole->id,
                'name' => $data['name'],
                'email_verified_at' => now(),
                'password' => Hash::make('password'),
                'phone' => $data['phone'],
                'status' => 'active',
            ]);

            \App\Models\Driver::query()->updateOrCreate([
                'user_id' => $user->id,
            ], [
                'license_number' => $data['license'],
                'phone' => $data['phone'],
                'status' => 'approved',
                'is_active' => true,
                'latitude' => null,
                'longitude' => null,
                'last_location_mock' => false,
            ]);
        }

        $this->call(WarehouseManagementSeeder::class);
        $this->call(SupplierSeeder::class);
        $this->call(ShipmentsSeeder::class);
    }
}
