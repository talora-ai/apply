<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\Auth;

use App\Helpers\ResponseApi;
use App\Http\ApiRequests\Auth\RegisterRequest;
use App\Mail\WelcomeMail;
use App\Models\User;
use Illuminate\Support\Facades\Mail;
use Throwable;

class RegisterController
{
    public function __invoke(RegisterRequest $request)
    {
        try {

            $user = User::create($request->all());

            Mail::to($user->email)->queue(
                new WelcomeMail($user)
            );

            return ResponseApi::success('User created', [
                'message' => 'User has been created!',
            ], 201);

        } catch (Throwable $exception) {
            report($exception);

            return ResponseApi::error($exception->getMessage(), [
                'message' => 'An unexpected error occurred.',
            ], 500);
        }
    }
}
