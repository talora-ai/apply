<?php

declare(strict_types=1);

use App\Http\Controllers\Api\Auth\ForgotPasswordController;
use App\Http\Controllers\Api\Auth\LoginController;
use App\Http\Controllers\Api\Auth\LogoutController;
use App\Http\Controllers\Api\Auth\RegisterController;
use App\Http\Controllers\Api\Auth\ResetPasswordController;
use App\Http\Controllers\Api\Client\Resumes\ResumeController;
use App\Http\Controllers\Api\Client\Account\AccountController;
use App\Http\Controllers\Api\Client\Platform\PlatformDataController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::prefix('auth')->group(function (): void {
    Route::post('/login', LoginController::class);
    Route::post('/register', RegisterController::class);

    Route::post('/logout', LogoutController::class)
        ->middleware('auth:sanctum');

    Route::post('/forgot-password', ForgotPasswordController::class)
        ->middleware('throttle:5,1');

    Route::post('/reset-password', ResetPasswordController::class)
        ->middleware('throttle:5,1');
});

Route::middleware('auth:sanctum')
    ->prefix('client')
    ->group(function (): void {
        Route::get('/user', function (Request $request) {
            return $request->user();
        });

        Route::patch('/user', [AccountController::class, 'updateProfile']);
        Route::put('/user/password', [AccountController::class, 'updatePassword']);

        Route::apiResource('user/resumes', ResumeController::class)
            ->only(['index', 'store', 'show', 'destroy']);
        Route::patch('/user/resumes/{resume}/primary', [ResumeController::class, 'setPrimary']);

        Route::get('/dashboard', [PlatformDataController::class, 'dashboard']);
        Route::get('/jobs', [PlatformDataController::class, 'jobs']);
        Route::get('/applications', [PlatformDataController::class, 'applications']);
        Route::get('/favorites', [PlatformDataController::class, 'favorites']);
        Route::post('/jobs/{job}/favorite', [PlatformDataController::class, 'storeFavorite']);
        Route::delete('/jobs/{job}/favorite', [PlatformDataController::class, 'destroyFavorite']);
        Route::get('/analytics', [PlatformDataController::class, 'analytics']);
        Route::get('/billing', [PlatformDataController::class, 'billing']);
    });
