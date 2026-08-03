<?php

declare(strict_types=1);

use App\Http\Controllers\Api\Auth\ForgotPasswordController;
use App\Http\Controllers\Api\Auth\LoginController;
use App\Http\Controllers\Api\Auth\LogoutController;
use App\Http\Controllers\Api\Auth\RegisterController;
use App\Http\Controllers\Api\Auth\ResetPasswordController;
use App\Http\Controllers\Api\Client\Resumes\ResumeController;
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

        Route::apiResource('user/resumes', ResumeController::class)
            ->only(['index', 'store', 'show', 'destroy']);
    });
