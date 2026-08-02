<?php

declare(strict_types=1);

use App\Models\User;
use Illuminate\Support\Facades\Hash;

describe('POST /api/auth/login', function (): void {
    it('authenticates a user and returns a Sanctum token', function (): void {
        $user = User::factory()->create([
            'email'    => 'gustavo@example.com',
            'password' => Hash::make('password123'),
        ]);

        $response = $this->postJson('/api/auth/login', [
            'email'    => $user->email,
            'password' => 'password123',
        ]);

        $response
            ->assertOk()
            ->assertJsonPath('code', 200)
            ->assertJsonPath('message', 'Authorized!')
            ->assertJsonPath('data.type', 'Bearer')
            ->assertJsonStructure([
                'code',
                'message',
                'data' => ['type', 'token'],
            ]);

        expect($response->json('data.token'))->toBeString()->not->toBeEmpty()
            ->and($user->tokens()->count())->toBe(1)
            ->and($user->refresh()->last_login)->not->toBeNull();
    });

    it('rejects invalid credentials without creating a token', function (): void {
        $user = User::factory()->create([
            'password' => Hash::make('password123'),
        ]);

        $response = $this->postJson('/api/auth/login', [
            'email'    => $user->email,
            'password' => 'wrong-password',
        ]);

        $response
            ->assertUnauthorized()
            ->assertExactJson([
                'code'    => 401,
                'message' => 'Unauthenticated',
                'data'    => [
                    'code'    => 'AUTH_INVALID_CREDENTIALS',
                    'message' => 'Invalid credentials.',
                ],
            ]);

        expect($user->tokens()->count())->toBe(0)
            ->and($user->refresh()->last_login)->toBeNull();
    });

    it('does not reveal whether an email exists', function (): void {
        $response = $this->postJson('/api/auth/login', [
            'email'    => 'unknown@example.com',
            'password' => 'password123',
        ]);

        $response
            ->assertUnauthorized()
            ->assertJsonPath('data.code', 'AUTH_INVALID_CREDENTIALS')
            ->assertJsonPath('data.message', 'Invalid credentials.');
    });

    it('validates the login payload', function (array $payload, array $errors): void {
        $response = $this->postJson('/api/auth/login', $payload);

        $response
            ->assertUnprocessable()
            ->assertJsonPath('code', 422)
            ->assertJsonPath('message', 'Data validation errors')
            ->assertJsonValidationErrors($errors, 'data.errors');
    })->with([
        'empty payload' => [[], ['email', 'password']],
        'invalid email' => [[
            'email'    => 'invalid-email',
            'password' => 'password123',
        ], ['email']],
        'short password' => [[
            'email'    => 'gustavo@example.com',
            'password' => 'short',
        ], ['password']],
        'invalid remember value' => [[
            'email'    => 'gustavo@example.com',
            'password' => 'password123',
            'remember' => 'not-a-boolean',
        ], ['remember']],
    ]);
});
