<?php

declare(strict_types=1);

use App\Mail\WelcomeMail;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;

describe('POST /api/auth/register', function (): void {
    beforeEach(function (): void {
        Mail::fake();
    });

    it('registers a user and queues the welcome email', function (): void {
        $payload = [
            'name'                  => 'Gustavo',
            'last_name'             => 'Martim',
            'email'                 => 'gustavo@example.com',
            'password'              => 'password123',
            'password_confirmation' => 'password123',
        ];

        $response = $this->postJson('/api/auth/register', $payload);

        $response
            ->assertCreated()
            ->assertExactJson([
                'code'    => 201,
                'message' => 'User created',
                'data'    => [
                    'message' => 'User has been created!',
                ],
            ])
            ->assertJsonMissingPath('data.token');

        $user = User::query()
            ->where('email', $payload['email'])
            ->firstOrFail();

        expect($user->name)->toBe($payload['name'])
            ->and($user->last_name)->toBe($payload['last_name'])
            ->and(Hash::check($payload['password'], $user->password))->toBeTrue()
            ->and($user->tokens()->count())->toBe(0);

        Mail::assertQueued(
            WelcomeMail::class,
            fn (WelcomeMail $mail): bool => $mail->user->is($user)
                && $mail->hasTo($user->email)
        );
    });

    it('rejects an already registered email', function (): void {
        $user = User::factory()->create();

        $response = $this->postJson('/api/auth/register', [
            'name'                  => 'Gustavo',
            'last_name'             => 'Martim',
            'email'                 => $user->email,
            'password'              => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response
            ->assertUnprocessable()
            ->assertJsonPath('code', 422)
            ->assertJsonPath('message', 'Data validation errors')
            ->assertJsonValidationErrors(['email'], 'data.errors');

        expect(User::query()->where('email', $user->email)->count())->toBe(1);

        Mail::assertNothingQueued();
    });

    it('requires all registration fields', function (): void {
        $response = $this->postJson('/api/auth/register');

        $response
            ->assertUnprocessable()
            ->assertJsonPath('code', 422)
            ->assertJsonPath('message', 'Data validation errors')
            ->assertJsonValidationErrors(
                ['name', 'last_name', 'email', 'password'],
                'data.errors'
            );

        Mail::assertNothingQueued();
    });

    it('requires password confirmation to match', function (): void {
        $response = $this->postJson('/api/auth/register', [
            'name'                  => 'Gustavo',
            'last_name'             => 'Martim',
            'email'                 => 'gustavo@example.com',
            'password'              => 'password123',
            'password_confirmation' => 'different-password',
        ]);

        $response
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['password'], 'data.errors');

        $this->assertDatabaseMissing('users', [
            'email' => 'gustavo@example.com',
        ]);

        Mail::assertNothingQueued();
    });
});
