<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\Auth;

use App\Helpers\ResponseApi;
use App\Http\ApiRequests\Auth\LoginRequest;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Throwable;

class LoginController
{
    public function __invoke(LoginRequest $request): JsonResponse
    {
        try {
            $user = User::query()
                ->select(['id', 'email', 'password'])
                ->where('email', $request->validated('email'))
                ->first();

            if (
                ! $user ||
                ! Hash::check(
                    $request->validated('password'),
                    $user->password
                )
            ) {
                return ResponseApi::error('Unauthenticated', [
                    'code'    => 'AUTH_INVALID_CREDENTIALS',
                    'message' => 'Invalid credentials.',
                ], 401);
            }

            $user->update([
                'last_login' => now(),
            ]);

            return ResponseApi::success('Authorized!', [
                'type'  => 'Bearer',
                'token' => $user
                    ->createToken($user->email, ['*'])
                    ->plainTextToken,
            ]);
        } catch (Throwable $exception) {
            report($exception);

            return ResponseApi::error('Authentication failed.', [
                'message' => 'An unexpected error occurred.',
            ], 500);
        }
    }
}
