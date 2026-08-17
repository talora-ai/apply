<?php

declare(strict_types=1);

namespace App\Providers;

use App\Models\Admin;
use Illuminate\Support\Facades\Gate;
use Laravel\Horizon\HorizonApplicationServiceProvider;

final class HorizonServiceProvider extends HorizonApplicationServiceProvider
{
    protected function gate(): void
    {
        Gate::define('viewHorizon', fn (Admin $admin): bool => $admin->is_active);
    }
}