<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('customers', function (Blueprint $table) {
            if (!Schema::hasColumn('customers', 'tenant_id')) {
                $table->foreignId('tenant_id')->nullable()->after('id')->constrained('tenants')->nullOnDelete();
                $table->index(['tenant_id', 'name']);
            }
        });

        // Backfill from invoices
        DB::statement('
            UPDATE customers c
            JOIN invoices i ON i.customer_id = c.id
            SET c.tenant_id = i.tenant_id
            WHERE c.tenant_id IS NULL AND i.tenant_id IS NOT NULL
        ');

        // Backfill from stock_outs
        DB::statement('
            UPDATE customers c
            JOIN stock_outs so ON so.customer_id = c.id
            SET c.tenant_id = so.tenant_id
            WHERE c.tenant_id IS NULL AND so.tenant_id IS NOT NULL
        ');
    }

    public function down(): void
    {
        Schema::table('customers', function (Blueprint $table) {
            if (Schema::hasColumn('customers', 'tenant_id')) {
                $table->dropConstrainedForeignId('tenant_id');
                $table->dropIndex(['tenant_id', 'name']);
            }
        });
    }
};

