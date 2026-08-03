<?php

declare(strict_types=1);

use App\Http\Controllers\Api\Auth\ForgotPasswordController;
use App\Http\Controllers\Api\Auth\LoginController;
use App\Http\Controllers\Api\Auth\LogoutController;
use App\Http\Controllers\Api\Auth\RegisterController;
use App\Http\Controllers\Api\Auth\ResetPasswordController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::prefix('auth')->group(function () {
    Route::post('/login', LoginController::class);
    Route::post('/register', RegisterController::class);

    Route::post('/logout', LogoutController::class)
        ->middleware('auth:sanctum');

    Route::post('/forgot-password', ForgotPasswordController::class)
        ->middleware('throttle:5,1');

    Route::post('/reset-password', ResetPasswordController::class)
        ->middleware('throttle:5,1');
});
