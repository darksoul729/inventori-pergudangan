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
        Schema::create('rack_stocks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('rack_id')->constrained('racks')->restrictOnDelete();
            $table->foreignId('product_id')->constrained('products')->restrictOnDelete();
            $table->integer('quantity')->default(0);
            $table->integer('reserved_quantity')->default(0);
            $table->string('batch_number', 100)->nullable();
            $table->date('expired_date')->nullable();
            $table->timestamp('last_updated_at')->nullable();
            $table->timestamps();

            $table->index(['rack_id', 'product_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('rack_stocks');
    }
};
