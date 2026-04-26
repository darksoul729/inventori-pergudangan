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
        if (Schema::hasTable('aether_conversations') && ! Schema::hasTable('petayu_conversations')) {
            Schema::rename('aether_conversations', 'petayu_conversations');
        }

        if (Schema::hasTable('aether_messages') && ! Schema::hasTable('petayu_messages')) {
            Schema::rename('aether_messages', 'petayu_messages');
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('petayu_conversations') && ! Schema::hasTable('aether_conversations')) {
            Schema::rename('petayu_conversations', 'aether_conversations');
        }

        if (Schema::hasTable('petayu_messages') && ! Schema::hasTable('aether_messages')) {
            Schema::rename('petayu_messages', 'aether_messages');
        }
    }
};
