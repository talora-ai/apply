<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\Auth;

use App\Helpers\ResponseApi;
use App\Http\ApiRequests\Auth\ResetPasswordRequest;
use App\Http\Controllers\Controller;
use App\Models\User;
use Exception;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;

class ResetPasswordController extends Controller
{
    public function __invoke(ResetPasswordRequest $request): JsonResponse
    {
        try {
            $credentials = $request->validated();

            $status = Password::broker()->reset(
                $credentials,
                function (User $user, string $password): void {
                    $user->forceFill([
                        'password'       => Hash::make($password),
                        'remember_token' => Str::random(60),
                    ])->save();

                    $user->tokens()->delete();

                    event(new PasswordReset($user));
                }
            );

            if ($status !== Password::PASSWORD_RESET) {
                return ResponseApi::error('Password reset failed.', [
                    'message' => $this->getErrorMessage($status),
                ], 422);
            }

            return ResponseApi::success('Password reset successfully.', [
                'message' => 'Your password has been reset. You can now log in.',
            ]);
        } catch (Exception $exception) {
            report($exception);

            return ResponseApi::error('An unexpected error occurred.', [
                'message' => 'Unable to reset password.',
            ], 500);
        }
    }

    private function getErrorMessage(string $status): string
    {
        return match ($status) {
            Password::INVALID_TOKEN   => 'The password reset token is invalid or has expired.',
            Password::INVALID_USER    => 'The provided email address is invalid.',
            Password::RESET_THROTTLED => 'Please wait before trying again.',
            default                   => 'Unable to reset password.',
        };
    }
}
