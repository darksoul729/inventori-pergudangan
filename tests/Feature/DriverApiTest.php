<?php

namespace Tests\Feature;

use App\Models\Driver;
use App\Models\Role;
use App\Models\Shipment;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class DriverApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_driver_public_registration_is_disabled(): void
    {
        $response = $this->postJson('/api/driver/register', [
            'name' => 'Driver Mobile',
            'email' => 'driver-mobile@example.com',
            'password' => 'password123',
            'phone' => '081234567890',
            'license_number' => 'SIM-998877',
        ]);

        $response->assertNotFound();
    }

    public function test_driver_profile_endpoint_returns_user_and_driver(): void
    {
        ['user' => $user] = $this->createApprovedDriver('profile-driver@example.com', 'SIM-PROFILE');
        Sanctum::actingAs($user);

        $this->getJson('/api/driver/profile')
            ->assertOk()
            ->assertJsonPath('user.email', 'profile-driver@example.com')
            ->assertJsonPath('driver.license_number', 'SIM-PROFILE');
    }

    public function test_driver_can_claim_and_update_tracking_stage(): void
    {
        ['user' => $user, 'driver' => $driver] = $this->createApprovedDriver();
        $shipment = $this->createShipment(['shipment_id' => 'TRK-445566']);

        Sanctum::actingAs($user);

        $this->postJson('/api/driver/shipments/claim', [
            'shipment_id' => 'TRK-445566',
        ])->assertOk()
            ->assertJsonPath('shipment.tracking_stage', 'ready_for_pickup');

        $this->putJson("/api/driver/shipments/{$shipment->id}/status", [
            'tracking_stage' => 'arrived_at_destination',
            'note' => 'Barang sudah tiba di gudang tujuan.',
        ])->assertOk()
            ->assertJsonPath('shipment.tracking_stage', 'arrived_at_destination')
            ->assertJsonPath('shipment.last_tracking_note', 'Barang sudah tiba di gudang tujuan.');

        $this->assertDatabaseHas('shipments', [
            'id' => $shipment->id,
            'driver_id' => $driver->id,
            'tracking_stage' => 'arrived_at_destination',
            'status' => 'in-transit',
        ]);
    }

    public function test_driver_cannot_claim_second_shipment_when_active_exists(): void
    {
        ['user' => $user, 'driver' => $driver] = $this->createApprovedDriver();
        $first = $this->createShipment(['shipment_id' => 'TRK-ACTIVE-1']);
        $second = $this->createShipment(['shipment_id' => 'TRK-ACTIVE-2']);

        $first->update([
            'driver_id' => $driver->id,
            'tracking_stage' => 'in_transit',
        ]);

        Sanctum::actingAs($user);

        $this->postJson('/api/driver/shipments/claim', ['shipment_id' => $second->shipment_id])
            ->assertStatus(422)
            ->assertJsonPath('message', 'Selesaikan 1 pengiriman aktif Anda dulu. Pengiriman baru bisa diambil setelah bukti diverifikasi admin.');
    }

    public function test_driver_cannot_claim_when_previous_delivery_is_waiting_admin_verification(): void
    {
        ['user' => $user, 'driver' => $driver] = $this->createApprovedDriver();
        $waitingShipment = $this->createShipment(['shipment_id' => 'TRK-POD-WAIT']);
        $newShipment = $this->createShipment(['shipment_id' => 'TRK-POD-NEW']);

        $waitingShipment->update([
            'driver_id' => $driver->id,
            'tracking_stage' => 'delivered',
            'pod_verification_status' => 'pending',
        ]);

        Sanctum::actingAs($user);

        $this->postJson('/api/driver/shipments/claim', ['shipment_id' => $newShipment->shipment_id])
            ->assertStatus(422);
    }

    public function test_driver_can_claim_new_shipment_after_admin_approves_previous_pod(): void
    {
        ['user' => $user, 'driver' => $driver] = $this->createApprovedDriver();
        $verifiedShipment = $this->createShipment(['shipment_id' => 'TRK-POD-OK']);
        $newShipment = $this->createShipment(['shipment_id' => 'TRK-POD-NEXT']);

        $verifiedShipment->update([
            'driver_id' => $driver->id,
            'tracking_stage' => 'delivered',
            'pod_verification_status' => 'approved',
        ]);

        Sanctum::actingAs($user);

        $this->postJson('/api/driver/shipments/claim', ['shipment_id' => $newShipment->shipment_id])
            ->assertOk()
            ->assertJsonPath('shipment.shipment_id', 'TRK-POD-NEXT');
    }

    public function test_driver_can_submit_proof_of_delivery_and_status_becomes_pending(): void
    {
        ['user' => $user, 'driver' => $driver] = $this->createApprovedDriver();
        $shipment = $this->createShipment(['shipment_id' => 'TRK-POD-100']);

        $shipment->update([
            'driver_id' => $driver->id,
            'tracking_stage' => 'arrived_at_destination',
        ]);

        Sanctum::actingAs($user);

        $this->putJson("/api/driver/shipments/{$shipment->id}/status", [
            'tracking_stage' => 'delivered',
            'delivery_recipient_name' => 'Budi',
            'delivery_note' => 'Diterima satpam',
        ])->assertOk()
            ->assertJsonPath('shipment.tracking_stage', 'delivered')
            ->assertJsonPath('shipment.pod_verification_status', 'pending');
    }

    public function test_assigned_shipments_uses_message_and_data_envelope(): void
    {
        ['user' => $user, 'driver' => $driver] = $this->createApprovedDriver();
        $shipment = $this->createShipment(['shipment_id' => 'TRK-LIST-1']);

        $shipment->update([
            'driver_id' => $driver->id,
            'tracking_stage' => 'ready_for_pickup',
        ]);

        Sanctum::actingAs($user);

        $this->getJson('/api/driver/shipments')
            ->assertOk()
            ->assertJsonPath('message', 'Assigned shipments loaded.')
            ->assertJsonPath('data.0.shipment_id', 'TRK-LIST-1');
    }

    public function test_shipment_history_only_returns_delivered_with_approved_verification(): void
    {
        ['user' => $user, 'driver' => $driver] = $this->createApprovedDriver();
        $approved = $this->createShipment(['shipment_id' => 'TRK-HIST-APP']);
        $pending = $this->createShipment(['shipment_id' => 'TRK-HIST-PEN']);

        $approved->update([
            'driver_id' => $driver->id,
            'tracking_stage' => 'delivered',
            'pod_verification_status' => 'approved',
        ]);

        $pending->update([
            'driver_id' => $driver->id,
            'tracking_stage' => 'delivered',
            'pod_verification_status' => 'pending',
        ]);

        Sanctum::actingAs($user);

        $this->getJson('/api/driver/shipments/history')
            ->assertOk()
            ->assertJsonPath('message', 'Shipment history loaded.')
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.shipment_id', 'TRK-HIST-APP');
    }

    private function createApprovedDriver(
        string $email = 'approved-driver@example.com',
        string $licenseNumber = 'SIM-111222',
    ): array {
        $driverRole = Role::firstOrCreate(
            ['name' => 'Driver'],
            ['description' => 'Driver role']
        );

        $user = User::create([
            'role_id' => $driverRole->id,
            'name' => 'Approved Driver',
            'email' => $email,
            'password' => bcrypt('password123'),
            'status' => 'active',
        ]);

        $driver = Driver::create([
            'user_id' => $user->id,
            'license_number' => $licenseNumber,
            'status' => 'approved',
        ]);

        return compact('user', 'driver');
    }

    private function createShipment(array $overrides = []): Shipment
    {
        return Shipment::create(array_merge([
            'shipment_id' => 'TRK-'.Str::upper(Str::random(8)),
            'origin' => 'MKS',
            'origin_name' => 'Makassar',
            'destination' => 'SBY',
            'destination_name' => 'Surabaya',
            'status' => 'in-transit',
            'estimated_arrival' => now()->addDay(),
            'load_type' => 'ground',
        ], $overrides));
    }
}
