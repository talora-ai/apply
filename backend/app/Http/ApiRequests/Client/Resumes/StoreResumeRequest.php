<?php

declare(strict_types=1);

namespace App\Http\ApiRequests\Client\Resumes;

use App\Http\ApiRequests\CustomRequest;
use Illuminate\Validation\Rules\File;

final class StoreResumeRequest extends CustomRequest
{
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'min:2', 'max:198'],
            'file' => ['required', File::types(['pdf', 'docx'])->max('10mb')],
        ];
    }
}
