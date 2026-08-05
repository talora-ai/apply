<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\User;
use App\Models\UserResume;

final class UserResumePolicy
{
    public function view(User $user, UserResume $resume): bool
    {
        return $resume->user_id === $user->id;
    }

    public function update(User $user, UserResume $resume): bool
    {
        return $resume->user_id === $user->id;
    }

    public function delete(User $user, UserResume $resume): bool
    {
        return $resume->user_id === $user->id;
    }
}
