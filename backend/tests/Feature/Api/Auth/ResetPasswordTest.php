<?php

declare(strict_types=1);

use App\Models\User;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;

describe('POST /api/auth/reset-password', function (): void {
    it('resets the password, revokes tokens and dispatches the event', function (): void {
        Event::fake([PasswordReset::class]);

        $user = User::factory()->create([
            'email'    => 'gustavo@example.com',
            'password' => Hash::make('old-password'),
        ]);
        $user->createToken('web');
        $user->createToken('mobile');

        $token = Password::broker()->createToken($user);

        $response = $this->postJson('/api/auth/reset-password', [
            'email'                 => $user->email,
            'token'                 => $token,
            'password'              => 'new-password123',
            'password_confirmation' => 'new-password123',
        ]);

        $response
            ->assertOk()
            ->assertExactJson([
                'code'    => 200,
                'message' => 'Password reset successfully.',
                'data'    => [
                    'message' => 'Your password has been reset. You can now log in.',
                ],
            ]);

        $user->refresh();

        expect(Hash::check('new-password123', $user->password))->toBeTrue()
            ->and(Hash::check('old-password', $user->password))->toBeFalse()
            ->and($user->tokens()->count())->toBe(0)
            ->and($user->remember_token)->not->toBeNull();

        $this->assertDatabaseMissing('password_reset_tokens', [
            'email' => $user->email,
        ]);

        Event::assertDispatched(
            PasswordReset::class,
            fn (PasswordReset $event): bool => $event->user->is($user)
        );
    });

    it('rejects an invalid token without changing the password', function (): void {
        $user = User::factory()->create([
            'password' => Hash::make('old-password'),
        ]);

        $response = $this->postJson('/api/auth/reset-password', [
            'email'                 => $user->email,
            'token'                 => 'invalid-token',
            'password'              => 'new-password123',
            'password_confirmation' => 'new-password123',
        ]);

        $response
            ->assertUnprocessable()
            ->assertJsonPath('code', 422)
            ->assertJsonPath('message', 'Password reset failed.')
            ->assertJsonPath(
                'data.message',
                'The password reset token is invalid or has expired.'
            );

        expect(Hash::check('old-password', $user->refresh()->password))->toBeTrue();
    });

    it('rejects an unknown email', function (): void {
        $response = $this->postJson('/api/auth/reset-password', [
            'email'                 => 'unknown@example.com',
            'token'                 => 'some-token',
            'password'              => 'new-password123',
            'password_confirmation' => 'new-password123',
        ]);

        $response
            ->assertUnprocessable()
            ->assertJsonPath('message', 'Password reset failed.')
            ->assertJsonPath(
                'data.message',
                'The provided email address is invalid.'
            );
    });

    it('validates the reset password payload', function (array $payload, array $errors): void {
        $response = $this->postJson('/api/auth/reset-password', $payload);

        $response
            ->assertUnprocessable()
            ->assertJsonPath('code', 422)
            ->assertJsonPath('message', 'Data validation errors')
            ->assertJsonValidationErrors($errors, 'data.errors');
    })->with([
        'empty payload' => [[], ['email', 'token', 'password']],
        'invalid email' => [[
            'email'                 => 'invalid-email',
            'token'                 => 'token',
            'password'              => 'new-password123',
            'password_confirmation' => 'new-password123',
        ], ['email']],
        'password confirmation mismatch' => [[
            'email'                 => 'gustavo@example.com',
            'token'                 => 'token',
            'password'              => 'new-password123',
            'password_confirmation' => 'different-password',
        ], ['password']],
        'password is too short' => [[
            'email'                 => 'gustavo@example.com',
            'token'                 => 'token',
            'password'              => 'short',
            'password_confirmation' => 'short',
        ], ['password']],
    ]);
});
