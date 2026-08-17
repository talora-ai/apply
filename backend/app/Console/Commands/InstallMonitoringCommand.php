<?php

declare(strict_types=1);

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\File;

final class InstallMonitoringCommand extends Command
{
    protected $signature = 'talora:install-monitoring';
    protected $description = 'Publica e configura Laravel Horizon e Pulse para o guard administrativo.';

    public function handle(): int
    {
        if (! class_exists(\Laravel\Horizon\Horizon::class) || ! class_exists(\Laravel\Pulse\Pulse::class)) {
            $this->error('Instale as dependências primeiro: composer update laravel/horizon laravel/pulse --with-all-dependencies');
            return self::FAILURE;
        }

        if (! File::exists(config_path('horizon.php'))) {
            Artisan::call('horizon:install', ['--ansi' => true]);
            $this->line(Artisan::output());
        }

        if (! File::exists(config_path('pulse.php'))) {
            Artisan::call('vendor:publish', [
                '--provider' => 'Laravel\\Pulse\\PulseServiceProvider',
                '--force' => true,
            ]);
            $this->line(Artisan::output());

            Artisan::call('vendor:publish', ['--tag' => 'pulse-config', '--force' => true]);
            $this->line(Artisan::output());
        }

        $this->secureHorizonProvider();
        $this->secureHorizon();
        $this->securePulse();

        $this->info('Pulse e Horizon publicados e protegidos pelo guard admin. Execute php artisan migrate.');
        return self::SUCCESS;
    }


    private function secureHorizonProvider(): void
    {
        $path = app_path('Providers/HorizonServiceProvider.php');
        File::put($path, <<<'PHP'
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
PHP
        );
    }

    private function secureHorizon(): void
    {
        $path = config_path('horizon.php');
        if (! File::exists($path)) return;
        $content = File::get($path);
        $content = str_replace("'middleware' => ['web'],", "'middleware' => ['web', 'auth:admin'],", $content);
        File::put($path, $content);
    }

    private function securePulse(): void
    {
        $path = config_path('pulse.php');
        if (! File::exists($path)) return;
        $content = File::get($path);

        if (! str_contains($content, "Laravel\\Pulse\\Http\\Middleware\\Authorize")) {
            $content = str_replace("<?php", "<?php\n\nuse Laravel\\Pulse\\Http\\Middleware\\Authorize;", $content);
        }

        $content = preg_replace(
            "/'middleware'\\s*=>\\s*\\[[^\\]]*\\]/s",
            "'middleware' => ['web', 'auth:admin', Authorize::class]",
            $content,
            1,
        ) ?? $content;

        File::put($path, $content);
    }
}
