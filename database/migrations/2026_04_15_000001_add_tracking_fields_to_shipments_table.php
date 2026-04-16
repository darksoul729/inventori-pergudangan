<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('shipments', function (Blueprint $table) {
            $table->enum('tracking_stage', [
                'ready_for_pickup',
                'picked_up',
                'in_transit',
                'arrived_at_destination',
                'delivered',
            ])->default('ready_for_pickup')->after('status');
            $table->string('last_tracking_note')->nullable()->after('tracking_stage');
            $table->timestamp('claimed_at')->nullable()->after('driver_id');
            $table->timestamp('picked_up_at')->nullable()->after('claimed_at');
            $table->timestamp('in_transit_at')->nullable()->after('picked_up_at');
            $table->timestamp('arrived_at_destination_at')->nullable()->after('in_transit_at');
            $table->timestamp('delivered_at')->nullable()->after('arrived_at_destination_at');

            $table->index('tracking_stage');
        });
    }

    public function down(): void
    {
        Schema::table('shipments', function (Blueprint $table) {
            $table->dropIndex(['tracking_stage']);
            $table->dropColumn([
                'tracking_stage',
                'last_tracking_note',
                'claimed_at',
                'picked_up_at',
                'in_transit_at',
                'arrived_at_destination_at',
                'delivered_at',
            ]);
        });
    }
};
