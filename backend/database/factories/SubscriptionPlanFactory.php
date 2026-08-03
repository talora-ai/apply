<?php

declare(strict_types=1);

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

final class SubscriptionPlanFactory extends Factory
{
    public function definition(): array
    {
        $name = fake()->unique()->words(2, true);

        return ['name' => Str::title($name), 'slug' => Str::slug($name), 'description' => fake()->sentence(), 'price' => fake()->randomFloat(2, 0, 99), 'currency' => 'BRL', 'billing_interval' => 'monthly', 'billing_interval_count' => 1, 'features' => [], 'is_active' => true, 'sort_order' => 0];
    }
}
