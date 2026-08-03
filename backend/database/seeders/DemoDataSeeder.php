<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Company;
use App\Models\JobApplication;
use App\Models\JobCompatibilityAnalysis;
use App\Models\JobFavorite;
use App\Models\JobPosting;
use App\Models\JobSource;
use App\Models\PaymentTransaction;
use App\Models\ResumeAnalysis;
use App\Models\SubscriptionPlan;
use App\Models\User;
use App\Models\UserResume;
use App\Models\UserSubscription;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

final class DemoDataSeeder extends Seeder
{
    public function run(): void
    {
        $sources = JobSource::query()->where('is_active', true)->get();
        $plans = SubscriptionPlan::query()->where('is_active', true)->get();

        $companies = Company::factory()->count(8)->create();

        $companies->each(function (Company $company) use ($sources): void {
            JobPosting::factory()
                ->count(5)
                ->state(fn (): array => [
                    'company_id'    => $company->id,
                    'job_source_id' => $sources->random()->id,
                ])
                ->create();
        });

        $demoUser = User::query()->firstOrCreate(
            ['email' => 'demo@talora.com.br'],
            [
                'name'              => 'Gustavo',
                'last_name'         => 'Martim',
                'password'          => Hash::make('password'),
                'email_verified_at' => now(),
            ],
        );

        $users = User::factory()->count(9)->create()->prepend($demoUser);

        $users->each(function (User $user) use ($plans): void {
            $resume = UserResume::factory()->create([
                'user_id'    => $user->id,
                'name'       => 'Currículo principal',
                'is_primary' => true,
            ]);

            $resumeAnalysis = ResumeAnalysis::factory()->create([
                'user_id'        => $user->id,
                'user_resume_id' => $resume->id,
            ]);

            $jobs = JobPosting::query()->inRandomOrder()->limit(6)->get();

            $analyses = $jobs->map(
                fn (JobPosting $job): JobCompatibilityAnalysis => JobCompatibilityAnalysis::factory()->create([
                    'user_id'            => $user->id,
                    'user_resume_id'     => $resume->id,
                    'job_posting_id'     => $job->id,
                    'resume_analysis_id' => $resumeAnalysis->id,
                ]),
            );

            $jobs->take(3)->each(
                fn (JobPosting $job): JobFavorite => JobFavorite::factory()->create([
                    'user_id'        => $user->id,
                    'job_posting_id' => $job->id,
                ]),
            );

            $analyses->sortByDesc('overall_score')->take(2)->each(
                function (JobCompatibilityAnalysis $analysis) use ($user, $resume): void {
                    $application = JobApplication::factory()->create([
                        'user_id'             => $user->id,
                        'user_resume_id'      => $resume->id,
                        'job_posting_id'      => $analysis->job_posting_id,
                        'compatibility_score' => $analysis->overall_score,
                        'is_automatic'        => (float) $analysis->overall_score >= 90,
                    ]);

                    $application->events()->createMany([
                        ['status' => 'pending', 'description' => 'Candidatura criada.', 'occurred_at' => now()->subMinute()],
                        ['status' => 'submitted', 'description' => 'Candidatura enviada.', 'occurred_at' => now()],
                    ]);
                },
            );

            $plan = $user->email === 'demo@talora.com.br'
                ? $plans->firstWhere('slug', 'premium')
                : $plans->random();

            $subscription = UserSubscription::factory()->create([
                'user_id'                  => $user->id,
                'subscription_plan_id'     => $plan->id,
                'provider'                 => $plan->price > 0 ? 'stripe' : null,
                'provider_customer_id'     => $plan->price > 0 ? fake()->uuid() : null,
                'provider_subscription_id' => $plan->price > 0 ? fake()->uuid() : null,
            ]);

            if ((float) $plan->price > 0) {
                PaymentTransaction::factory()->create([
                    'user_id'              => $user->id,
                    'user_subscription_id' => $subscription->id,
                    'amount'               => $plan->price,
                    'currency'             => $plan->currency,
                ]);
            }
        });
    }
}
