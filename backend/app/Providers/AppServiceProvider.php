<?php

declare(strict_types=1);

namespace App\Providers;

use App\Contracts\Bots\ResumeBotClient;
use App\Models\UserResume;
use App\Policies\UserResumePolicy;
use App\Services\Bots\HttpResumeBotClient;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->bind(ResumeBotClient::class, HttpResumeBotClient::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Gate::policy(UserResume::class, UserResumePolicy::class);
    }
}
