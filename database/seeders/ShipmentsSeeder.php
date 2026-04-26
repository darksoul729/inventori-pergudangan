<?php

namespace Database\Seeders;

use App\Models\Shipment;
use App\Models\ShipmentItem;
use Illuminate\Database\Seeder;

class ShipmentsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create sample shipments — semua berasal dari Gudang Utama Samarinda
        // Rute realistis berdasarkan jarak & jalur dari Samarinda, Kaltim
        $shipments = [
            [
                // Samarinda → Balikpapan: ~120km, jalur darat via Jl. Soekarno-Hatta
                'shipment_id' => 'TRK-10293',
                'origin' => 'SMD',
                'origin_name' => 'Gudang Samarinda, Kaltim',
                'origin_lat' => -0.4948,
                'origin_lng' => 117.1436,
                'destination' => 'BPN',
                'destination_name' => 'Balikpapan, Kaltim',
                'dest_lat' => -1.2654,
                'dest_lng' => 116.8312,
                'status' => 'on-time',
                'estimated_arrival' => now()->addHours(6)->setMinutes(0),
                'load_type' => 'ground',
            ],
            [
                // Samarinda → Tenggarong: ~35km, jalur darat via Jl. PT. Pupuk Kaltim
                'shipment_id' => 'TRK-10297',
                'origin' => 'SMD',
                'origin_name' => 'Gudang Samarinda, Kaltim',
                'origin_lat' => -0.4948,
                'origin_lng' => 117.1436,
                'destination' => 'TGR',
                'destination_name' => 'Tenggarong, Kaltim',
                'dest_lat' => -0.4167,
                'dest_lng' => 116.9833,
                'status' => 'on-time',
                'estimated_arrival' => now()->addHours(3)->setMinutes(30),
                'load_type' => 'ground',
            ],
            [
                // Samarinda → Bontang: ~130km, jalur darat utara via Jl. Bontang-Sangatta
                'shipment_id' => 'TRK-10295',
                'origin' => 'SMD',
                'origin_name' => 'Gudang Samarinda, Kaltim',
                'origin_lat' => -0.4948,
                'origin_lng' => 117.1436,
                'destination' => 'BXT',
                'destination_name' => 'Bontang, Kaltim',
                'dest_lat' => 0.1333,
                'dest_lng' => 117.4833,
                'status' => 'in-transit',
                'estimated_arrival' => now()->addHours(8)->setMinutes(0),
                'load_type' => 'ground',
            ],
            [
                // Samarinda → Sangatta: ~250km, jalur darat utara
                'shipment_id' => 'TRK-10294',
                'origin' => 'SMD',
                'origin_name' => 'Gudang Samarinda, Kaltim',
                'origin_lat' => -0.4948,
                'origin_lng' => 117.1436,
                'destination' => 'SGQ',
                'destination_name' => 'Sangatta, Kaltim',
                'dest_lat' => 0.5167,
                'dest_lng' => 117.5500,
                'status' => 'delayed',
                'estimated_arrival' => now()->addDays(1)->setHours(10)->setMinutes(0),
                'load_type' => 'ground',
            ],
            [
                // Samarinda → Banjarmasin: ~600km, jalur darat via Balikpapan-Kotabaru atau laut via Selat Makassar
                'shipment_id' => 'TRK-10296',
                'origin' => 'SMD',
                'origin_name' => 'Gudang Samarinda, Kaltim',
                'origin_lat' => -0.4948,
                'origin_lng' => 117.1436,
                'destination' => 'BJM',
                'destination_name' => 'Banjarmasin, Kalsel',
                'dest_lat' => -3.4434,
                'dest_lng' => 114.8361,
                'status' => 'in-transit',
                'estimated_arrival' => now()->addDays(2)->setHours(16)->setMinutes(0),
                'load_type' => 'sea',
            ],
            [
                // Samarinda → Makassar: laut via Selat Makassar, kapal cargo ~2-3 hari
                'shipment_id' => 'TRK-10298',
                'origin' => 'SMD',
                'origin_name' => 'Gudang Samarinda, Kaltim',
                'origin_lat' => -0.4948,
                'origin_lng' => 117.1436,
                'destination' => 'UPG',
                'destination_name' => 'Makassar, Sulsel',
                'dest_lat' => -5.1476,
                'dest_lng' => 119.4327,
                'status' => 'on-time',
                'estimated_arrival' => now()->addDays(3)->setHours(9)->setMinutes(0),
                'load_type' => 'sea',
            ],
            [
                // Samarinda → Surabaya: laut via Selat Makassar → Laut Jawa, kapal cargo ~4-5 hari
                'shipment_id' => 'TRK-10299',
                'origin' => 'SMD',
                'origin_name' => 'Gudang Samarinda, Kaltim',
                'origin_lat' => -0.4948,
                'origin_lng' => 117.1436,
                'destination' => 'SUB',
                'destination_name' => 'Surabaya, Jatim',
                'dest_lat' => -7.2575,
                'dest_lng' => 112.7521,
                'status' => 'delivered',
                'estimated_arrival' => now()->subDays(1)->setHours(14)->setMinutes(30),
                'load_type' => 'sea',
            ],
            [
                // Samarinda → Jakarta: laut via Selat Makassar → Laut Jawa → Tanjung Priok, ~5-7 hari
                'shipment_id' => 'TRK-10300',
                'origin' => 'SMD',
                'origin_name' => 'Gudang Samarinda, Kaltim',
                'origin_lat' => -0.4948,
                'origin_lng' => 117.1436,
                'destination' => 'JKT',
                'destination_name' => 'Jakarta, DKI',
                'dest_lat' => -6.2088,
                'dest_lng' => 106.8456,
                'status' => 'delivered',
                'estimated_arrival' => now()->subDays(2)->setHours(10)->setMinutes(0),
                'load_type' => 'sea',
            ],
        ];

        $drivers = \App\Models\Driver::where('status', 'approved')->get();
        $activeDriverIndex = 0;

        // Item yang dikirim per shipment
        $shipmentItemsMap = [
            'TRK-10293' => [
                ['product_name' => 'AX900 Sensor Module', 'sku' => 'HP-AX900', 'quantity' => 120, 'unit' => 'box', 'weight_kg' => 480],
                ['product_name' => 'Industrial Cable 24m', 'sku' => 'HP-CBL24', 'quantity' => 80, 'unit' => 'box', 'weight_kg' => 640],
            ],
            'TRK-10297' => [
                ['product_name' => 'PCB Controller Board', 'sku' => 'EL-PCB77', 'quantity' => 50, 'unit' => 'box', 'weight_kg' => 150],
            ],
            'TRK-10295' => [
                ['product_name' => 'Bulk Pallet Resin', 'sku' => 'BK-PLT55', 'quantity' => 20, 'unit' => 'plt', 'weight_kg' => 4000],
                ['product_name' => 'AX900 Sensor Module', 'sku' => 'HP-AX900', 'quantity' => 30, 'unit' => 'box', 'weight_kg' => 120],
            ],
            'TRK-10294' => [
                ['product_name' => 'Solvent Chemical Drum', 'sku' => 'HZ-SOL88', 'quantity' => 8, 'unit' => 'plt', 'weight_kg' => 3200],
                ['product_name' => 'Cross Dock Parcel', 'sku' => 'CD-DOCK1', 'quantity' => 45, 'unit' => 'box', 'weight_kg' => 225],
            ],
            'TRK-10296' => [
                ['product_name' => 'AX900 Sensor Module', 'sku' => 'HP-AX900', 'quantity' => 200, 'unit' => 'box', 'weight_kg' => 800],
                ['product_name' => 'PCB Controller Board', 'sku' => 'EL-PCB77', 'quantity' => 150, 'unit' => 'box', 'weight_kg' => 450],
                ['product_name' => 'Industrial Cable 24m', 'sku' => 'HP-CBL24', 'quantity' => 100, 'unit' => 'box', 'weight_kg' => 800],
            ],
            'TRK-10298' => [
                ['product_name' => 'Bulk Pallet Resin', 'sku' => 'BK-PLT55', 'quantity' => 30, 'unit' => 'plt', 'weight_kg' => 6000],
                ['product_name' => 'Solvent Chemical Drum', 'sku' => 'HZ-SOL88', 'quantity' => 5, 'unit' => 'plt', 'weight_kg' => 2000],
            ],
            'TRK-10299' => [
                ['product_name' => 'AX900 Sensor Module', 'sku' => 'HP-AX900', 'quantity' => 500, 'unit' => 'box', 'weight_kg' => 2000],
                ['product_name' => 'Cross Dock Parcel', 'sku' => 'CD-DOCK1', 'quantity' => 100, 'unit' => 'box', 'weight_kg' => 500],
            ],
            'TRK-10300' => [
                ['product_name' => 'Industrial Cable 24m', 'sku' => 'HP-CBL24', 'quantity' => 300, 'unit' => 'box', 'weight_kg' => 2400],
                ['product_name' => 'PCB Controller Board', 'sku' => 'EL-PCB77', 'quantity' => 250, 'unit' => 'box', 'weight_kg' => 750],
            ],
        ];
        
        foreach ($shipments as $shipmentData) {
            $data = $shipmentData;

            // Only assign driver if needed and available
            if ($data['status'] !== 'delivered') {
                // Active shipment: assign unique driver if available
                if ($activeDriverIndex < $drivers->count()) {
                    $data['driver_id'] = $drivers[$activeDriverIndex]->id;
                    $data['status'] = 'in-transit';
                    $data['tracking_stage'] = 'ready_for_pickup';
                    $activeDriverIndex++;
                }
            } else {
                // Delivered shipment: can assign to any driver (it won't make them busy if POD approved)
                // For seeding, let's just assign one driver to some delivered ones but mark POD as approved
                $data['driver_id'] = $drivers->random()->id;
                $data['tracking_stage'] = 'delivered';
                $data['pod_verification_status'] = 'approved';
            }
            
            Shipment::updateOrCreate(
                ['shipment_id' => $data['shipment_id']],
                $data
            );

            // Seed items for this shipment
            $shipmentModel = Shipment::where('shipment_id', $data['shipment_id'])->first();
            if ($shipmentModel && isset($shipmentItemsMap[$data['shipment_id']])) {
                $shipmentModel->items()->delete(); // clear old
                foreach ($shipmentItemsMap[$data['shipment_id']] as $itemData) {
                    // Try to link product by SKU
                    $product = \App\Models\Product::where('sku', $itemData['sku'])->first();
                    $shipmentModel->items()->create(array_merge($itemData, [
                        'product_id' => $product?->id,
                    ]));
                }
            }
        }
    }
}
