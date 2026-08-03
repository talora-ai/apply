<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\SubscriptionPlan;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

final class UserSubscriptionFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id' => User::factory(), 'subscription_plan_id' => SubscriptionPlan::factory(),
            'provider' => 'stripe', 'provider_customer_id' => 'cus_'.Str::lower(Str::random(14)),
            'provider_subscription_id' => 'sub_'.Str::lower(Str::random(14)), 'status' => 'active',
            'starts_at' => now(), 'trial_ends_at' => null, 'current_period_starts_at' => now(),
            'current_period_ends_at' => now()->addMonth(), 'canceled_at' => null, 'ends_at' => null, 'metadata' => null,
        ];
    }
}
