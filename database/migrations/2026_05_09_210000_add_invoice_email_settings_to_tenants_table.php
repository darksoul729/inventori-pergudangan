<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tenants', function (Blueprint $table) {
            if (!Schema::hasColumn('tenants', 'invoice_email_on_partial')) {
                $table->boolean('invoice_email_on_partial')->default(true)->after('locale');
            }
            if (!Schema::hasColumn('tenants', 'invoice_email_on_paid')) {
                $table->boolean('invoice_email_on_paid')->default(true)->after('invoice_email_on_partial');
            }
        });
    }

    public function down(): void
    {
        Schema::table('tenants', function (Blueprint $table) {
            if (Schema::hasColumn('tenants', 'invoice_email_on_paid')) {
                $table->dropColumn('invoice_email_on_paid');
            }
            if (Schema::hasColumn('tenants', 'invoice_email_on_partial')) {
                $table->dropColumn('invoice_email_on_partial');
            }
        });
    }
};

