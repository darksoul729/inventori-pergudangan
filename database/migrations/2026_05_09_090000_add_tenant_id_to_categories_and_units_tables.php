<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        foreach (['categories', 'units'] as $table) {
            if (!Schema::hasColumn($table, 'tenant_id')) {
                Schema::table($table, function (Blueprint $blueprint) {
                    $blueprint->foreignId('tenant_id')->nullable()->after('id')->constrained()->nullOnDelete();
                    $blueprint->index('tenant_id');
                });
            }
        }

        $defaultTenantId = DB::table('tenants')->orderBy('id')->value('id');
        if ($defaultTenantId) {
            DB::table('categories')->whereNull('tenant_id')->update(['tenant_id' => $defaultTenantId]);
            DB::table('units')->whereNull('tenant_id')->update(['tenant_id' => $defaultTenantId]);
        }

        Schema::table('categories', function (Blueprint $blueprint) {
            $blueprint->unique(['tenant_id', 'name'], 'categories_tenant_name_unique');
        });

        Schema::table('units', function (Blueprint $blueprint) {
            $blueprint->unique(['tenant_id', 'name'], 'units_tenant_name_unique');
        });
    }

    public function down(): void
    {
        Schema::table('categories', function (Blueprint $blueprint) {
            $blueprint->dropUnique('categories_tenant_name_unique');
            $blueprint->dropIndex(['tenant_id']);
            $blueprint->dropConstrainedForeignId('tenant_id');
        });

        Schema::table('units', function (Blueprint $blueprint) {
            $blueprint->dropUnique('units_tenant_name_unique');
            $blueprint->dropIndex(['tenant_id']);
            $blueprint->dropConstrainedForeignId('tenant_id');
        });
    }
};

