<?php

declare(strict_types=1);

namespace App\Http\ApiRequests\Auth;

use App\Http\ApiRequests\CustomRequest;
use Illuminate\Validation\Rule;

class ForgotPasswordRequest extends CustomRequest
{
    protected function prepareForValidation(): void
    {
        $this->merge([
            'email' => mb_strtolower(
                trim((string) $this->input('email'))
            ),
        ]);
    }

    public function rules(): array
    {
        return [
            'email' => [
                'bail',
                'required',
                'string',
                'email',
                'max:198',
            ],
            'client' => [
                'sometimes',
                'string',
                Rule::in([
                    'web',
                    'mobile',
                ]),
            ],
        ];
    }
}
