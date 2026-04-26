<?php

namespace Database\Factories;

use App\Models\Shipment;
use Illuminate\Database\Eloquent\Factories\Factory;

class ShipmentFactory extends Factory
{
    protected $model = Shipment::class;

    public function definition(): array
    {
        // Origin selalu dari Gudang Utama Samarinda
        $origin = ['code' => 'SMD', 'name' => 'Gudang Samarinda, Kaltim', 'lat' => -0.4948, 'lng' => 117.1436];

        $destinations = [
            // Dalam Kaltim — jalur darat, 3-8 jam
            ['code' => 'BPN', 'name' => 'Balikpapan, Kaltim', 'lat' => -1.2654, 'lng' => 116.8312, 'hours' => 6],
            ['code' => 'BXT', 'name' => 'Bontang, Kaltim', 'lat' => 0.1333, 'lng' => 117.4833, 'hours' => 8],
            ['code' => 'TGR', 'name' => 'Tenggarong, Kaltim', 'lat' => -0.4167, 'lng' => 116.9833, 'hours' => 3],
            ['code' => 'SGQ', 'name' => 'Sangatta, Kaltim', 'lat' => 0.5167, 'lng' => 117.5500, 'hours' => 12],
            // Pulau lain — laut via Selat Makassar, 2-7 hari
            ['code' => 'BJM', 'name' => 'Banjarmasin, Kalsel', 'lat' => -3.4434, 'lng' => 114.8361, 'hours' => 48],
            ['code' => 'JKT', 'name' => 'Jakarta, DKI', 'lat' => -6.2088, 'lng' => 106.8456, 'hours' => 144],
            ['code' => 'SUB', 'name' => 'Surabaya, Jatim', 'lat' => -7.2575, 'lng' => 112.7521, 'hours' => 96],
            ['code' => 'UPG', 'name' => 'Makassar, Sulsel', 'lat' => -5.1476, 'lng' => 119.4327, 'hours' => 72],
        ];

        $destination = $this->faker->randomElement($destinations);
        $isGround = in_array($destination['code'], ['BPN', 'BXT', 'TGR', 'SGQ']);
        $loadTypes = $isGround ? ['ground'] : ['sea', 'ground'];
        $statuses = ['on-time', 'delayed', 'in-transit', 'delivered'];

        return [
            'shipment_id' => 'TRK-' . $this->faker->numberBetween(10000, 99999),
            'origin' => $origin['code'],
            'origin_name' => $origin['name'],
            'origin_lat' => $origin['lat'],
            'origin_lng' => $origin['lng'],
            'destination' => $destination['code'],
            'destination_name' => $destination['name'],
            'dest_lat' => $destination['lat'],
            'dest_lng' => $destination['lng'],
            'status' => $this->faker->randomElement($statuses),
            'estimated_arrival' => now()->addHours($destination['hours'] + $this->faker->numberBetween(-4, 12)),
            'load_type' => $this->faker->randomElement($loadTypes),
        ];
    }
}
