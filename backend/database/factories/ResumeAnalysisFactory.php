<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\UserResume;
use Illuminate\Database\Eloquent\Factories\Factory;

final class ResumeAnalysisFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_resume_id'     => UserResume::factory(),
            'user_id'            => fn (array $attributes): int => UserResume::query()->findOrFail($attributes['user_resume_id'])->user_id,
            'status'             => 'completed', 'professional_title' => 'Backend Developer', 'seniority_level' => 'mid',
            'overall_score'      => fake()->randomFloat(2, 70, 98), 'ats_score' => fake()->randomFloat(2, 70, 98),
            'completeness_score' => fake()->randomFloat(2, 75, 100), 'professional_summary' => fake()->paragraph(),
            'strengths'          => ['PHP', 'Laravel', 'APIs REST'], 'weaknesses' => ['Inglês avançado'],
            'skills'             => ['PHP', 'Laravel', 'Docker', 'Redis', 'MySQL'], 'suggestions' => ['Adicionar resultados mensuráveis'],
            'provider'           => 'openai', 'model' => 'demo-model', 'prompt_version' => 'resume-v1',
            'input_tokens'       => 1800, 'output_tokens' => 650, 'estimated_cost' => 0, 'failure_reason' => null,
            'raw_response'       => null, 'started_at' => now()->subSeconds(5), 'completed_at' => now(),
        ];
    }
}
