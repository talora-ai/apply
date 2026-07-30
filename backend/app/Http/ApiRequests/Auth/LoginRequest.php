<?php

declare(strict_types=1);

namespace App\Http\ApiRequests\Auth;

use App\Http\ApiRequests\CustomRequest;

class LoginRequest extends CustomRequest
{
    public function rules(): array
    {
        return [

            'email' => [
                'required',
                'min:5',
                'max:198',
                'email',
            ],

            'password' => [
                'required',
                'min:8',
                'max:32',
            ],

            'remember' => [
                'boolean',
            ],
        ];
    }
}
