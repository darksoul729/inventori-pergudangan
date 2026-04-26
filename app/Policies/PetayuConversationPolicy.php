<?php

namespace App\Policies;

use App\Models\PetayuConversation;
use App\Models\User;

class PetayuConversationPolicy
{
    public function view(User $user, PetayuConversation $conversation): bool
    {
        return $conversation->user_id === $user->id;
    }

    public function delete(User $user, PetayuConversation $conversation): bool
    {
        return $conversation->user_id === $user->id;
    }
}
