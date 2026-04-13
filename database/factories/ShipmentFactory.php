<?php

namespace Database\Factories;

use App\Models\Shipment;
use Illuminate\Database\Eloquent\Factories\Factory;

class ShipmentFactory extends Factory
{
    protected $model = Shipment::class;

    public function definition(): array
    {
        $origins = [
            ['code' => 'LHR', 'name' => 'London, UK'],
            ['code' => 'SIN', 'name' => 'Singapore'],
            ['code' => 'HAM', 'name' => 'Hamburg, GER'],
            ['code' => 'LAX', 'name' => 'Los Angeles, USA'],
            ['code' => 'SYD', 'name' => 'Sydney, AUS'],
        ];

        $destinations = [
            ['code' => 'JFK', 'name' => 'New York, USA'],
            ['code' => 'DXB', 'name' => 'Dubai, UAE'],
            ['code' => 'PVG', 'name' => 'Shanghai, CN'],
            ['code' => 'CDG', 'name' => 'Paris, FRA'],
            ['code' => 'NRT', 'name' => 'Tokyo, JP'],
        ];

        $origin = $this->faker->randomElement($origins);
        $destination = $this->faker->randomElement($destinations);
        $loadTypes = ['sea', 'air', 'ground'];
        $statuses = ['on-time', 'delayed', 'in-transit', 'delivered'];

        return [
            'shipment_id' => 'TRK-' . $this->faker->numberBetween(10000, 99999),
            'origin' => $origin['code'],
            'origin_name' => $origin['name'],
            'destination' => $destination['code'],
            'destination_name' => $destination['name'],
            'status' => $this->faker->randomElement($statuses),
            'estimated_arrival' => $this->faker->dateTimeBetween('+1 days', '+30 days'),
            'load_type' => $this->faker->randomElement($loadTypes),
        ];
    }
}
