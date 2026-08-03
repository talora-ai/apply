<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\Company;
use App\Models\JobSource;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

final class JobPostingFactory extends Factory
{
    public function definition(): array
    {
        $minimum = fake()->numberBetween(4000, 12000);

        return [
            'company_id'      => Company::factory(), 'job_source_id' => JobSource::factory(),
            'external_id'     => (string) Str::uuid(), 'title' => fake()->randomElement(['Backend Developer', 'PHP Developer', 'Full Stack Developer', 'Software Engineer']),
            'description'     => fake()->paragraphs(4, true), 'location' => fake()->randomElement(['Remoto', 'São Paulo, SP', 'Belo Horizonte, MG', 'Curitiba, PR']),
            'workplace_type'  => fake()->randomElement(['remote', 'hybrid', 'onsite']), 'employment_type' => 'clt',
            'seniority_level' => fake()->randomElement(['junior', 'mid', 'senior']), 'salary_min' => $minimum,
            'salary_max'      => $minimum + fake()->numberBetween(2000, 6000), 'salary_currency' => 'BRL',
            'application_url' => fake()->url(), 'status' => 'active', 'published_at' => fake()->dateTimeBetween('-30 days'),
            'expires_at'      => fake()->dateTimeBetween('+15 days', '+60 days'), 'last_synced_at' => now(), 'metadata' => null,
        ];
    }
}
