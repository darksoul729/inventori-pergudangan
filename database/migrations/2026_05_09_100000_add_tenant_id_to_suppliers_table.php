<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasColumn('suppliers', 'tenant_id')) {
            Schema::table('suppliers', function (Blueprint $table) {
                $table->foreignId('tenant_id')->nullable()->after('id')->constrained()->nullOnDelete();
                $table->index('tenant_id');
            });
        }

        $defaultTenantId = DB::table('tenants')->orderBy('id')->value('id');
        if ($defaultTenantId) {
            DB::table('suppliers')->whereNull('tenant_id')->update(['tenant_id' => $defaultTenantId]);
        }

        Schema::table('suppliers', function (Blueprint $table) {
            $table->unique(['tenant_id', 'code'], 'suppliers_tenant_code_unique');
        });
    }

    public function down(): void
    {
        Schema::table('suppliers', function (Blueprint $table) {
            $table->dropUnique('suppliers_tenant_code_unique');
            $table->dropIndex(['tenant_id']);
            $table->dropConstrainedForeignId('tenant_id');
        });
    }
};

