<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\JobApplication;
use Illuminate\Database\Eloquent\Factories\Factory;

final class JobApplicationEventFactory extends Factory
{
    public function definition(): array
    {
        $status = fake()->randomElement(['pending', 'processing', 'submitted', 'viewed']);

        return ['job_application_id' => JobApplication::factory(), 'status' => $status, 'description' => "Status alterado para {$status}.", 'metadata' => null, 'occurred_at' => now()];
    }
}
