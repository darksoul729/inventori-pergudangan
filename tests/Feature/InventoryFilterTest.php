<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Product;
use App\Models\ProductStock;
use App\Models\Rack;
use App\Models\RackStock;
use App\Models\Role;
use App\Models\Supplier;
use App\Models\Unit;
use App\Models\User;
use App\Models\Warehouse;
use App\Models\WarehouseZone;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class InventoryFilterTest extends TestCase
{
    use RefreshDatabase;

    public function test_inventory_status_filters_apply_warehouse_stock_bindings(): void
    {
        $staff = $this->userWithRole('Staff');
        [$warehouse, $category, $unit] = $this->inventoryFixture();

        $healthy = $this->createProduct($category, $unit, 'HEALTHY-001', 'Healthy Product', 10);
        ProductStock::create([
            'product_id' => $healthy->id,
            'warehouse_id' => $warehouse->id,
            'current_stock' => 12,
            'reserved_stock' => 0,
        ]);

        $lowStock = $this->createProduct($category, $unit, 'LOW-001', 'Low Product', 10);
        ProductStock::create([
            'product_id' => $lowStock->id,
            'warehouse_id' => $warehouse->id,
            'current_stock' => 4,
            'reserved_stock' => 0,
        ]);

        $outOfStock = $this->createProduct($category, $unit, 'OUT-001', 'Out Product', 10);
        ProductStock::create([
            'product_id' => $outOfStock->id,
            'warehouse_id' => $warehouse->id,
            'current_stock' => 0,
            'reserved_stock' => 0,
        ]);

        $this->actingAs($staff)->get(route('inventory', ['status' => 'Healthy']))->assertOk();
        $this->actingAs($staff)->get(route('inventory', ['status' => 'LowStock']))->assertOk();
        $this->actingAs($staff)->get(route('inventory', ['status' => 'OutOfStock']))->assertOk();
    }

    public function test_inventory_status_badge_uses_displayed_capacity_percentage(): void
    {
        $staff = $this->userWithRole('Staff');
        [$warehouse, $category, $unit] = $this->inventoryFixture();
        $rack = $this->createRack($warehouse, 3800);

        $product = $this->createProduct($category, $unit, 'AX900-001', 'AX900 Sensor Module', 10);
        ProductStock::create([
            'product_id' => $product->id,
            'warehouse_id' => $warehouse->id,
            'current_stock' => 45,
            'reserved_stock' => 0,
        ]);

        RackStock::create([
            'rack_id' => $rack->id,
            'product_id' => $product->id,
            'quantity' => 45,
            'reserved_quantity' => 0,
            'last_updated_at' => now(),
        ]);

        $response = $this->actingAs($staff)->get(route('inventory'));

        $response->assertOk()
            ->assertInertia(fn(Assert $page) => $page
                ->component('Inventory')
                ->where('products.data.0.current_stock', 45)
                ->where('products.data.0.max_stock', 3800)
                ->where('products.data.0.percentage', 1)
                ->where('products.data.0.status', 'Low Stock')
                ->where('stats.low_stock', 1)
                ->where('stats.storage_efficiency', 1.2)
                ->where('stats.occupied_storage', 45)
                ->where('stats.total_storage_capacity', 3800)
            );

        $this->actingAs($staff)->get(route('inventory', ['status' => 'LowStock']))
            ->assertOk()
            ->assertInertia(fn(Assert $page) => $page
                ->where('products.data.0.status', 'Low Stock')
            );

        $this->actingAs($staff)->get(route('inventory', ['status' => 'Healthy']))
            ->assertOk()
            ->assertInertia(fn(Assert $page) => $page
                ->where('products.data', [])
            );
    }

    public function test_inventory_advanced_filters_apply_unit_supplier_and_stock_percentage(): void
    {
        $staff = $this->userWithRole('Staff');
        [$warehouse, $category, $unit] = $this->inventoryFixture();
        $otherUnit = Unit::create([
            'name' => 'Box',
            'symbol' => 'box',
        ]);
        $supplier = Supplier::create([
            'code' => 'SUP-FILTER',
            'name' => 'Filter Supplier',
            'status' => 'active',
        ]);
        $otherSupplier = Supplier::create([
            'code' => 'SUP-OTHER',
            'name' => 'Other Supplier',
            'status' => 'active',
        ]);

        $matchingRack = $this->createRack($warehouse, 100, 'MATCH');
        $matchingProduct = $this->createProduct($category, $unit, 'MATCH-001', 'Matching Product', 5, $supplier);
        ProductStock::create([
            'product_id' => $matchingProduct->id,
            'warehouse_id' => $warehouse->id,
            'current_stock' => 50,
            'reserved_stock' => 0,
        ]);
        RackStock::create([
            'rack_id' => $matchingRack->id,
            'product_id' => $matchingProduct->id,
            'quantity' => 50,
            'reserved_quantity' => 0,
            'last_updated_at' => now(),
        ]);

        $otherRack = $this->createRack($warehouse, 100, 'OTHER');
        $otherProduct = $this->createProduct($category, $otherUnit, 'OTHER-001', 'Other Product', 5, $otherSupplier);
        ProductStock::create([
            'product_id' => $otherProduct->id,
            'warehouse_id' => $warehouse->id,
            'current_stock' => 80,
            'reserved_stock' => 0,
        ]);
        RackStock::create([
            'rack_id' => $otherRack->id,
            'product_id' => $otherProduct->id,
            'quantity' => 80,
            'reserved_quantity' => 0,
            'last_updated_at' => now(),
        ]);

        $this->actingAs($staff)->get(route('inventory', [
            'unit_id' => $unit->id,
            'default_supplier_id' => $supplier->id,
            'min_percentage' => 40,
            'max_percentage' => 60,
        ]))
            ->assertOk()
            ->assertInertia(fn(Assert $page) => $page
                ->where('products.data.0.id', $matchingProduct->id)
                ->where('products.data.0.percentage', 50)
                ->where('products.total', 1)
            );
    }

    public function test_manager_can_update_inventory_product_from_spoofed_form_post(): void
    {
        $manager = $this->userWithRole('Manager');
        [, $category, $unit] = $this->inventoryFixture();
        $newCategory = Category::create([
            'name' => 'Updated Category',
            'description' => 'Updated product category',
        ]);
        $newUnit = Unit::create([
            'name' => 'Pack',
            'symbol' => 'pack',
        ]);
        $supplier = Supplier::create([
            'code' => 'SUP-UPDATE',
            'name' => 'Update Supplier',
            'status' => 'active',
        ]);
        $product = $this->createProduct($category, $unit, 'EDIT-001', 'Editable Product', 5);

        $this->actingAs($manager)
            ->post(route('inventory.update', $product), [
                '_method' => 'put',
                'sku' => 'EDIT-UPDATED',
                'name' => 'Updated Product Name',
                'category_id' => $newCategory->id,
                'unit_id' => $newUnit->id,
                'default_supplier_id' => $supplier->id,
                'purchase_price' => 2500,
                'selling_price' => 3500,
                'minimum_stock' => 12,
                'description' => 'Updated product description',
            ])
            ->assertRedirect(route('inventory.show', $product, absolute: false));

        $this->assertDatabaseHas('products', [
            'id' => $product->id,
            'sku' => 'EDIT-UPDATED',
            'name' => 'Updated Product Name',
            'category_id' => $newCategory->id,
            'unit_id' => $newUnit->id,
            'default_supplier_id' => $supplier->id,
            'minimum_stock' => 12,
            'description' => 'Updated product description',
        ]);

        $this->assertSame('2500.00', $product->fresh()->purchase_price);
        $this->assertSame('3500.00', $product->fresh()->selling_price);
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
     * @return array{0: Warehouse, 1: Category, 2: Unit}
     */
    private function inventoryFixture(): array
    {
        $warehouse = Warehouse::create([
            'code' => 'WH-FILTER',
            'name' => 'Filter Warehouse',
            'location' => 'Filter Location',
        ]);

        $category = Category::create([
            'name' => 'Filter Category',
            'description' => 'Inventory status filter fixture',
        ]);

        $unit = Unit::create([
            'name' => 'Unit',
            'symbol' => 'pcs',
        ]);

        return [$warehouse, $category, $unit];
    }

    private function createProduct(Category $category, Unit $unit, string $sku, string $name, int $minimumStock, ?Supplier $supplier = null): Product
    {
        return Product::create([
            'sku' => $sku,
            'name' => $name,
            'category_id' => $category->id,
            'unit_id' => $unit->id,
            'default_supplier_id' => $supplier?->id,
            'minimum_stock' => $minimumStock,
            'purchase_price' => 1000,
            'selling_price' => 1500,
            'is_active' => true,
        ]);
    }

    private function createRack(Warehouse $warehouse, int $capacity, string $code = 'FILTER'): Rack
    {
        $zone = WarehouseZone::create([
            'warehouse_id' => $warehouse->id,
            'code' => "Z-{$code}",
            'name' => "{$code} Zone",
            'capacity' => $capacity,
        ]);

        return Rack::create([
            'warehouse_zone_id' => $zone->id,
            'code' => "R-{$code}",
            'name' => "{$code} Rack",
            'capacity' => $capacity,
        ]);
    }
}
