<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PetayuConversation extends Model
{
    protected $table = 'petayu_conversations';

    protected $fillable = ['user_id', 'title', 'summary'];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function messages(): HasMany
    {
        return $this->hasMany(PetayuMessage::class, 'conversation_id')->orderBy('created_at');
    }
}
