<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('shipments', function (Blueprint $table) {
            $table->string('delivery_recipient_name')->nullable()->after('delivered_at');
            $table->text('delivery_note')->nullable()->after('delivery_recipient_name');
        });
    }

    public function down(): void
    {
        Schema::table('shipments', function (Blueprint $table) {
            $table->dropColumn([
                'delivery_recipient_name',
                'delivery_note',
            ]);
        });
    }
};
