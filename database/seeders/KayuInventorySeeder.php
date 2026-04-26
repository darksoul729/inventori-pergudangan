<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use App\Models\ProductStock;
use App\Models\Unit;
use App\Models\Warehouse;
use Illuminate\Database\Seeder;

class KayuInventorySeeder extends Seeder
{
    public function run(): void
    {
        $warehouse = Warehouse::query()->firstOrCreate(
            ['code' => 'WH-SMD'],
            [
                'name' => 'Gudang Utama Samarinda',
                'location' => 'Samarinda, Kalimantan Timur',
                'description' => 'Gudang utama inventori kayu',
            ]
        );

        $unitBatang = Unit::query()->firstOrCreate(
            ['symbol' => 'btg'],
            ['name' => 'Batang']
        );

        $categoryKayu = Category::query()->firstOrCreate(
            ['name' => 'Kayu / Bahan Baku'],
            ['description' => 'Inventori material kayu']
        );

        $productAuto = Product::query()->updateOrCreate(
            ['sku' => 'ULIN-E46-4000x50x25'],
            [
                'barcode' => 'ULIN-E46-4000x50x25',
                'name' => 'KAYU ULIN 4M x 5CM x 2.5CM',
                'category_id' => $categoryKayu->id,
                'unit_id' => $unitBatang->id,
                'default_supplier_id' => null,
                'minimum_stock' => 30,
                'purchase_price' => 185000,
                'selling_price' => 250000,
                'lead_time_days' => 3,
                'is_active' => true,
                'description' => 'Volume auto: 4000 x 50 x 25 / 1,000,000,000 = 0.005000 m3 per batang',
                'volume_entry_mode' => 'auto',
                'dimension_unit' => 'mm',
                'dimension_length' => 4000,
                'dimension_width' => 50,
                'dimension_height' => 25,
                'volume_m3_per_unit' => 0.005000,
            ]
        );

        $productManual = Product::query()->updateOrCreate(
            ['sku' => 'MERANTI-M02-MANUAL'],
            [
                'barcode' => 'MERANTI-M02-MANUAL',
                'name' => 'KAYU MERANTI 4M (INPUT MANUAL)',
                'category_id' => $categoryKayu->id,
                'unit_id' => $unitBatang->id,
                'default_supplier_id' => null,
                'minimum_stock' => 20,
                'purchase_price' => 145000,
                'selling_price' => 205000,
                'lead_time_days' => 3,
                'is_active' => true,
                'description' => 'Volume manual: 0.005000 m3 per batang',
                'volume_entry_mode' => 'manual',
                'dimension_unit' => null,
                'dimension_length' => null,
                'dimension_width' => null,
                'dimension_height' => null,
                'volume_m3_per_unit' => 0.005000,
            ]
        );

        ProductStock::query()->updateOrCreate(
            [
                'product_id' => $productAuto->id,
                'warehouse_id' => $warehouse->id,
            ],
            [
                'current_stock' => 120,
                'rack_stock' => 0,
                'reserved_stock' => 0,
                'last_updated_at' => now(),
            ]
        );

        ProductStock::query()->updateOrCreate(
            [
                'product_id' => $productManual->id,
                'warehouse_id' => $warehouse->id,
            ],
            [
                'current_stock' => 40,
                'rack_stock' => 0,
                'reserved_stock' => 0,
                'last_updated_at' => now(),
            ]
        );
    }
}
