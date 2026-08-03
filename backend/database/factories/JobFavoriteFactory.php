<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\JobPosting;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

final class JobFavoriteFactory extends Factory
{
    public function definition(): array
    {
        return ['user_id' => User::factory(), 'job_posting_id' => JobPosting::factory()];
    }
}
