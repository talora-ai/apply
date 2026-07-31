<?php

declare(strict_types=1);

namespace App\Http\ApiRequests\Auth;

use App\Http\ApiRequests\CustomRequest;

class ResetPasswordRequest extends CustomRequest
{
    public function rules(): array
    {
        return [
            'email' => [
                'required',
                'email',
                'max:198',
            ],
            'token' => [
                'required',
                'string',
            ],
            'password' => [
                'required',
                'string',
                'min:8',
                'max:32',
                'confirmed',
            ],
        ];
    }
}
