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
        Schema::table('shipments', function (Blueprint $table) {
            $table->string('pod_verification_status', 20)->nullable()->after('delivery_photo_path');
            $table->timestamp('pod_verified_at')->nullable()->after('pod_verification_status');
            $table->foreignId('pod_verified_by')->nullable()->after('pod_verified_at')->constrained('users')->nullOnDelete();
            $table->text('pod_verification_note')->nullable()->after('pod_verified_by');

            $table->index('pod_verification_status');
        });

        DB::table('shipments')
            ->where('tracking_stage', 'delivered')
            ->update([
                'pod_verification_status' => 'approved',
                'pod_verified_at' => now(),
            ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('shipments', function (Blueprint $table) {
            $table->dropIndex(['pod_verification_status']);
            $table->dropForeign(['pod_verified_by']);
            $table->dropColumn([
                'pod_verification_status',
                'pod_verified_at',
                'pod_verified_by',
                'pod_verification_note',
            ]);
        });
    }
};
