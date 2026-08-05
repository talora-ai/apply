<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\UserSubscription;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

final class PaymentTransactionFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_subscription_id' => UserSubscription::factory(),
            'user_id'              => fn (array $attributes): int => UserSubscription::query()->findOrFail($attributes['user_subscription_id'])->user_id,
            'provider'             => 'stripe', 'provider_transaction_id' => 'pay_' . Str::lower(Str::random(14)),
            'type'                 => 'payment', 'status' => 'paid', 'amount' => 39.90, 'currency' => 'BRL',
            'failure_reason'       => null, 'processed_at' => now(), 'metadata' => null,
        ];
    }
}
