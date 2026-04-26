<?php

namespace Tests\Feature;

use App\Models\Customer;
use App\Models\Driver;
use App\Models\Product;
use App\Models\ProductStock;
use App\Models\Shipment;
use App\Models\StockMovement;
use App\Models\StockOut;
use App\Models\User;
use App\Models\Warehouse;
use App\Models\Role;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class ShipmentStockTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // Seed minimal required data
        $this->seed(\DatabaseSeeder::class);
    }

    public function test_reserve_stock_on_shipment_create(): void
    {
        $manager = User::whereHas('role', fn($q) => $q->where('name', 'like', '%anager%')->orWhere('name', 'like', '%Admin Gudang%'))->first();
        $this->actingAs($manager);

        $product = Product::first();
        $warehouse = Warehouse::first();

        $productStock = ProductStock::where('product_id', $product->id)
            ->where('warehouse_id', $warehouse->id)
            ->first();

        $initialReserved = $productStock->reserved_stock;
        $initialCurrent = $productStock->current_stock;

        $response = $this->post(route('shipments.store'), [
            'shipment_id' => 'TRK-TEST-' . rand(1000, 9999),
            'origin' => 'samarinda',
            'origin_name' => 'Gudang Utama Samarinda',
            'destination' => '-6.9175,106.8311',
            'destination_name' => 'Jakarta Test',
            'status' => 'on-time',
            'estimated_arrival' => now()->addDays(3)->format('Y-m-d\TH:i'),
            'load_type' => 'ground',
            'driver_id' => null,
            'items' => [
                [
                    'product_id' => $product->id,
                    'product_name' => $product->name,
                    'sku' => $product->sku,
                    'quantity' => 5,
                    'unit' => 'pcs',
                ],
            ],
        ]);

        $response->assertRedirect();

        $productStock->refresh();
        $this->assertEquals($initialReserved + 5, $productStock->reserved_stock, 'Reserved stock should increase by 5');
        $this->assertEquals($initialCurrent, $productStock->current_stock, 'Current stock should not change on create');
    }

    public function test_deduct_stock_on_shipment_delivered(): void
    {
        $manager = User::whereHas('role', fn($q) => $q->where('name', 'like', '%anager%')->orWhere('name', 'like', '%Admin Gudang%'))->first();
        $this->actingAs($manager);

        $product = Product::first();
        $warehouse = Warehouse::first();

        // Create a shipment first
        $shipment = Shipment::create([
            'shipment_id' => 'TRK-DEDUCT-' . rand(1000, 9999),
            'origin' => 'samarinda',
            'origin_name' => 'Gudang Utama Samarinda',
            'destination' => '-6.9175,106.8311',
            'destination_name' => 'Jakarta Deduct Test',
            'status' => 'on-time',
            'estimated_arrival' => now()->addDays(3),
            'load_type' => 'ground',
            'tracking_stage' => 'ready_for_pickup',
        ]);

        $shipment->items()->create([
            'product_id' => $product->id,
            'product_name' => $product->name,
            'sku' => $product->sku,
            'quantity' => 10,
            'unit' => 'pcs',
        ]);

        // Manually reserve stock (simulating what store does)
        ProductStock::where('product_id', $product->id)
            ->where('warehouse_id', $warehouse->id)
            ->increment('reserved_stock', 10);

        $productStock = ProductStock::where('product_id', $product->id)
            ->where('warehouse_id', $warehouse->id)
            ->first();

        $initialCurrent = $productStock->current_stock;
        $initialReserved = $productStock->reserved_stock;

        // Mark as delivered
        $response = $this->put(route('shipments.update-status', $shipment), [
            'status' => 'delivered',
        ]);

        $response->assertRedirect();

        $productStock->refresh();
        $this->assertEquals($initialCurrent - 10, $productStock->current_stock, 'Current stock should decrease by 10');

        // Verify StockOut was created
        $this->assertGreaterThan(0, StockOut::where('purpose', 'shipment')->count(), 'StockOut document should be created');

        // Verify StockMovement was recorded
        $this->assertGreaterThan(0, StockMovement::where('reference_type', 'stock_out')
            ->where('product_id', $product->id)
            ->where('movement_type', 'out')
            ->count(), 'StockMovement should be recorded');
    }

    public function test_release_stock_on_shipment_delete(): void
    {
        $manager = User::whereHas('role', fn($q) => $q->where('name', 'like', '%anager%')->orWhere('name', 'like', '%Admin Gudang%'))->first();
        $this->actingAs($manager);

        $product = Product::first();
        $warehouse = Warehouse::first();

        // Create a shipment with reserved stock
        $shipment = Shipment::create([
            'shipment_id' => 'TRK-DEL-' . rand(1000, 9999),
            'origin' => 'samarinda',
            'origin_name' => 'Gudang Utama Samarinda',
            'destination' => '-6.9175,106.8311',
            'destination_name' => 'Jakarta Delete Test',
            'status' => 'on-time',
            'estimated_arrival' => now()->addDays(3),
            'load_type' => 'ground',
            'tracking_stage' => 'ready_for_pickup',
        ]);

        $shipment->items()->create([
            'product_id' => $product->id,
            'product_name' => $product->name,
            'sku' => $product->sku,
            'quantity' => 8,
            'unit' => 'pcs',
        ]);

        ProductStock::where('product_id', $product->id)
            ->where('warehouse_id', $warehouse->id)
            ->increment('reserved_stock', 8);

        $productStock = ProductStock::where('product_id', $product->id)
            ->where('warehouse_id', $warehouse->id)
            ->first();

        $initialReserved = $productStock->reserved_stock;

        // Delete shipment
        $response = $this->delete(route('shipments.destroy', $shipment));
        $response->assertRedirect();

        $productStock->refresh();
        $this->assertEquals($initialReserved - 8, $productStock->reserved_stock, 'Reserved stock should decrease by 8 on delete');
    }

    public function test_cannot_set_delivered_via_update(): void
    {
        $manager = User::whereHas('role', fn($q) => $q->where('name', 'like', '%anager%')->orWhere('name', 'like', '%Admin Gudang%'))->first();
        $this->actingAs($manager);

        $shipment = Shipment::where('status', '!=', 'delivered')->first();
        if (!$shipment) {
            $this->markTestSkipped('No non-delivered shipment found');
        }

        $response = $this->put(route('shipments.update', $shipment), [
            'origin' => $shipment->origin,
            'origin_name' => $shipment->origin_name,
            'destination' => $shipment->destination,
            'destination_name' => $shipment->destination_name,
            'status' => 'delivered',
            'estimated_arrival' => $shipment->estimated_arrival?->format('Y-m-d\TH:i'),
            'load_type' => $shipment->load_type,
            'driver_id' => $shipment->driver_id,
            'items' => [],
        ]);

        $response->assertSessionHasErrors('status');
    }
}
