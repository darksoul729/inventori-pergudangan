<?php

namespace Tests\Feature;

use App\Models\Customer;
use App\Models\Invoice;
use App\Models\Module;
use App\Models\PurchaseOrder;
use App\Models\Role;
use App\Models\Shipment;
use App\Models\Supplier;
use App\Models\Tenant;
use App\Models\TenantModule;
use App\Models\TenantSubscription;
use App\Models\User;
use App\Models\Warehouse;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OperationalTenantIsolationTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_cannot_open_shipment_detail_and_pdf_from_other_tenant(): void
    {
        [$userA, $tenantB] = $this->bootstrapManagerWithModule('shipment');

        $shipmentB = Shipment::query()->create([
            'tenant_id' => $tenantB->id,
            'shipment_id' => 'TRK-B-001',
            'origin' => 'SMD',
            'origin_name' => 'Gudang B',
            'destination' => 'BPN',
            'destination_name' => 'Pelanggan B',
            'status' => 'in-transit',
            'estimated_arrival' => now()->addDay(),
            'load_type' => 'ground',
            'tracking_stage' => 'in_transit',
        ]);

        $this->actingAs($userA)
            ->get(route('shipments.show', $shipmentB))
            ->assertNotFound();

        $this->actingAs($userA)
            ->get(route('shipments.proof-pdf', $shipmentB))
            ->assertNotFound();
    }

    public function test_user_cannot_open_invoice_detail_and_pdf_from_other_tenant(): void
    {
        [$userA, $tenantB] = $this->bootstrapManagerWithModule('invoicing');

        $customerB = Customer::query()->create([
            'tenant_id' => $tenantB->id,
            'code' => 'CUST-B',
            'name' => 'Customer Tenant B',
            'email' => 'customer-b@example.com',
        ]);

        $creatorB = User::factory()->create([
            'tenant_id' => $tenantB->id,
            'role_id' => $userA->role_id,
            'status' => 'active',
            'email_verified_at' => now(),
        ]);

        $invoiceB = Invoice::query()->create([
            'tenant_id' => $tenantB->id,
            'invoice_number' => 'INV-B-001',
            'customer_id' => $customerB->id,
            'invoice_date' => now()->toDateString(),
            'total_amount' => 100000,
            'payment_status' => 'belum_dibayar',
            'created_by' => $creatorB->id,
        ]);

        $this->actingAs($userA)
            ->get(route('invoices.show', $invoiceB))
            ->assertNotFound();

        $this->actingAs($userA)
            ->get(route('invoices.pdf', $invoiceB))
            ->assertNotFound();
    }

    public function test_user_cannot_open_purchase_order_detail_and_pdf_from_other_tenant(): void
    {
        [$userA, $tenantB] = $this->bootstrapManagerWithModule('invoicing');

        $supplierB = Supplier::query()->create([
            'tenant_id' => $tenantB->id,
            'code' => 'SUP-B',
            'name' => 'Supplier Tenant B',
            'status' => 'active',
        ]);

        $warehouseB = Warehouse::query()->create([
            'tenant_id' => $tenantB->id,
            'code' => 'WH-B',
            'name' => 'Gudang B',
            'location' => 'Lokasi B',
        ]);

        $creatorB = User::factory()->create([
            'tenant_id' => $tenantB->id,
            'role_id' => $userA->role_id,
            'status' => 'active',
            'email_verified_at' => now(),
        ]);

        $poB = PurchaseOrder::query()->create([
            'tenant_id' => $tenantB->id,
            'po_number' => 'PO-B-001',
            'supplier_id' => $supplierB->id,
            'warehouse_id' => $warehouseB->id,
            'order_date' => now()->toDateString(),
            'status' => 'pending',
            'created_by' => $creatorB->id,
        ]);

        $this->actingAs($userA)
            ->get(route('purchase-orders.show', $poB))
            ->assertNotFound();

        $this->actingAs($userA)
            ->get(route('purchase-orders.pdf', $poB))
            ->assertNotFound();
    }

    /**
     * @return array{0: User, 1: Tenant}
     */
    private function bootstrapManagerWithModule(string $moduleCode): array
    {
        $managerRole = Role::query()->firstOrCreate(
            ['name' => 'Manager'],
            ['description' => 'Akses penuh operasional gudang']
        );

        $tenantA = Tenant::query()->create([
            'code' => 'TEN-A-' . strtoupper(substr(md5($moduleCode . microtime()), 0, 4)),
            'name' => 'Tenant A',
            'slug' => 'tenant-a-' . strtolower(substr(md5($moduleCode . 'a'), 0, 6)),
            'status' => 'active',
            'timezone' => 'Asia/Makassar',
            'locale' => 'id',
        ]);

        $tenantB = Tenant::query()->create([
            'code' => 'TEN-B-' . strtoupper(substr(md5($moduleCode . microtime(true)), 0, 4)),
            'name' => 'Tenant B',
            'slug' => 'tenant-b-' . strtolower(substr(md5($moduleCode . 'b'), 0, 6)),
            'status' => 'active',
            'timezone' => 'Asia/Makassar',
            'locale' => 'id',
        ]);

        $userA = User::factory()->create([
            'role_id' => $managerRole->id,
            'tenant_id' => $tenantA->id,
            'status' => 'active',
            'email_verified_at' => now(),
        ]);

        TenantSubscription::query()->create([
            'tenant_id' => $tenantA->id,
            'status' => 'trialing',
        ]);

        $module = Module::query()->firstOrCreate(
            ['code' => $moduleCode],
            ['name' => ucfirst($moduleCode), 'category' => 'Test', 'is_core' => false]
        );

        TenantModule::query()->create([
            'tenant_id' => $tenantA->id,
            'module_id' => $module->id,
            'is_enabled' => true,
            'source' => 'test',
        ]);

        return [$userA, $tenantB];
    }
}

