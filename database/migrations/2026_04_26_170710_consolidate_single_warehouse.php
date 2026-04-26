<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Merge rack_stocks from WH3 racks into WH1 racks (same zone name)
        $wh3Zones = DB::table('warehouse_zones')->where('warehouse_id', 3)->get();
        foreach ($wh3Zones as $wh3Zone) {
            $wh1Zone = DB::table('warehouse_zones')
                ->where('warehouse_id', 1)
                ->where('name', $wh3Zone->name)
                ->first();

            if ($wh1Zone) {
                // Get racks in both zones
                $wh3Racks = DB::table('racks')->where('warehouse_zone_id', $wh3Zone->id)->get();
                $wh1Racks = DB::table('racks')->where('warehouse_zone_id', $wh1Zone->id)->get();

                foreach ($wh3Racks as $idx => $wh3Rack) {
                    // Pick target rack in WH1 (cycle through available)
                    $wh1Rack = $wh1Racks[$idx % count($wh1Racks)] ?? $wh1Racks->first();

                    // Merge rack_stocks: add quantities to existing product in target rack
                    $wh3RackStocks = DB::table('rack_stocks')
                        ->where('rack_id', $wh3Rack->id)->get();

                    foreach ($wh3RackStocks as $rs) {
                        $existing = DB::table('rack_stocks')
                            ->where('rack_id', $wh1Rack->id)
                            ->where('product_id', $rs->product_id)
                            ->first();

                        if ($existing) {
                            DB::table('rack_stocks')->where('id', $existing->id)->update([
                                'quantity' => $existing->quantity + $rs->quantity,
                            ]);
                            DB::table('rack_stocks')->where('id', $rs->id)->delete();
                        } else {
                            DB::table('rack_stocks')->where('id', $rs->id)->update([
                                'rack_id' => $wh1Rack->id,
                            ]);
                        }
                    }

                    // Delete the WH3 rack (rack_stocks already moved)
                    DB::table('racks')->where('id', $wh3Rack->id)->delete();
                }

                // Delete the WH3 zone
                DB::table('warehouse_zones')->where('id', $wh3Zone->id)->delete();
            }
        }

        // 2. Merge product_stocks from WH3 → WH1
        $orphanStocks = DB::table('product_stocks')->where('warehouse_id', 3)->get();
        foreach ($orphanStocks as $ps) {
            $existing = DB::table('product_stocks')
                ->where('product_id', $ps->product_id)
                ->where('warehouse_id', 1)
                ->first();

            if ($existing) {
                DB::table('product_stocks')->where('id', $existing->id)->update([
                    'current_stock'   => $existing->current_stock + $ps->current_stock,
                    'rack_stock'      => $existing->rack_stock + $ps->rack_stock,
                    'reserved_stock' => $existing->reserved_stock + $ps->reserved_stock,
                ]);
                DB::table('product_stocks')->where('id', $ps->id)->delete();
            } else {
                DB::table('product_stocks')->where('id', $ps->id)->update(['warehouse_id' => 1]);
            }
        }

        // 3. Delete warehouses 2 & 3
        DB::table('warehouses')->where('id', '!=', 1)->delete();

        // 4. Safety: fix any remaining orphan references
        DB::table('product_stocks')->where('warehouse_id', '!=', 1)->update(['warehouse_id' => 1]);
        DB::table('warehouse_zones')->where('warehouse_id', '!=', 1)->update(['warehouse_id' => 1]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Cannot reverse — data was merged
    }
};
