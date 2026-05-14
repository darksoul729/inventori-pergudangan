<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('supplier_performances', function (Blueprint $table) {
            if (!Schema::hasColumn('supplier_performances', 'auto_score')) {
                $table->decimal('auto_score', 5, 2)->nullable()->after('avg_lead_time_days');
            }
            if (!Schema::hasColumn('supplier_performances', 'manual_adjustment')) {
                $table->decimal('manual_adjustment', 5, 2)->default(0)->after('auto_score');
            }
        });

        DB::table('supplier_performances')
            ->whereNull('auto_score')
            ->update([
                'auto_score' => DB::raw('performance_score'),
                'manual_adjustment' => 0,
            ]);
    }

    public function down(): void
    {
        Schema::table('supplier_performances', function (Blueprint $table) {
            if (Schema::hasColumn('supplier_performances', 'manual_adjustment')) {
                $table->dropColumn('manual_adjustment');
            }
            if (Schema::hasColumn('supplier_performances', 'auto_score')) {
                $table->dropColumn('auto_score');
            }
        });
    }
};

