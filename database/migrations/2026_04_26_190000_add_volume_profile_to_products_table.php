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
        Schema::table('products', function (Blueprint $table) {
            $table->string('volume_entry_mode', 10)->default('none')->after('description'); // none|auto|manual
            $table->string('dimension_unit', 5)->nullable()->after('volume_entry_mode'); // mm|cm|m
            $table->decimal('dimension_length', 12, 3)->nullable()->after('dimension_unit');
            $table->decimal('dimension_width', 12, 3)->nullable()->after('dimension_length');
            $table->decimal('dimension_height', 12, 3)->nullable()->after('dimension_width');
            $table->decimal('volume_m3_per_unit', 14, 6)->nullable()->after('dimension_height');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn([
                'volume_entry_mode',
                'dimension_unit',
                'dimension_length',
                'dimension_width',
                'dimension_height',
                'volume_m3_per_unit',
            ]);
        });
    }
};
