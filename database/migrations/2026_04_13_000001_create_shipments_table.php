<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('shipments', function (Blueprint $table) {
            $table->id();
            $table->string('shipment_id')->unique();
            $table->string('origin');
            $table->string('origin_name');
            $table->string('destination');
            $table->string('destination_name');
            $table->enum('status', ['on-time', 'delayed', 'in-transit', 'delivered'])->default('in-transit');
            $table->dateTime('estimated_arrival');
            $table->enum('load_type', ['sea', 'air', 'ground']);
            $table->foreignId('purchase_order_id')->nullable()->constrained();
            $table->foreignId('goods_receipt_id')->nullable()->constrained();
            $table->timestamps();

            $table->index('status');
            $table->index('load_type');
            $table->index('estimated_arrival');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('shipments');
    }
};
