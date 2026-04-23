<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Product;
use App\Models\ProductStock;
use App\Models\PurchaseOrder;
use App\Models\Rack;
use App\Models\RackStock;
use App\Models\Role;
use App\Models\Supplier;
use App\Models\Unit;
use App\Models\User;
use App\Models\Warehouse;
use App\Models\WarehouseZone;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RoleAccessTest extends TestCase
{
    use RefreshDatabase;

    public function test_manager_can_create_staff_account(): void
    {
        $manager = $this->userWithRole('Manager');
        Role::firstOrCreate(['name' => 'Staff'], ['description' => 'Operasional harian gudang']);

        $response = $this
            ->actingAs($manager)
            ->post(route('settings.staff.store'), [
                'name' => 'Staff Gudang',
                'email' => 'staff@example.com',
                'phone' => '08123456780',
                'role' => 'Staff',
                'password' => 'password',
                'password_confirmation' => 'password',
            ]);

        $response->assertRedirect(route('settings', ['active' => 'staff'], false));
        $this->assertDatabaseHas('users', [
            'email' => 'staff@example.com',
            'status' => 'active',
        ]);
    }

    public function test_manager_can_create_supervisor_account(): void
    {
        $manager = $this->userWithRole('Manager');
        Role::firstOrCreate(['name' => 'Supervisor'], ['description' => 'Koordinator operasional gudang']);

        $response = $this
            ->actingAs($manager)
            ->post(route('settings.staff.store'), [
                'name' => 'Supervisor Gudang',
                'email' => 'supervisor@example.com',
                'phone' => '08123456782',
                'role' => 'Supervisor',
                'password' => 'password',
                'password_confirmation' => 'password',
            ]);

        $response->assertRedirect(route('settings', ['active' => 'staff'], false));
        $this->assertDatabaseHas('users', [
            'email' => 'supervisor@example.com',
            'status' => 'active',
        ]);
    }

    public function test_manager_can_create_driver_account(): void
    {
        $manager = $this->userWithRole('Manager');
        Role::firstOrCreate(['name' => 'Driver'], ['description' => 'Driver role']);

        $response = $this
            ->actingAs($manager)
            ->post(route('drivers.store'), [
                'name' => 'Driver Gudang',
                'email' => 'driver-gudang@example.com',
                'phone' => '08123456781',
                'license_number' => 'SIM-DRIVER-001',
                'password' => 'password',
                'password_confirmation' => 'password',
                'status' => 'approved',
            ]);

        $response->assertRedirect(route('drivers.index', absolute: false));
        $this->assertDatabaseHas('users', [
            'email' => 'driver-gudang@example.com',
            'status' => 'active',
        ]);
        $this->assertDatabaseHas('drivers', [
            'license_number' => 'SIM-DRIVER-001',
            'status' => 'approved',
        ]);
    }

    public function test_staff_cannot_access_manager_only_routes(): void
    {
        $staff = $this->userWithRole('Staff');

        $this->actingAs($staff)->get(route('settings'))->assertForbidden();
        $this->actingAs($staff)->get(route('drivers.index'))->assertForbidden();
        $this->actingAs($staff)->get(route('rack.allocation'))->assertForbidden();
        $this->actingAs($staff)->get(route('stock-opname.index'))->assertForbidden();
        $this->actingAs($staff)->get(route('inventory.create'))->assertForbidden();
        $this->actingAs($staff)->get(route('purchase-orders.create'))->assertForbidden();
        $this->actingAs($staff)->get(route('shipments.create'))->assertForbidden();
        $this->actingAs($staff)->get(route('reports'))->assertForbidden();
        $this->actingAs($staff)->get(route('transaction.export'))->assertForbidden();

        $this->actingAs($staff)->post(route('warehouse.zones.store'), [])->assertForbidden();
        $this->actingAs($staff)->post(route('supplier.store'), [])->assertForbidden();
        $this->actingAs($staff)->post(route('purchase-orders.store'), [])->assertForbidden();
        $this->actingAs($staff)->post(route('shipments.store'), [])->assertForbidden();
        $this->actingAs($staff)->post(route('rack.allocation.transfers.store'), [])->assertForbidden();
        $this->actingAs($staff)->post(route('stock-opname.store'), [])->assertForbidden();
    }

    public function test_supervisor_has_operational_approval_access_but_not_admin_access(): void
    {
        $supervisor = $this->userWithRole('Supervisor');

        $this->actingAs($supervisor)->get(route('dashboard'))->assertOk();
        $this->actingAs($supervisor)->get(route('warehouse'))->assertOk();
        $this->actingAs($supervisor)->get(route('inventory'))->assertOk();
        $this->actingAs($supervisor)->get(route('transaction'))->assertOk();
        $this->actingAs($supervisor)->get(route('transaction.export'))->assertOk();
        $this->actingAs($supervisor)->get(route('supplier'))->assertOk();
        $this->actingAs($supervisor)->get(route('purchase-orders.index'))->assertOk();
        $this->actingAs($supervisor)->get(route('purchase-orders.create'))->assertOk();
        $this->actingAs($supervisor)->get(route('shipments.index'))->assertOk();
        $this->actingAs($supervisor)->get(route('shipments.create'))->assertOk();
        $this->actingAs($supervisor)->get(route('reports'))->assertOk();
        $this->actingAs($supervisor)->get(route('rack.allocation'))->assertOk();
        $this->actingAs($supervisor)->get(route('stock-opname.index'))->assertOk();

        $this->actingAs($supervisor)->get(route('settings'))->assertForbidden();
        $this->actingAs($supervisor)->get(route('drivers.index'))->assertForbidden();
        $this->actingAs($supervisor)->get(route('inventory.create'))->assertForbidden();
        $this->actingAs($supervisor)->post(route('warehouse.zones.store'), [])->assertForbidden();
        $this->actingAs($supervisor)->post(route('warehouse.racks.store'), [])->assertForbidden();
        $this->actingAs($supervisor)->post(route('supplier.store'), [])->assertForbidden();
    }

    public function test_supervisor_cannot_approve_purchase_order_but_manager_can(): void
    {
        $manager = $this->userWithRole('Manager');
        $supervisor = $this->userWithRole('Supervisor');
        $purchaseOrder = $this->createPurchaseOrderFixture($manager);

        $this
            ->actingAs($supervisor)
            ->put(route('purchase-orders.update-status', $purchaseOrder), ['status' => 'approved'])
            ->assertForbidden();

        $this->assertDatabaseHas('purchase_orders', [
            'id' => $purchaseOrder->id,
            'status' => 'pending',
            'approved_by' => null,
        ]);

        $this
            ->actingAs($manager)
            ->put(route('purchase-orders.update-status', $purchaseOrder), ['status' => 'approved'])
            ->assertRedirect();

        $this->assertDatabaseHas('purchase_orders', [
            'id' => $purchaseOrder->id,
            'status' => 'approved',
            'approved_by' => $manager->id,
        ]);
    }

    public function test_staff_can_record_outbound_stock_but_cannot_create_products(): void
    {
        $staff = $this->userWithRole('Staff');
        [$warehouse, $product] = $this->createStockFixture();

        $this
            ->actingAs($staff)
            ->post(route('inventory.outbound'), [
                'product_id' => $product->id,
                'warehouse_id' => $warehouse->id,
                'quantity' => 3,
                'destination' => 'Audit outbound',
                'notes' => 'Staff outbound permission check',
            ])
            ->assertRedirect(route('inventory', absolute: false));

        $this->assertDatabaseHas('stock_movements', [
            'product_id' => $product->id,
            'warehouse_id' => $warehouse->id,
            'movement_type' => 'out',
            'quantity' => 3,
            'created_by' => $staff->id,
        ]);

        $this->assertDatabaseHas('product_stocks', [
            'product_id' => $product->id,
            'warehouse_id' => $warehouse->id,
            'current_stock' => 7,
        ]);

        $this->actingAs($staff)->post(route('inventory.store'), [])->assertForbidden();
    }

    private function userWithRole(string $roleName): User
    {
        $role = Role::firstOrCreate(
            ['name' => $roleName],
            ['description' => "{$roleName} role"]
        );

        return User::factory()->create([
            'role_id' => $role->id,
            'status' => 'active',
        ]);
    }

    /**
     * @return array{0: Warehouse, 1: Product}
     */
    private function createStockFixture(): array
    {
        $category = Category::create([
            'name' => 'Audit Category',
            'description' => 'Role permission fixture',
        ]);

        $unit = Unit::create([
            'name' => 'Unit',
            'symbol' => 'pcs',
        ]);

        $warehouse = Warehouse::create([
            'code' => 'WH-AUDIT',
            'name' => 'Audit Warehouse',
            'location' => 'Audit Location',
        ]);

        $zone = WarehouseZone::create([
            'warehouse_id' => $warehouse->id,
            'code' => 'Z-AUDIT',
            'name' => 'Audit Zone',
            'capacity' => 100,
        ]);

        $rack = Rack::create([
            'warehouse_zone_id' => $zone->id,
            'code' => 'R-AUDIT',
            'name' => 'Audit Rack',
            'capacity' => 100,
        ]);

        $product = Product::create([
            'sku' => 'SKU-AUDIT',
            'name' => 'Audit Product',
            'category_id' => $category->id,
            'unit_id' => $unit->id,
            'minimum_stock' => 1,
            'purchase_price' => 1000,
            'selling_price' => 1500,
            'is_active' => true,
        ]);

        ProductStock::create([
            'product_id' => $product->id,
            'warehouse_id' => $warehouse->id,
            'current_stock' => 10,
            'reserved_stock' => 0,
            'last_updated_at' => now(),
        ]);

        RackStock::create([
            'rack_id' => $rack->id,
            'product_id' => $product->id,
            'quantity' => 10,
            'reserved_quantity' => 0,
            'last_updated_at' => now(),
        ]);

        return [$warehouse, $product];
    }

    private function createPurchaseOrderFixture(User $creator): PurchaseOrder
    {
        $warehouse = Warehouse::create([
            'code' => 'WH-PO',
            'name' => 'Purchase Warehouse',
            'location' => 'Purchase Location',
        ]);

        $supplier = Supplier::create([
            'code' => 'SUP-PO',
            'name' => 'Supplier PO',
            'email' => 'supplier-po@example.com',
            'phone' => '08123450000',
            'address' => 'Purchase Address',
            'status' => 'active',
        ]);

        return PurchaseOrder::create([
            'po_number' => 'PO-ROLE-001',
            'supplier_id' => $supplier->id,
            'warehouse_id' => $warehouse->id,
            'order_date' => now()->toDateString(),
            'expected_date' => now()->addDay()->toDateString(),
            'status' => 'pending',
            'created_by' => $creator->id,
        ]);
    }
}
