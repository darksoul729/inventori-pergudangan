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
        Schema::table('product_stocks', function (Blueprint $table) {
            $table->unique(['product_id', 'warehouse_id'], 'product_stocks_product_warehouse_unique');
        });

        Schema::table('rack_stocks', function (Blueprint $table) {
            $table->unique(['rack_id', 'product_id'], 'rack_stocks_rack_product_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('product_stocks', function (Blueprint $table) {
            $table->dropUnique('product_stocks_product_warehouse_unique');
        });

        Schema::table('rack_stocks', function (Blueprint $table) {
            $table->dropUnique('rack_stocks_rack_product_unique');
        });
    }
};
