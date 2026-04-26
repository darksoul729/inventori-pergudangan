<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PetayuMessage extends Model
{
    protected $table = 'petayu_messages';

    protected $fillable = ['conversation_id', 'role', 'content', 'metadata'];

    protected function casts(): array
    {
        return [
            'metadata' => 'array',
        ];
    }

    public function conversation(): BelongsTo
    {
        return $this->belongsTo(PetayuConversation::class, 'conversation_id');
    }
}
