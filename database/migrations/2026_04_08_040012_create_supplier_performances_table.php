<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('supplier_performances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('supplier_id')->restrictOnDelete();
            $table->integer('period_month');
            $table->integer('period_year');
            $table->integer('total_orders');
            $table->integer('on_time_deliveries');
            $table->integer('late_deliveries');
            $table->decimal('avg_lead_time_days', 10, 2);
            $table->decimal('performance_score', 5, 2);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('supplier_performances');
    }
};
