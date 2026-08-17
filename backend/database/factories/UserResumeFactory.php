<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Enums\UserResumeStatus;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

final class UserResumeFactory extends Factory
{
    public function definition(): array
    {
        $filename = Str::slug(fake()->name()) . '-resume.pdf';

        return ['user_id' => User::factory(), 'name' => 'Currículo principal', 'original_filename' => $filename, 'disk' => 'local', 'path' => 'resumes/demo/' . $filename, 'mime_type' => 'application/pdf', 'size' => fake()->numberBetween(50_000, 500_000), 'status' => UserResumeStatus::Completed, 'is_primary' => false, 'extracted_text' => fake()->paragraphs(6, true), 'metadata' => null, 'processed_at' => now()];
    }
}
