<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\Auth;

use App\Helpers\ResponseApi;
use App\Http\ApiRequests\Auth\RegisterRequest;
use App\Models\User;
use Throwable;

class RegisterController
{
    public function __invoke(RegisterRequest $request)
    {
        try {

            User::create($request->all());
            
            return ResponseApi::success('User created', [
                'message' => 'User has been created!'
            ], 201);
    
        } catch (Throwable $exception) {
            report($exception);

            return ResponseApi::error($exception->getMessage(), [
                'class'     => __CLASS__,
                'exception' => $exception,
            ], 500);
        }
    }
}
