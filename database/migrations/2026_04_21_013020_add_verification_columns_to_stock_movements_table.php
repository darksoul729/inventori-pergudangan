<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('stock_movements', function (Blueprint $table) {
            $table->string('verification_status')->default('verified')->after('notes');
            $table->timestamp('verified_at')->nullable()->after('verification_status');
            $table->foreignId('verified_by')->nullable()->after('verified_at')->constrained('users')->nullOnDelete();
            $table->text('verification_notes')->nullable()->after('verified_by');
        });

        // Update existing adjustments and opnames to 'pending'
        DB::table('stock_movements')
            ->whereIn('movement_type', ['adjustment', 'opname'])
            ->update(['verification_status' => 'pending']);
        
        // Ensure standard movements are 'verified' (already default, but being explicit)
        DB::table('stock_movements')
            ->whereIn('movement_type', ['in', 'out', 'transfer'])
            ->update(['verification_status' => 'verified']);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('stock_movements', function (Blueprint $table) {
            $table->dropForeign(['verified_by']);
            $table->dropColumn(['verification_status', 'verified_at', 'verified_by', 'verification_notes']);
        });
    }
};
