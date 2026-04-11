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
        Schema::create('restock_recommendations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->restrictOnDelete();
            $table->foreignId('warehouse_id')->restrictOnDelete();
            $table->date('recommendation_date');
            $table->integer('current_stock');
            $table->decimal('avg_daily_out', 10, 2);
            $table->decimal('predicted_days_remaining', 10, 2);
            $table->integer('suggested_restock_qty');
            $table->string('recommendation_status', 20)->default('pending');
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('restock_recommendations');
    }
};
