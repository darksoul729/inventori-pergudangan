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
        Schema::table('stock_transfer_items', function (Blueprint $table) {
            $table->foreignId('from_rack_id')->nullable()->after('stock_transfer_id')->constrained('racks')->nullOnDelete();
            $table->foreignId('to_rack_id')->nullable()->after('from_rack_id')->constrained('racks')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('stock_transfer_items', function (Blueprint $table) {
            $table->dropForeign(['from_rack_id']);
            $table->dropForeign(['to_rack_id']);
            $table->dropColumn(['from_rack_id', 'to_rack_id']);
        });
    }
};
