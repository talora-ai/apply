<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\Auth;

use App\Helpers\ResponseApi;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LogoutController
{
    public function __invoke(
        Request $request
    ): JsonResponse {
        $request
            ->user()
            ?->currentAccessToken()
            ?->delete();

        return ResponseApi::success(
            'Successfully logged out.'
        );
    }
}
