<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Redis;
use Illuminate\Support\Facades\Schema;
use Illuminate\View\View;
use Throwable;

final class MonitoringController extends Controller
{
    public function index(): View
    {
        $redis = ['ok' => false, 'message' => 'Indisponível'];

        try {
            $pong = Redis::connection()->ping();
            $redis = ['ok' => true, 'message' => is_string($pong) ? $pong : 'PONG'];
        } catch (Throwable $exception) {
            $redis['message'] = $exception->getMessage();
        }

        $failedJobs = collect();
        $databaseJobs = collect();

        if (Schema::hasTable('failed_jobs')) {
            $failedJobs = DB::table('failed_jobs')->latest('failed_at')->limit(10)->get();
        }

        if (Schema::hasTable('jobs')) {
            $databaseJobs = DB::table('jobs')->orderByDesc('id')->limit(10)->get();
        }

        return view('admin.monitoring.index', [
            'redis' => $redis,
            'queueConnection' => config('queue.default'),
            'failedJobs' => $failedJobs,
            'databaseJobs' => $databaseJobs,
            'pulseInstalled' => class_exists(\Laravel\Pulse\Pulse::class),
            'horizonInstalled' => class_exists(\Laravel\Horizon\Horizon::class),
        ]);
    }

    public function retryFailed(string $uuid): RedirectResponse
    {
        Artisan::call('queue:retry', ['id' => [$uuid]]);
        return back()->with('success', 'Job enviado novamente para a fila.');
    }

    public function forgetFailed(string $uuid): RedirectResponse
    {
        Artisan::call('queue:forget', ['id' => $uuid]);
        return back()->with('success', 'Job falho removido.');
    }
}
