<?php

declare(strict_types=1);

use App\Http\Controllers\Admin\Auth\LoginController as AdminLoginController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\MonitoringController;
use App\Http\Controllers\Admin\ResourceController;
use Illuminate\Support\Facades\Route;

Route::get('/', fn () => redirect()->route('admin.login'));

Route::prefix('admin')->name('admin.')->group(function (): void {
    Route::middleware('guest:admin')->group(function (): void {
        Route::get('/login', [AdminLoginController::class, 'create'])->name('login');
        Route::post('/login', [AdminLoginController::class, 'store'])->middleware('throttle:5,1')->name('login.store');
    });

    Route::middleware('auth:admin')->group(function (): void {
        Route::post('/logout', [AdminLoginController::class, 'destroy'])->name('logout');
        Route::get('/', DashboardController::class)->name('dashboard');

        Route::get('/monitoring', [MonitoringController::class, 'index'])->name('monitoring.index');
        Route::post('/monitoring/failed/{uuid}/retry', [MonitoringController::class, 'retryFailed'])->name('monitoring.failed.retry');
        Route::delete('/monitoring/failed/{uuid}', [MonitoringController::class, 'forgetFailed'])->name('monitoring.failed.forget');

        Route::prefix('resources')->name('resources.')->group(function (): void {
            Route::get('/{resource}', [ResourceController::class, 'index'])->name('index');
            Route::get('/{resource}/create', [ResourceController::class, 'create'])->name('create');
            Route::post('/{resource}', [ResourceController::class, 'store'])->name('store');
            Route::get('/{resource}/{id}', [ResourceController::class, 'show'])->whereNumber('id')->name('show');
            Route::get('/{resource}/{id}/edit', [ResourceController::class, 'edit'])->whereNumber('id')->name('edit');
            Route::put('/{resource}/{id}', [ResourceController::class, 'update'])->whereNumber('id')->name('update');
            Route::delete('/{resource}/{id}', [ResourceController::class, 'destroy'])->whereNumber('id')->name('destroy');
        });
    });
});
