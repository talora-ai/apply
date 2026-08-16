<?php

declare(strict_types=1);

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

final class JobSourceFactory extends Factory
{
    public function definition(): array
    {
        $name = fake()->unique()->company() . ' Jobs';

        return ['name' => $name, 'slug' => Str::slug($name), 'base_url' => fake()->url(), 'is_active' => true, 'configuration' => null];
    }
}
