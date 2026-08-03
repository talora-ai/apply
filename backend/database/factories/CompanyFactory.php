<?php

declare(strict_types=1);

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

final class CompanyFactory extends Factory
{
    public function definition(): array
    {
        $name = fake()->unique()->company();

        return ['name' => $name, 'slug' => Str::slug($name), 'logo_url' => null, 'website_url' => fake()->url(), 'description' => fake()->paragraph()];
    }
}
