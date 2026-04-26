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
        Schema::table('product_stocks', function (Blueprint $table) {
            $table->unsignedInteger('rack_stock')->default(0)->after('current_stock');
        });

        // Backfill: set rack_stock = current_stock for existing records (all stock was on racks before floating stock)
        DB::statement('UPDATE product_stocks SET rack_stock = current_stock');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('product_stocks', function (Blueprint $table) {
            $table->dropColumn('rack_stock');
        });
    }
};
