<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\SubscriptionPlan;
use Illuminate\Database\Seeder;

final class SubscriptionPlanSeeder extends Seeder
{
    public function run(): void
    {
        foreach ([
            [
                'name' => 'Free', 'slug' => 'free', 'description' => 'Recursos essenciais para começar.',
                'price' => 0, 'features' => ['1 currículo', 'Pesquisas manuais', 'Análise básica'], 'sort_order' => 1,
            ],
            [
                'name' => 'Premium', 'slug' => 'premium', 'description' => 'Automação e análises avançadas para acelerar sua carreira.',
                'price' => 39.90, 'features' => ['Currículos ilimitados', 'Candidatura automática', 'Análises avançadas', 'Prioridade de processamento'], 'sort_order' => 2,
            ],
        ] as $plan) {
            SubscriptionPlan::query()->updateOrCreate(
                ['slug' => $plan['slug']],
                [...$plan, 'currency' => 'BRL', 'billing_interval' => 'monthly', 'billing_interval_count' => 1, 'is_active' => true],
            );
        }
    }
}
