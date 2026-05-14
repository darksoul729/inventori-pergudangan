<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->foreignId('tenant_id')->nullable()->after('id')->constrained()->nullOnDelete();
            $table->index('tenant_id');
        });

        if (Schema::hasTable('tenants')) {
            $tenantId = DB::table('tenants')->insertGetId([
                'code' => 'TENANT-DEFAULT',
                'name' => 'Tenant Default',
                'slug' => 'tenant-default',
                'status' => 'active',
                'timezone' => 'Asia/Makassar',
                'locale' => 'id',
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            DB::table('users')
                ->whereNull('tenant_id')
                ->update(['tenant_id' => $tenantId]);
        }
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropConstrainedForeignId('tenant_id');
        });
    }
};

