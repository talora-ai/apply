<?php

declare(strict_types=1);

namespace App\Http\ApiRequests\Auth;

use App\Http\ApiRequests\CustomRequest;

class RegisterRequest extends CustomRequest
{
    public function rules(): array
    {
        return [
            'name' => [
                'required',
                'min:2',
                'max:198',
            ],
            'last_name' => [
                'required',
                'min:2',
                'max:198',
            ],
            'email' => [
                'required',
                'min:5',
                'max:198',
                'unique:users,email',
            ],
            'password' => [
                'required',
                'min:8',
                'max:32',
                'confirmed',
            ],
        ];
    }
}
