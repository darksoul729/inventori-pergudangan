<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('petayu_conversations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('title')->default('Percakapan Baru');
            $table->text('summary')->nullable(); // AI-generated summary for long-term memory
            $table->timestamps();

            $table->index(['user_id', 'updated_at']);
        });

        Schema::create('petayu_messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('conversation_id')
                ->references('id')->on('petayu_conversations')
                ->cascadeOnDelete();
            $table->enum('role', ['user', 'model']);
            $table->longText('content');
            $table->timestamps();

            $table->index(['conversation_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('petayu_messages');
        Schema::dropIfExists('petayu_conversations');
    }
};
