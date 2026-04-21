<?php

namespace App\Policies;

use App\Models\AetherConversation;
use App\Models\User;

class AetherConversationPolicy
{
    public function view(User $user, AetherConversation $conversation): bool
    {
        return $conversation->user_id === $user->id;
    }

    public function delete(User $user, AetherConversation $conversation): bool
    {
        return $conversation->user_id === $user->id;
    }
}
