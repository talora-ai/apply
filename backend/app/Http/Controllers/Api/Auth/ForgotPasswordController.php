<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\Auth;

use App\Helpers\ResponseApi;
use App\Http\ApiRequests\Auth\ForgotPasswordRequest;
use App\Http\Controllers\Controller;
use App\Mail\ForgotPasswordMail;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Password;
use Throwable;

class ForgotPasswordController extends Controller
{
    public function __invoke(
        ForgotPasswordRequest $request
    ): JsonResponse {
        try {
            $email = $request->string('email')->toString();

            $user = User::query()
                ->where('email', $email)
                ->first();

            if ($user) {
                $token = Password::broker()->createToken($user);

                $resetUrl = $this->createResetUrl(
                    token: $token,
                    email: $email,
                );

                Mail::to($user->email)->queue(
                    new ForgotPasswordMail(
                        user: $user,
                        resetUrl: $resetUrl,
                    )
                );
            }

            return ResponseApi::success(
                'If the email is registered, password reset instructions will be sent.',
                []
            );
        } catch (Throwable $exception) {
            report($exception);

            return ResponseApi::error(
                'Failed to process the password reset request.',
                [
                    'class' => self::class,
                ],
                500
            );
        }
    }

    private function createResetUrl(
        string $token,
        string $email,
    ): string {
        $frontendUrl = rtrim(
            (string) config('services.frontend.url'),
            '/'
        );

        $query = http_build_query([
            'token' => $token,
            'email' => $email,
        ]);

        return "{$frontendUrl}/reset-password?{$query}";
    }
}
