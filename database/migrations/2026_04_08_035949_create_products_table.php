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
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->string('sku', 50);
            $table->string('barcode', 100)->nullable();
            $table->string('name', 150);
            $table->foreignId('category_id')->restrictOnDelete();
            $table->foreignId('unit_id')->restrictOnDelete();
            $table->foreignId('default_supplier_id')->nullable()->restrictOnDelete();
            $table->integer('minimum_stock')->default(0);
            $table->decimal('purchase_price', 15, 2);
            $table->decimal('selling_price', 15, 2);
            $table->integer('lead_time_days')->default(0);
            $table->boolean('is_active')->default(true);
            $table->text('description')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
