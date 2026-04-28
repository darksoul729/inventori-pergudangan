<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Driver;
use App\Models\Product;
use App\Models\ProductStock;
use App\Models\Rack;
use App\Models\RackStock;
use App\Models\Role;
use App\Models\Shipment;
use App\Models\Supplier;
use App\Models\Unit;
use App\Models\User;
use App\Models\Warehouse;
use App\Models\WarehouseZone;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class ProfessionalCompleteSeeder extends Seeder
{
    public function run(): void
    {
        DB::transaction(function () {
            $now = now();

            $roles = $this->seedRoles($now);
            $users = $this->seedUsersAndDrivers($roles);
            [$warehouse, $zones, $racks] = $this->seedWarehouseStructure();
            [$categories, $units, $suppliers, $customers] = $this->seedMasterData($now);
            $products = $this->seedProducts($categories, $units, $suppliers);

            $this->seedRackAndProductStocks($warehouse, $racks, $products);
            $this->seedSupplierPerformances($suppliers, $now);
            $this->seedShipments($products, $users['drivers']);
        });
    }

    private function seedRoles($now): array
    {
        $items = [
            ['name' => 'Manager', 'description' => 'Akses penuh operasional gudang, persetujuan, dan monitoring kinerja'],
            ['name' => 'Supervisor', 'description' => 'Koordinasi operasional shift, validasi transaksi, laporan, dan approval harian gudang'],
            ['name' => 'Staff', 'description' => 'Operasional harian gudang dengan akses terbatas sesuai tugas'],
            ['name' => 'Driver', 'description' => 'Melakukan pengiriman dan update lokasi'],
        ];

        $roles = [];
        foreach ($items as $item) {
            $roles[$item['name']] = Role::query()->updateOrCreate(
                ['name' => $item['name']],
                ['description' => $item['description'], 'updated_at' => $now]
            );
        }

        return $roles;
    }

    private function seedUsersAndDrivers(array $roles): array
    {
        $manager = User::query()->updateOrCreate(
            ['email' => 'manajer.gudang@petayu.co.id'],
            [
                'role_id' => $roles['Manager']->id,
                'name' => 'Rizky Pratama',
                'email_verified_at' => now(),
                'password' => Hash::make('password'),
                'phone' => '081251110001',
                'status' => 'active',
            ]
        );

        $supervisor = User::query()->updateOrCreate(
            ['email' => 'supervisor.operasional@petayu.co.id'],
            [
                'role_id' => $roles['Supervisor']->id,
                'name' => 'Dewi Anggraini',
                'email_verified_at' => now(),
                'password' => Hash::make('password'),
                'phone' => '081251110002',
                'status' => 'active',
            ]
        );

        $staff = User::query()->updateOrCreate(
            ['email' => 'staff.gudang@petayu.co.id'],
            [
                'role_id' => $roles['Staff']->id,
                'name' => 'Fajar Hidayat',
                'email_verified_at' => now(),
                'password' => Hash::make('password'),
                'phone' => '081251110003',
                'status' => 'active',
            ]
        );

        $driverSeed = [
            ['email' => 'ahmad.nur.driver@petayu.co.id', 'name' => 'Ahmad Nurdin', 'license' => 'KT-12345-AB', 'phone' => '081251220001'],
            ['email' => 'budi.santoso.driver@petayu.co.id', 'name' => 'Budi Santoso', 'license' => 'KT-67890-CD', 'phone' => '081251220002'],
            ['email' => 'andi.prakoso.driver@petayu.co.id', 'name' => 'Andi Prakoso', 'license' => 'KT-11223-EF', 'phone' => '081251220003'],
            ['email' => 'citra.lestari.driver@petayu.co.id', 'name' => 'Citra Lestari', 'license' => 'KT-44556-GH', 'phone' => '081251220004'],
            ['email' => 'eko.wibowo.driver@petayu.co.id', 'name' => 'Eko Wibowo', 'license' => 'KT-77889-IJ', 'phone' => '081251220005'],
        ];

        $drivers = collect();
        foreach ($driverSeed as $item) {
            $user = User::query()->updateOrCreate(
                ['email' => $item['email']],
                [
                    'role_id' => $roles['Driver']->id,
                    'name' => $item['name'],
                    'email_verified_at' => now(),
                    'password' => Hash::make('password'),
                    'phone' => $item['phone'],
                    'status' => 'active',
                ]
            );

            $driver = Driver::query()->updateOrCreate(
                ['user_id' => $user->id],
                [
                    'license_number' => $item['license'],
                    'phone' => $item['phone'],
                    'status' => 'approved',
                    'is_active' => true,
                    'latitude' => null,
                    'longitude' => null,
                    'last_location_mock' => false,
                ]
            );

            $drivers->push($driver);
        }

        return [
            'manager' => $manager,
            'supervisor' => $supervisor,
            'staff' => $staff,
            'drivers' => $drivers,
        ];
    }

    private function seedMasterData($now): array
    {
        $units = [];
        foreach ([
            ['name' => 'Pallet', 'symbol' => 'plt'],
            ['name' => 'Box', 'symbol' => 'box'],
            ['name' => 'Batang', 'symbol' => 'btg'],
            ['name' => 'Unit', 'symbol' => 'unit'],
            ['name' => 'Kilogram', 'symbol' => 'kg'],
        ] as $item) {
            $units[$item['symbol']] = Unit::query()->updateOrCreate(
                ['symbol' => $item['symbol']],
                ['name' => $item['name'], 'updated_at' => $now]
            );
        }

        $categories = [];
        foreach ([
            ['name' => 'Elektronik', 'description' => 'Inventaris elektronik sensitif'],
            ['name' => 'Barang Industri', 'description' => 'Barang curah dan berbobot berat'],
            ['name' => 'Bahan Kimia', 'description' => 'Material hazmat dan bahan terkontrol'],
            ['name' => 'Kayu / Bahan Baku', 'description' => 'Inventori material kayu'],
            ['name' => 'Packaging', 'description' => 'Kemasan, karton, dan material pengepakan'],
        ] as $item) {
            $categories[$item['name']] = Category::query()->updateOrCreate(
                ['name' => $item['name']],
                ['description' => $item['description'], 'updated_at' => $now]
            );
        }

        $suppliers = [];
        foreach ([
            ['code' => 'SUP-AXIS', 'name' => 'PT Komponen Axis Nusantara', 'contact_person' => 'Rina Putri', 'phone' => '081155550100', 'email' => 'pengadaan@axis.test', 'city' => 'Samarinda', 'category' => 'Elektronik', 'status' => 'active', 'address' => 'Jl. PM Noor No. 12'],
            ['code' => 'SUP-BULK', 'name' => 'PT Manufaktur Bulkchain', 'contact_person' => 'Andi Saputra', 'phone' => '082155550101', 'email' => 'penjualan@bulkchain.test', 'city' => 'Balikpapan', 'category' => 'Industri', 'status' => 'active', 'address' => 'Jl. Soekarno Hatta Km. 9'],
            ['code' => 'SUP-KAYU', 'name' => 'PT Kayu Lestari Timur', 'contact_person' => 'Bagus Hartono', 'phone' => '083155550102', 'email' => 'order@kayulestari.test', 'city' => 'Samarinda', 'category' => 'Kayu', 'status' => 'active', 'address' => 'Jl. Poros Samarinda-Bontang'],
        ] as $item) {
            $suppliers[$item['code']] = Supplier::query()->updateOrCreate(
                ['code' => $item['code']],
                array_merge($item, ['updated_at' => $now])
            );
        }

        $customers = [];
        foreach ([
            ['code' => 'CUST-OPS', 'name' => 'PT Operasi Nusantara', 'contact_person' => 'Budi Kalla', 'phone' => '083188880201', 'email' => 'warehouse@ops.test', 'address' => 'Jl. P. Diponegoro, Samarinda'],
            ['code' => 'CUST-RTL', 'name' => 'PT Ritel Modern Nusantara', 'contact_person' => 'Tim Rantai Pasok', 'phone' => '0215550404', 'email' => 'scm@ritelnusantara.co.id', 'address' => 'Jl. Gatot Subroto No. 90, Jakarta'],
        ] as $item) {
            DB::table('customers')->updateOrInsert(
                ['code' => $item['code']],
                array_merge($item, ['updated_at' => $now, 'created_at' => $now])
            );
            $customers[$item['code']] = DB::table('customers')->where('code', $item['code'])->first();
        }

        return [$categories, $units, $suppliers, $customers];
    }

    private function seedWarehouseStructure(): array
    {
        $warehouse = Warehouse::query()->updateOrCreate(
            ['code' => 'WH-SMD'],
            [
                'name' => 'Gudang Utama Samarinda',
                'location' => 'Samarinda, Kalimantan Timur',
                'description' => 'Gudang utama dan satu-satunya fasilitas penyimpanan di Samarinda, Kaltim.',
            ]
        );

        $zoneDefs = [
            ['code' => 'ZONE A', 'name' => 'Zona A', 'type' => 'high_pick', 'capacity' => 2700],
            ['code' => 'ZONE B', 'name' => 'Zona B', 'type' => 'bulk_storage', 'capacity' => 2500],
            ['code' => 'ZONE C', 'name' => 'Zona C', 'type' => 'electronics', 'capacity' => 2000],
            ['code' => 'ZONE D', 'name' => 'Zona D', 'type' => 'cross_dock', 'capacity' => 1500],
            ['code' => 'ZONE E', 'name' => 'Zona E', 'type' => 'hazmat', 'capacity' => 1000],
        ];

        $zones = [];
        foreach ($zoneDefs as $zone) {
            $zones[$zone['code']] = WarehouseZone::query()->updateOrCreate(
                ['warehouse_id' => $warehouse->id, 'code' => $zone['code']],
                array_merge($zone, ['is_active' => true, 'description' => $zone['name'].' area operasional'])
            );
        }

        $rackDefs = [
            ['zone' => 'ZONE A', 'code' => 'A1-A12', 'name' => 'Rak A1-A12', 'rack_type' => 'high_pick_area', 'capacity' => 1300],
            ['zone' => 'ZONE A', 'code' => 'A13-A24', 'name' => 'Rak A13-A24', 'rack_type' => 'high_pick_area', 'capacity' => 1400],
            ['zone' => 'ZONE B', 'code' => 'B-BULK', 'name' => 'Rak Curah Zona B', 'rack_type' => 'large_pallets', 'capacity' => 2500],
            ['zone' => 'ZONE C', 'code' => 'C-SHELF', 'name' => 'Rak Shelving Zona C', 'rack_type' => 'electronics_bin', 'capacity' => 2000],
            ['zone' => 'ZONE D', 'code' => 'D-DOCK', 'name' => 'Lajur Dock Zona D', 'rack_type' => 'cross_dock_lane', 'capacity' => 1500],
            ['zone' => 'ZONE E', 'code' => 'E-HAZ1', 'name' => 'Rak Hazmat Zona E', 'rack_type' => 'hazmat_cage', 'capacity' => 1000],
        ];

        $racks = [];
        foreach ($rackDefs as $rack) {
            $racks[$rack['code']] = Rack::query()->updateOrCreate(
                ['warehouse_zone_id' => $zones[$rack['zone']]->id, 'code' => $rack['code']],
                [
                    'name' => $rack['name'],
                    'rack_type' => $rack['rack_type'],
                    'capacity' => $rack['capacity'],
                    'status' => 'active',
                    'notes' => $rack['name'].' data awal operasional.',
                ]
            );
        }

        return [$warehouse, $zones, $racks];
    }

    private function seedProducts(array $categories, array $units, array $suppliers): array
    {
        $defs = [
            ['sku' => 'HP-AX900', 'barcode' => 'HP-AX900', 'name' => 'Modul Sensor AX900', 'category' => 'Elektronik', 'unit' => 'box', 'supplier' => 'SUP-AXIS', 'minimum_stock' => 100, 'max_stock' => 2500, 'purchase_price' => 120000, 'selling_price' => 150000, 'lead_time_days' => 5, 'description' => 'Produk cepat keluar untuk pesanan sensor.'],
            ['sku' => 'HP-CBL24', 'barcode' => 'HP-CBL24', 'name' => 'Kabel Industri 24m', 'category' => 'Barang Industri', 'unit' => 'box', 'supplier' => 'SUP-BULK', 'minimum_stock' => 80, 'max_stock' => 2500, 'purchase_price' => 45000, 'selling_price' => 65000, 'lead_time_days' => 7, 'description' => 'Item outbound frekuensi tinggi untuk kebutuhan kabel.'],
            ['sku' => 'BK-PLT55', 'barcode' => 'BK-PLT55', 'name' => 'Resin Curah Pallet', 'category' => 'Barang Industri', 'unit' => 'plt', 'supplier' => 'SUP-BULK', 'minimum_stock' => 40, 'max_stock' => 2500, 'purchase_price' => 850000, 'selling_price' => 950000, 'lead_time_days' => 12, 'description' => 'Material curah untuk penyimpanan kapasitas besar.'],
            ['sku' => 'EL-PCB77', 'barcode' => 'EL-PCB77', 'name' => 'Papan Kontrol PCB', 'category' => 'Elektronik', 'unit' => 'box', 'supplier' => 'SUP-AXIS', 'minimum_stock' => 70, 'max_stock' => 2500, 'purchase_price' => 210000, 'selling_price' => 280000, 'lead_time_days' => 6, 'description' => 'Komponen elektronik untuk rak shelving.'],
            ['sku' => 'CD-DOCK1', 'barcode' => 'CD-DOCK1', 'name' => 'Paket Cross Dock', 'category' => 'Barang Industri', 'unit' => 'box', 'supplier' => 'SUP-BULK', 'minimum_stock' => 20, 'max_stock' => 2500, 'purchase_price' => 35000, 'selling_price' => 50000, 'lead_time_days' => 2, 'description' => 'Barang transit cross dock dengan waktu singgah pendek.'],
            ['sku' => 'HZ-SOL88', 'barcode' => 'HZ-SOL88', 'name' => 'Drum Kimia Solvent', 'category' => 'Bahan Kimia', 'unit' => 'plt', 'supplier' => 'SUP-AXIS', 'minimum_stock' => 15, 'max_stock' => 2500, 'purchase_price' => 650000, 'selling_price' => 780000, 'lead_time_days' => 9, 'description' => 'Material hazmat dengan aturan penyimpanan khusus.'],
            ['sku' => 'ULIN-E46-4000x50x25', 'barcode' => 'ULIN-E46-4000x50x25', 'name' => 'KAYU ULIN 4M x 5CM x 2.5CM', 'category' => 'Kayu / Bahan Baku', 'unit' => 'btg', 'supplier' => 'SUP-KAYU', 'minimum_stock' => 30, 'max_stock' => 1500, 'purchase_price' => 185000, 'selling_price' => 250000, 'lead_time_days' => 3, 'description' => 'Volume auto 0.005000 m3 per batang.', 'volume_entry_mode' => 'auto', 'dimension_unit' => 'mm', 'dimension_length' => 4000, 'dimension_width' => 50, 'dimension_height' => 25, 'volume_m3_per_unit' => 0.005],
            ['sku' => 'MERANTI-M02-MANUAL', 'barcode' => 'MERANTI-M02-MANUAL', 'name' => 'KAYU MERANTI 4M (INPUT MANUAL)', 'category' => 'Kayu / Bahan Baku', 'unit' => 'btg', 'supplier' => 'SUP-KAYU', 'minimum_stock' => 20, 'max_stock' => 1200, 'purchase_price' => 145000, 'selling_price' => 205000, 'lead_time_days' => 3, 'description' => 'Volume manual 0.005000 m3 per batang.', 'volume_entry_mode' => 'manual', 'volume_m3_per_unit' => 0.005],
        ];

        $products = [];
        foreach ($defs as $def) {
            $products[$def['sku']] = Product::query()->updateOrCreate(
                ['sku' => $def['sku']],
                [
                    'barcode' => $def['barcode'] ?? null,
                    'name' => $def['name'],
                    'category_id' => $categories[$def['category']]->id,
                    'unit_id' => $units[$def['unit']]->id,
                    'default_supplier_id' => $suppliers[$def['supplier']]->id,
                    'minimum_stock' => $def['minimum_stock'],
                    'max_stock' => $def['max_stock'],
                    'purchase_price' => $def['purchase_price'],
                    'selling_price' => $def['selling_price'],
                    'lead_time_days' => $def['lead_time_days'],
                    'is_active' => true,
                    'description' => $def['description'] ?? null,
                    'volume_entry_mode' => $def['volume_entry_mode'] ?? 'none',
                    'dimension_unit' => $def['dimension_unit'] ?? null,
                    'dimension_length' => $def['dimension_length'] ?? null,
                    'dimension_width' => $def['dimension_width'] ?? null,
                    'dimension_height' => $def['dimension_height'] ?? null,
                    'volume_m3_per_unit' => $def['volume_m3_per_unit'] ?? null,
                ]
            );
        }

        return $products;
    }

    private function seedRackAndProductStocks(Warehouse $warehouse, array $racks, array $products): void
    {
        $rackStocks = [
            ['rack' => 'A1-A12', 'sku' => 'HP-AX900', 'quantity' => 680, 'reserved' => 95],
            ['rack' => 'A1-A12', 'sku' => 'HP-CBL24', 'quantity' => 560, 'reserved' => 70],
            ['rack' => 'A13-A24', 'sku' => 'HP-AX900', 'quantity' => 520, 'reserved' => 80],
            ['rack' => 'A13-A24', 'sku' => 'HP-CBL24', 'quantity' => 660, 'reserved' => 88],
            ['rack' => 'A13-A24', 'sku' => 'EL-PCB77', 'quantity' => 150, 'reserved' => 20],
            ['rack' => 'B-BULK', 'sku' => 'BK-PLT55', 'quantity' => 1125, 'reserved' => 120],
            ['rack' => 'C-SHELF', 'sku' => 'EL-PCB77', 'quantity' => 980, 'reserved' => 120],
            ['rack' => 'C-SHELF', 'sku' => 'HP-AX900', 'quantity' => 380, 'reserved' => 55],
            ['rack' => 'D-DOCK', 'sku' => 'CD-DOCK1', 'quantity' => 225, 'reserved' => 15],
            ['rack' => 'E-HAZ1', 'sku' => 'HZ-SOL88', 'quantity' => 820, 'reserved' => 60],
        ];

        foreach ($rackStocks as $item) {
            RackStock::query()->updateOrCreate(
                [
                    'rack_id' => $racks[$item['rack']]->id,
                    'product_id' => $products[$item['sku']]->id,
                ],
                [
                    'quantity' => $item['quantity'],
                    'reserved_quantity' => $item['reserved'],
                    'batch_number' => 'BATCH-'.str_replace('-', '', $item['rack']),
                    'expired_date' => str_starts_with($item['sku'], 'HZ-') ? now()->addMonths(8)->toDateString() : null,
                    'last_updated_at' => now(),
                ]
            );
        }

        foreach (Product::query()->pluck('id') as $productId) {
            $agg = RackStock::query()
                ->where('product_id', $productId)
                ->selectRaw('COALESCE(SUM(quantity),0) as qty, COALESCE(SUM(reserved_quantity),0) as res')
                ->first();

            ProductStock::query()->updateOrCreate(
                ['product_id' => $productId, 'warehouse_id' => $warehouse->id],
                [
                    'current_stock' => (int) ($agg->qty ?? 0),
                    'reserved_stock' => (int) ($agg->res ?? 0),
                    'rack_stock' => (int) ($agg->qty ?? 0),
                    'last_updated_at' => now(),
                ]
            );
        }
    }

    private function seedSupplierPerformances(array $suppliers, $now): void
    {
        $months = [];
        for ($i = 4; $i >= 0; $i--) {
            $months[] = now()->subMonths($i);
        }

        $performanceMap = [
            'SUP-AXIS' => [
                [90, 80, 10, 2.8, 88],
                [95, 88, 7, 3.0, 91],
                [105, 100, 5, 3.1, 94],
                [100, 93, 7, 2.6, 93],
                [120, 118, 2, 2.1, 96],
            ],
            'SUP-BULK' => [
                [70, 55, 15, 3.9, 78],
                [75, 55, 20, 4.0, 73],
                [85, 65, 20, 4.5, 76],
                [80, 60, 20, 4.2, 75],
                [90, 75, 15, 3.4, 78],
            ],
            'SUP-KAYU' => [
                [80, 70, 10, 3.7, 82],
                [85, 75, 10, 3.5, 84],
                [88, 79, 9, 3.3, 86],
                [92, 85, 7, 3.2, 88],
                [95, 90, 5, 3.0, 91],
            ],
        ];

        foreach ($suppliers as $code => $supplier) {
            DB::table('supplier_performances')->where('supplier_id', $supplier->id)->delete();

            foreach ($performanceMap[$code] as $idx => $row) {
                DB::table('supplier_performances')->insert([
                    'supplier_id' => $supplier->id,
                    'period_month' => $months[$idx]->month,
                    'period_year' => $months[$idx]->year,
                    'total_orders' => $row[0],
                    'on_time_deliveries' => $row[1],
                    'late_deliveries' => $row[2],
                    'avg_lead_time_days' => $row[3],
                    'performance_score' => $row[4],
                    'created_at' => $now,
                    'updated_at' => $now,
                ]);
            }
        }
    }

    private function seedShipments(array $products, $drivers): void
    {
        $shipments = [
            ['shipment_id' => 'TRK-10293', 'origin' => 'SMD', 'origin_name' => 'Gudang Samarinda, Kaltim', 'destination' => 'BPN', 'destination_name' => 'Balikpapan, Kaltim', 'status' => 'in-transit', 'estimated_arrival' => now()->addHours(6)->setMinutes(0), 'load_type' => 'ground', 'tracking_stage' => 'in_transit'],
            ['shipment_id' => 'TRK-10297', 'origin' => 'SMD', 'origin_name' => 'Gudang Samarinda, Kaltim', 'destination' => 'TGR', 'destination_name' => 'Tenggarong, Kaltim', 'status' => 'in-transit', 'estimated_arrival' => now()->addHours(2), 'load_type' => 'ground', 'tracking_stage' => 'picked_up'],
            ['shipment_id' => 'TRK-10299', 'origin' => 'SMD', 'origin_name' => 'Gudang Samarinda, Kaltim', 'destination' => 'SUB', 'destination_name' => 'Surabaya, Jatim', 'status' => 'delivered', 'estimated_arrival' => now()->subDay(), 'load_type' => 'sea', 'tracking_stage' => 'delivered', 'pod_verification_status' => 'approved', 'pod_verified_at' => now()->subDay()],
            ['shipment_id' => 'TRK-10300', 'origin' => 'SMD', 'origin_name' => 'Gudang Samarinda, Kaltim', 'destination' => 'JKT', 'destination_name' => 'Jakarta, DKI', 'status' => 'delivered', 'estimated_arrival' => now()->subDays(2), 'load_type' => 'sea', 'tracking_stage' => 'delivered', 'pod_verification_status' => 'approved', 'pod_verified_at' => now()->subDays(2)],
        ];

        $items = [
            'TRK-10293' => [
                ['product' => 'HP-AX900', 'product_name' => 'Modul Sensor AX900', 'sku' => 'HP-AX900', 'quantity' => 120, 'unit' => 'box', 'weight_kg' => 480],
                ['product' => 'HP-CBL24', 'product_name' => 'Kabel Industri 24m', 'sku' => 'HP-CBL24', 'quantity' => 80, 'unit' => 'box', 'weight_kg' => 640],
            ],
            'TRK-10297' => [
                ['product' => 'EL-PCB77', 'product_name' => 'Papan Kontrol PCB', 'sku' => 'EL-PCB77', 'quantity' => 50, 'unit' => 'box', 'weight_kg' => 150],
            ],
            'TRK-10299' => [
                ['product' => 'HP-AX900', 'product_name' => 'Modul Sensor AX900', 'sku' => 'HP-AX900', 'quantity' => 500, 'unit' => 'box', 'weight_kg' => 2000],
            ],
            'TRK-10300' => [
                ['product' => 'HP-CBL24', 'product_name' => 'Kabel Industri 24m', 'sku' => 'HP-CBL24', 'quantity' => 300, 'unit' => 'box', 'weight_kg' => 2400],
            ],
        ];

        $driverIndex = 0;
        foreach ($shipments as $data) {
            $payload = $data;
            if ($drivers->count() > 0) {
                $payload['driver_id'] = $drivers[$driverIndex % $drivers->count()]->id;
                $driverIndex++;
            }

            $shipment = Shipment::query()->updateOrCreate(['shipment_id' => $data['shipment_id']], $payload);
            $shipment->items()->delete();

            foreach (($items[$data['shipment_id']] ?? []) as $row) {
                $shipment->items()->create([
                    'product_id' => $products[$row['product']]->id ?? null,
                    'product_name' => $row['product_name'],
                    'sku' => $row['sku'],
                    'quantity' => $row['quantity'],
                    'unit' => $row['unit'],
                    'weight_kg' => $row['weight_kg'],
                ]);
            }
        }
    }
}
