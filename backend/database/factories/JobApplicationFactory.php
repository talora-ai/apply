<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\JobPosting;
use App\Models\UserResume;
use Illuminate\Database\Eloquent\Factories\Factory;

final class JobApplicationFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_resume_id'      => UserResume::factory(),
            'user_id'             => fn (array $attributes): int => UserResume::query()->findOrFail($attributes['user_resume_id'])->user_id,
            'job_posting_id'      => JobPosting::factory(), 'status' => 'submitted',
            'is_automatic' => fake()->boolean(),
            'applied_at'          => now(), 'last_status_at' => now(), 'failure_reason' => null, 'metadata' => null,
        ];
    }
}
