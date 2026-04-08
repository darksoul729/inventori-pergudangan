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
        Schema::create('stock_movements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->restrictOnDelete();
            $table->foreignId('warehouse_id')->restrictOnDelete();
            $table->string('movement_type', 20);
            $table->string('reference_type', 50);
            $table->bigInteger('reference_id');
            $table->integer('quantity');
            $table->integer('stock_before');
            $table->integer('stock_after');
            $table->dateTime('movement_date');
            $table->text('notes')->nullable();
            $table->foreignId('created_by')->constrained('users')->restrictOnDelete();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('stock_movements');
    }
};
