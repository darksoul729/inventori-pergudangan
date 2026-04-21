<?php

namespace Database\Seeders;

use App\Models\Shipment;
use Illuminate\Database\Seeder;

class ShipmentsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create sample shipments
        $shipments = [
            [
                'shipment_id' => 'TRK-10293',
                'origin' => 'LHR',
                'origin_name' => 'London, UK',
                'origin_lat' => 51.4700,
                'origin_lng' => -0.4543,
                'destination' => 'JFK',
                'destination_name' => 'New York, USA',
                'dest_lat' => 40.6413,
                'dest_lng' => -73.7781,
                'status' => 'on-time',
                'estimated_arrival' => now()->addDays(11)->setHours(14)->setMinutes(30),
                'load_type' => 'air',
            ],
            [
                'shipment_id' => 'TRK-10294',
                'origin' => 'SIN',
                'origin_name' => 'Singapore',
                'origin_lat' => 1.3644,
                'origin_lng' => 103.9915,
                'destination' => 'DXB',
                'destination_name' => 'Dubai, UAE',
                'dest_lat' => 25.2532,
                'dest_lng' => 55.3657,
                'status' => 'delayed',
                'estimated_arrival' => now()->addDays(11)->setHours(18)->setMinutes(45),
                'load_type' => 'sea',
            ],
            [
                'shipment_id' => 'TRK-10295',
                'origin' => 'HAM',
                'origin_name' => 'Hamburg, GER',
                'origin_lat' => 53.5511,
                'origin_lng' => 9.9937,
                'destination' => 'PVG',
                'destination_name' => 'Shanghai, CN',
                'dest_lat' => 31.2304,
                'dest_lng' => 121.4737,
                'status' => 'on-time',
                'estimated_arrival' => now()->addDays(12)->setHours(9)->setMinutes(15),
                'load_type' => 'sea',
            ],
            [
                'shipment_id' => 'TRK-10296',
                'origin' => 'LAX',
                'origin_name' => 'Los Angeles, USA',
                'origin_lat' => 33.9416,
                'origin_lng' => -118.4085,
                'destination' => 'CDG',
                'destination_name' => 'Paris, FRA',
                'dest_lat' => 49.0097,
                'dest_lng' => 2.5479,
                'status' => 'in-transit',
                'estimated_arrival' => now()->addDays(15)->setHours(16)->setMinutes(0),
                'load_type' => 'air',
            ],
            [
                'shipment_id' => 'TRK-10297',
                'origin' => 'SYD',
                'origin_name' => 'Sydney, AUS',
                'origin_lat' => -33.9399,
                'origin_lng' => 151.1753,
                'destination' => 'NRT',
                'destination_name' => 'Tokyo, JP',
                'dest_lat' => 35.7720,
                'dest_lng' => 140.3929,
                'status' => 'on-time',
                'estimated_arrival' => now()->addDays(8)->setHours(11)->setMinutes(30),
                'load_type' => 'air',
            ],
            [
                'shipment_id' => 'TRK-10298',
                'origin' => 'JFK',
                'origin_name' => 'New York, USA',
                'origin_lat' => 40.6413,
                'origin_lng' => -73.7781,
                'destination' => 'HAM',
                'destination_name' => 'Hamburg, GER',
                'dest_lat' => 53.5511,
                'dest_lng' => 9.9937,
                'status' => 'delivered',
                'estimated_arrival' => now()->subDays(2)->setHours(10)->setMinutes(0),
                'load_type' => 'sea',
            ],
            [
                'shipment_id' => 'TRK-10299',
                'origin' => 'DXB',
                'origin_name' => 'Dubai, UAE',
                'origin_lat' => 25.2532,
                'origin_lng' => 55.3657,
                'destination' => 'SIN',
                'destination_name' => 'Singapore',
                'dest_lat' => 1.3644,
                'dest_lng' => 103.9915,
                'status' => 'delivered',
                'estimated_arrival' => now()->subDays(1)->setHours(14)->setMinutes(30),
                'load_type' => 'sea',
            ],
            [
                'shipment_id' => 'TRK-10300',
                'origin' => 'LHR',
                'origin_name' => 'London, UK',
                'origin_lat' => 51.4700,
                'origin_lng' => -0.4543,
                'destination' => 'LAX',
                'destination_name' => 'Los Angeles, USA',
                'dest_lat' => 33.9416,
                'dest_lng' => -118.4085,
                'status' => 'delivered',
                'estimated_arrival' => now()->subHours(6)->setMinutes(0),
                'load_type' => 'air',
            ],
        ];

        $drivers = \App\Models\Driver::where('status', 'approved')->get();
        $activeDriverIndex = 0;
        
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
        }
    }
}
