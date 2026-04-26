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
        Schema::table('warehouse_zones', function (Blueprint $table) {
            $table->integer('pos_x')->nullable()->after('description');
            $table->integer('pos_y')->nullable()->after('pos_x');
            $table->integer('width')->nullable()->after('pos_y');
            $table->integer('height')->nullable()->after('width');
            $table->integer('rotation')->default(0)->after('height');
        });

        Schema::table('racks', function (Blueprint $table) {
            $table->integer('pos_x')->nullable()->after('notes');
            $table->integer('pos_y')->nullable()->after('pos_x');
            $table->integer('width')->nullable()->after('pos_y');
            $table->integer('height')->nullable()->after('width');
            $table->integer('rotation')->default(0)->after('height');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('warehouse_zones', function (Blueprint $table) {
            $table->dropColumn(['pos_x', 'pos_y', 'width', 'height', 'rotation']);
        });

        Schema::table('racks', function (Blueprint $table) {
            $table->dropColumn(['pos_x', 'pos_y', 'width', 'height', 'rotation']);
        });
    }
};
