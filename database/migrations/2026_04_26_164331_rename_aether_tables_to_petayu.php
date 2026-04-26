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
        Schema::rename('aether_conversations', 'petayu_conversations');
        Schema::rename('aether_messages', 'petayu_messages');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::rename('petayu_conversations', 'aether_conversations');
        Schema::rename('petayu_messages', 'aether_messages');
    }
};
