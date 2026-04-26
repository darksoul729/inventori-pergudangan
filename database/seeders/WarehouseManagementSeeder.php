<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use App\Models\ProductStock;
use App\Models\Rack;
use App\Models\RackStock;
use App\Models\Supplier;
use App\Models\Unit;
use App\Models\User;
use App\Models\Warehouse;
use App\Models\WarehouseZone;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class WarehouseManagementSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::query()->where('email', 'admin@example.com')->firstOrFail();

        $warehouse = Warehouse::query()->updateOrCreate(
            ['code' => 'WH-SMD'],
            [
                'name' => 'Gudang Utama Samarinda',
                'location' => 'Samarinda, Kalimantan Timur',
                'description' => 'Gudang utama dan satu-satunya fasilitas penyimpanan di Samarinda, Kaltim. Melayani inbound, picking, cross-dock, dan outbound untuk seluruh wilayah Kalimantan dan pengiriman antar pulau.',
            ]
        );

        $unitPallet = Unit::query()->firstOrCreate(['symbol' => 'plt'], ['name' => 'Pallet']);
        $unitBox = Unit::query()->firstOrCreate(['symbol' => 'box'], ['name' => 'Box']);

        $categoryElectronics = Category::query()->firstOrCreate(
            ['name' => 'Electronics'],
            ['description' => 'Sensitive electronics inventory']
        );
        $categoryIndustrial = Category::query()->firstOrCreate(
            ['name' => 'Industrial Goods'],
            ['description' => 'Bulk and heavy goods']
        );
        $categoryChemical = Category::query()->firstOrCreate(
            ['name' => 'Chemical Supplies'],
            ['description' => 'Hazmat and regulated materials']
        );

        $supplierA = Supplier::query()->firstOrCreate(
            ['code' => 'SUP-AXIS'],
            [
                'name' => 'Axis Components',
                'contact_person' => 'Rina Putri',
                'phone' => '0811111111',
                'email' => 'procurement@axis.test',
                'city' => 'Samarinda',
                'status' => 'active',
            ]
        );

        $supplierB = Supplier::query()->firstOrCreate(
            ['code' => 'SUP-BULK'],
            [
                'name' => 'Bulkchain Manufacturing',
                'contact_person' => 'Andi Saputra',
                'phone' => '0822222222',
                'email' => 'sales@bulkchain.test',
                'city' => 'Balikpapan',
                'status' => 'active',
            ]
        );

        $products = collect([
            [
                'sku' => 'HP-AX900',
                'name' => 'AX900 Sensor Module',
                'category_id' => $categoryElectronics->id,
                'unit_id' => $unitBox->id,
                'default_supplier_id' => $supplierA->id,
                'minimum_stock' => 100,
                'purchase_price' => 120000,
                'selling_price' => 150000,
                'lead_time_days' => 5,
                'description' => 'Fast-moving pick item for sensor orders.',
            ],
            [
                'sku' => 'HP-CBL24',
                'name' => 'Industrial Cable 24m',
                'category_id' => $categoryIndustrial->id,
                'unit_id' => $unitBox->id,
                'default_supplier_id' => $supplierB->id,
                'minimum_stock' => 80,
                'purchase_price' => 45000,
                'selling_price' => 65000,
                'lead_time_days' => 7,
                'description' => 'High-pick outbound cable bundle.',
            ],
            [
                'sku' => 'BK-PLT55',
                'name' => 'Bulk Pallet Resin',
                'category_id' => $categoryIndustrial->id,
                'unit_id' => $unitPallet->id,
                'default_supplier_id' => $supplierB->id,
                'minimum_stock' => 40,
                'purchase_price' => 850000,
                'selling_price' => 950000,
                'lead_time_days' => 12,
                'description' => 'Large bulk storage material.',
            ],
            [
                'sku' => 'EL-PCB77',
                'name' => 'PCB Controller Board',
                'category_id' => $categoryElectronics->id,
                'unit_id' => $unitBox->id,
                'default_supplier_id' => $supplierA->id,
                'minimum_stock' => 70,
                'purchase_price' => 210000,
                'selling_price' => 280000,
                'lead_time_days' => 6,
                'description' => 'Electronics shelving item.',
            ],
            [
                'sku' => 'CD-DOCK1',
                'name' => 'Cross Dock Parcel',
                'category_id' => $categoryIndustrial->id,
                'unit_id' => $unitBox->id,
                'default_supplier_id' => $supplierB->id,
                'minimum_stock' => 20,
                'purchase_price' => 35000,
                'selling_price' => 50000,
                'lead_time_days' => 2,
                'description' => 'Short dwell-time cross dock parcel.',
            ],
            [
                'sku' => 'HZ-SOL88',
                'name' => 'Solvent Chemical Drum',
                'category_id' => $categoryChemical->id,
                'unit_id' => $unitPallet->id,
                'default_supplier_id' => $supplierA->id,
                'minimum_stock' => 15,
                'purchase_price' => 650000,
                'selling_price' => 780000,
                'lead_time_days' => 9,
                'description' => 'Hazmat inventory under strict storage rules.',
            ],
        ])->map(function (array $attributes) {
            return Product::query()->updateOrCreate(
                ['sku' => $attributes['sku']],
                array_merge($attributes, ['is_active' => true])
            );
        })->keyBy('sku');

        $zones = collect([
            ['code' => 'ZONE A', 'name' => 'Zone A', 'type' => 'high_pick', 'capacity' => 2700],
            ['code' => 'ZONE B', 'name' => 'Zone B', 'type' => 'bulk_storage', 'capacity' => 2500],
            ['code' => 'ZONE C', 'name' => 'Zone C', 'type' => 'electronics', 'capacity' => 2000],
            ['code' => 'ZONE D', 'name' => 'Zone D', 'type' => 'cross_dock', 'capacity' => 1500],
            ['code' => 'ZONE E', 'name' => 'Zone E', 'type' => 'hazmat', 'capacity' => 1000],
        ])->map(function (array $zone) use ($warehouse) {
            return WarehouseZone::query()->updateOrCreate(
                ['warehouse_id' => $warehouse->id, 'code' => $zone['code']],
                array_merge($zone, [
                    'is_active' => true,
                    'description' => $zone['name'].' operational zone',
                ])
            );
        })->keyBy('code');

        $racks = collect([
            ['zone' => 'ZONE A', 'code' => 'A1-A12', 'name' => 'Rack A1-A12', 'rack_type' => 'high_pick_area', 'capacity' => 1300, 'items' => [['HP-AX900', 680], ['HP-CBL24', 560]]],
            ['zone' => 'ZONE A', 'code' => 'A13-A24', 'name' => 'Rack A13-A24', 'rack_type' => 'high_pick_area', 'capacity' => 1400, 'items' => [['HP-AX900', 520], ['HP-CBL24', 660], ['EL-PCB77', 150]]],
            ['zone' => 'ZONE B', 'code' => 'B-BULK', 'name' => 'Zone B Bulk', 'rack_type' => 'large_pallets', 'capacity' => 2500, 'items' => [['BK-PLT55', 1125]]],
            ['zone' => 'ZONE C', 'code' => 'C-SHELF', 'name' => 'Zone C Shelving', 'rack_type' => 'electronics_bin', 'capacity' => 2000, 'items' => [['EL-PCB77', 980], ['HP-AX900', 380]]],
            ['zone' => 'ZONE D', 'code' => 'D-DOCK', 'name' => 'Zone D Dock Lane', 'rack_type' => 'cross_dock_lane', 'capacity' => 1500, 'items' => [['CD-DOCK1', 225]]],
            ['zone' => 'ZONE E', 'code' => 'E-HAZ1', 'name' => 'Zone E Hazmat Bay', 'rack_type' => 'hazmat_cage', 'capacity' => 1000, 'items' => [['HZ-SOL88', 820]]],
        ])->map(function (array $rackData) use ($zones) {
            return Rack::query()->updateOrCreate(
                [
                    'warehouse_zone_id' => $zones[$rackData['zone']]->id,
                    'code' => $rackData['code'],
                ],
                [
                    'name' => $rackData['name'],
                    'rack_type' => $rackData['rack_type'],
                    'capacity' => $rackData['capacity'],
                    'status' => 'active',
                    'notes' => $rackData['name'].' seeded for warehouse dashboard.',
                ]
            );
        });

        foreach ($racks as $index => $rack) {
            $items = collect([
                ['rack_code' => 'A1-A12', 'sku' => 'HP-AX900', 'quantity' => 680, 'reserved' => 95],
                ['rack_code' => 'A1-A12', 'sku' => 'HP-CBL24', 'quantity' => 560, 'reserved' => 70],
                ['rack_code' => 'A13-A24', 'sku' => 'HP-AX900', 'quantity' => 520, 'reserved' => 80],
                ['rack_code' => 'A13-A24', 'sku' => 'HP-CBL24', 'quantity' => 660, 'reserved' => 88],
                ['rack_code' => 'A13-A24', 'sku' => 'EL-PCB77', 'quantity' => 150, 'reserved' => 20],
                ['rack_code' => 'B-BULK', 'sku' => 'BK-PLT55', 'quantity' => 1125, 'reserved' => 120],
                ['rack_code' => 'C-SHELF', 'sku' => 'EL-PCB77', 'quantity' => 980, 'reserved' => 120],
                ['rack_code' => 'C-SHELF', 'sku' => 'HP-AX900', 'quantity' => 380, 'reserved' => 55],
                ['rack_code' => 'D-DOCK', 'sku' => 'CD-DOCK1', 'quantity' => 225, 'reserved' => 15],
                ['rack_code' => 'E-HAZ1', 'sku' => 'HZ-SOL88', 'quantity' => 820, 'reserved' => 60],
            ])->where('rack_code', $rack->code);

            foreach ($items as $item) {
                RackStock::query()->updateOrCreate(
                    ['rack_id' => $rack->id, 'product_id' => $products[$item['sku']]->id],
                    [
                        'quantity' => $item['quantity'],
                        'reserved_quantity' => $item['reserved'],
                        'batch_number' => 'BATCH-'.str_replace('-', '', $rack->code),
                        'expired_date' => str_starts_with($item['sku'], 'HZ-') ? now()->addMonths(8)->toDateString() : null,
                        'last_updated_at' => now(),
                    ]
                );
            }
        }

        $aggregatedStocks = RackStock::query()
            ->selectRaw('product_id, SUM(quantity) as total_quantity, SUM(reserved_quantity) as total_reserved')
            ->whereIn('rack_id', Rack::query()->pluck('id'))
            ->groupBy('product_id')
            ->get();

        foreach ($aggregatedStocks as $stock) {
            ProductStock::query()->updateOrCreate(
                ['product_id' => $stock->product_id, 'warehouse_id' => $warehouse->id],
                [
                    'current_stock' => $stock->total_quantity,
                    'reserved_stock' => $stock->total_reserved,
                    'last_updated_at' => now(),
                ]
            );
        }

        $customerId = DB::table('customers')->updateOrInsert(
            ['code' => 'CUST-OPS'],
            [
                'name' => 'PT Operasi Nusantara',
                'contact_person' => 'Budi Kalla',
                'phone' => '0833333333',
                'email' => 'warehouse@ops.test',
                'address' => 'Jl. P. Diponegoro, Samarinda',
                'updated_at' => now(),
                'created_at' => now(),
            ]
        );

        $purchaseOrderId = DB::table('purchase_orders')->updateOrInsert(
            ['po_number' => 'PO-2026-0411-01'],
            [
                'supplier_id' => $supplierA->id,
                'warehouse_id' => $warehouse->id,
                'order_date' => now()->subDays(4)->toDateString(),
                'expected_date' => now()->addDays(2)->toDateString(),
                'status' => 'approved',
                'notes' => 'Restock high-pick electronics',
                'created_by' => $admin->id,
                'approved_by' => $admin->id,
                'updated_at' => now(),
                'created_at' => now(),
            ]
        );

        DB::table('goods_receipts')->updateOrInsert(
            ['receipt_number' => 'GR-2026-0411-01'],
            [
                'purchase_order_id' => DB::table('purchase_orders')->where('po_number', 'PO-2026-0411-01')->value('id'),
                'supplier_id' => $supplierA->id,
                'warehouse_id' => $warehouse->id,
                'receipt_date' => now()->subDays(1)->toDateString(),
                'status' => 'received',
                'notes' => 'Inbound completed at Rack A1-A12',
                'created_by' => $admin->id,
                'updated_at' => now(),
                'created_at' => now(),
            ]
        );

        DB::table('stock_outs')->updateOrInsert(
            ['stock_out_number' => 'SO-2026-0411-01'],
            [
                'warehouse_id' => $warehouse->id,
                'customer_id' => DB::table('customers')->where('code', 'CUST-OPS')->value('id'),
                'out_date' => now()->subDay()->toDateString(),
                'purpose' => 'delivery',
                'status' => 'completed',
                'notes' => 'Outbound from high-pick racks',
                'created_by' => $admin->id,
                'updated_at' => now(),
                'created_at' => now(),
            ]
        );

        $movements = [
            ['sku' => 'HP-AX900', 'type' => 'in', 'reference_type' => 'dock_04', 'reference_id' => 1, 'quantity' => 240, 'before' => 960, 'after' => 1200, 'date' => now()->subHours(6), 'notes' => 'Loading complete to Rack A1-A12'],
            ['sku' => 'EL-PCB77', 'type' => 'transfer', 'reference_type' => 'zone_c_04', 'reference_id' => 2, 'quantity' => 120, 'before' => 860, 'after' => 980, 'date' => now()->subHours(5)->addMinutes(12), 'notes' => 'Stowing complete on electronics shelving'],
            ['sku' => 'HP-CBL24', 'type' => 'out', 'reference_type' => 'zone_a_12', 'reference_id' => 3, 'quantity' => 84, 'before' => 1304, 'after' => 1220, 'date' => now()->subHours(4)->addMinutes(5), 'notes' => 'Picking complete for outbound order #9841'],
            ['sku' => 'HZ-SOL88', 'type' => 'opname', 'reference_type' => 'zone_e_all', 'reference_id' => 4, 'quantity' => 820, 'before' => 820, 'after' => 820, 'date' => now()->subHours(3)->addMinutes(30), 'notes' => 'Safety check complete for hazmat bay'],
            ['sku' => 'CD-DOCK1', 'type' => 'adjustment', 'reference_type' => 'dock_lane', 'reference_id' => 5, 'quantity' => 12, 'before' => 213, 'after' => 225, 'date' => now()->subHours(2), 'notes' => 'Cross dock recount closed with variance adjustment'],
        ];

        foreach ($movements as $movement) {
            DB::table('stock_movements')->updateOrInsert(
                [
                    'product_id' => $products[$movement['sku']]->id,
                    'warehouse_id' => $warehouse->id,
                    'reference_type' => $movement['reference_type'],
                    'reference_id' => $movement['reference_id'],
                ],
                [
                    'movement_type' => $movement['type'],
                    'quantity' => $movement['quantity'],
                    'stock_before' => $movement['before'],
                    'stock_after' => $movement['after'],
                    'movement_date' => $movement['date'],
                    'notes' => $movement['notes'],
                    'created_by' => $admin->id,
                    'updated_at' => now(),
                    'created_at' => now(),
                ]
            );
        }
    }
}
