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
                'destination' => 'JFK',
                'destination_name' => 'New York, USA',
                'status' => 'on-time',
                'estimated_arrival' => now()->addDays(11)->setHours(14)->setMinutes(30),
                'load_type' => 'air',
            ],
            [
                'shipment_id' => 'TRK-10294',
                'origin' => 'SIN',
                'origin_name' => 'Singapore',
                'destination' => 'DXB',
                'destination_name' => 'Dubai, UAE',
                'status' => 'delayed',
                'estimated_arrival' => now()->addDays(11)->setHours(18)->setMinutes(45),
                'load_type' => 'sea',
            ],
            [
                'shipment_id' => 'TRK-10295',
                'origin' => 'HAM',
                'origin_name' => 'Hamburg, GER',
                'destination' => 'PVG',
                'destination_name' => 'Shanghai, CN',
                'status' => 'on-time',
                'estimated_arrival' => now()->addDays(12)->setHours(9)->setMinutes(15),
                'load_type' => 'sea',
            ],
            [
                'shipment_id' => 'TRK-10296',
                'origin' => 'LAX',
                'origin_name' => 'Los Angeles, USA',
                'destination' => 'CDG',
                'destination_name' => 'Paris, FRA',
                'status' => 'in-transit',
                'estimated_arrival' => now()->addDays(15)->setHours(16)->setMinutes(0),
                'load_type' => 'air',
            ],
            [
                'shipment_id' => 'TRK-10297',
                'origin' => 'SYD',
                'origin_name' => 'Sydney, AUS',
                'destination' => 'NRT',
                'destination_name' => 'Tokyo, JP',
                'status' => 'on-time',
                'estimated_arrival' => now()->addDays(8)->setHours(11)->setMinutes(30),
                'load_type' => 'air',
            ],
            [
                'shipment_id' => 'TRK-10298',
                'origin' => 'JFK',
                'origin_name' => 'New York, USA',
                'destination' => 'HAM',
                'destination_name' => 'Hamburg, GER',
                'status' => 'delivered',
                'estimated_arrival' => now()->subDays(2)->setHours(10)->setMinutes(0),
                'load_type' => 'sea',
            ],
            [
                'shipment_id' => 'TRK-10299',
                'origin' => 'DXB',
                'origin_name' => 'Dubai, UAE',
                'destination' => 'SIN',
                'destination_name' => 'Singapore',
                'status' => 'delivered',
                'estimated_arrival' => now()->subDays(1)->setHours(14)->setMinutes(30),
                'load_type' => 'sea',
            ],
            [
                'shipment_id' => 'TRK-10300',
                'origin' => 'LHR',
                'origin_name' => 'London, UK',
                'destination' => 'LAX',
                'destination_name' => 'Los Angeles, USA',
                'status' => 'delivered',
                'estimated_arrival' => now()->subHours(6)->setMinutes(0),
                'load_type' => 'air',
            ],
        ];

        $driver = \App\Models\Driver::where('license_number', 'D-12345-BT')->first();
        
        foreach ($shipments as $index => $shipmentData) {
            $data = $shipmentData;
            // Assign every 2nd shipment to the test driver for testing
            if ($driver && $index % 2 == 0) {
                $data['driver_id'] = $driver->id;
                // Ensure status is compatible with driver visibility if needed
                if ($data['status'] === 'delivered') {
                    // keep it delivered
                } else {
                    $data['status'] = 'in-transit';
                }
            }
            
            Shipment::updateOrCreate(
                ['shipment_id' => $data['shipment_id']],
                $data
            );
        }
    }
}
