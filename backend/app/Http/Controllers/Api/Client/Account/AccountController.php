<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\Client\Account;

use App\Helpers\ResponseApi;
use App\Http\ApiRequests\Client\Account\UpdatePasswordRequest;
use App\Http\ApiRequests\Client\Account\UpdateProfileRequest;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;

final class AccountController extends Controller
{
    public function updateProfile(UpdateProfileRequest $request): JsonResponse
    {
        $user = $request->user();
        $user->update($request->safe()->only(['name', 'last_name']));

        return ResponseApi::success('Profile updated successfully.', [
            'user' => $user->fresh()->only(['id', 'name', 'last_name', 'email']),
        ]);
    }

    public function updatePassword(UpdatePasswordRequest $request): JsonResponse
    {
        $user = $request->user();

        if (! Hash::check($request->string('current_password')->toString(), $user->password)) {
            return ResponseApi::error(
                'Validation failed.',
                ['message' => 'The current password is incorrect.'],
                422,
            );
        }

        $user->update([
            'password' => $request->string('password')->toString(),
        ]);

        $user->tokens()->where('id', '!=', $request->user()->currentAccessToken()?->id)->delete();

        return ResponseApi::success('Password updated successfully.');
    }
}
