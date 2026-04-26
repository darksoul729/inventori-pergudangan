<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('petayu_messages') && ! Schema::hasColumn('petayu_messages', 'metadata')) {
            Schema::table('petayu_messages', function (Blueprint $table) {
                $table->json('metadata')->nullable()->after('content');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('petayu_messages') && Schema::hasColumn('petayu_messages', 'metadata')) {
            Schema::table('petayu_messages', function (Blueprint $table) {
                $table->dropColumn('metadata');
            });
        }
    }
};
