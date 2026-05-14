<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    private array $tables = [
        'warehouses',
        'products',
        'product_stocks',
        'stock_movements',
        'racks',
        'rack_stocks',
        'purchase_orders',
        'goods_receipts',
        'stock_outs',
        'stock_opnames',
        'stock_transfers',
        'stock_adjustments',
        'shipments',
        'invoices',
    ];

    public function up(): void
    {
        foreach ($this->tables as $table) {
            if (!Schema::hasColumn($table, 'tenant_id')) {
                Schema::table($table, function (Blueprint $blueprint) {
                    $blueprint->foreignId('tenant_id')->nullable()->after('id')->constrained()->nullOnDelete();
                    $blueprint->index('tenant_id');
                });
            }
        }

        $defaultTenantId = DB::table('tenants')->orderBy('id')->value('id');
        if (!$defaultTenantId) {
            return;
        }

        foreach ($this->tables as $table) {
            DB::table($table)->whereNull('tenant_id')->update(['tenant_id' => $defaultTenantId]);
        }
    }

    public function down(): void
    {
        foreach ($this->tables as $table) {
            if (Schema::hasColumn($table, 'tenant_id')) {
                Schema::table($table, function (Blueprint $blueprint) {
                    $blueprint->dropConstrainedForeignId('tenant_id');
                });
            }
        }
    }
};
