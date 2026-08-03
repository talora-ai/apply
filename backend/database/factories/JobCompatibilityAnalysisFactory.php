<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\JobPosting;
use App\Models\UserResume;
use Illuminate\Database\Eloquent\Factories\Factory;

final class JobCompatibilityAnalysisFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_resume_id' => UserResume::factory(),
            'user_id' => fn (array $attributes): int => UserResume::query()->findOrFail($attributes['user_resume_id'])->user_id,
            'job_posting_id' => JobPosting::factory(), 'resume_analysis_id' => null, 'status' => 'completed',
            'overall_score' => fake()->randomFloat(2, 65, 99), 'skills_score' => fake()->randomFloat(2, 65, 99),
            'experience_score' => fake()->randomFloat(2, 65, 99), 'education_score' => fake()->randomFloat(2, 60, 100),
            'location_score' => 100, 'recommendation' => fake()->randomElement(['apply', 'review', 'skip']),
            'summary' => fake()->paragraph(), 'matching_skills' => ['PHP', 'Laravel', 'APIs REST'],
            'missing_skills' => ['AWS'], 'strengths' => ['Experiência backend'], 'risks' => ['Inglês não informado'],
            'suggestions' => ['Destacar projetos Laravel'], 'provider' => 'openai', 'model' => 'demo-model',
            'prompt_version' => 'compatibility-v1', 'input_tokens' => 2500, 'output_tokens' => 800,
            'estimated_cost' => 0, 'failure_reason' => null, 'raw_response' => null,
            'started_at' => now()->subSeconds(5), 'completed_at' => now(),
        ];
    }
}
