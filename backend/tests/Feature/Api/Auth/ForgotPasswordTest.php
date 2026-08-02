<?php

declare(strict_types=1);

use App\Mail\ForgotPasswordMail;
use App\Models\User;
use Illuminate\Support\Facades\Mail;

describe('POST /api/auth/forgot-password', function (): void {
    beforeEach(function (): void {
        Mail::fake();
    });

    it('queues password reset instructions for a registered email', function (): void {
        config()->set('services.frontend.url', 'https://apply.talora.test');

        $user = User::factory()->create([
            'email' => 'gustavo@example.com',
        ]);

        $response = $this->postJson('/api/auth/forgot-password', [
            'email'  => '  GUSTAVO@EXAMPLE.COM  ',
            'client' => 'web',
        ]);

        $response
            ->assertOk()
            ->assertExactJson([
                'code'    => 200,
                'message' => 'If the email is registered, password reset instructions will be sent.',
                'data'    => [],
            ]);

        Mail::assertQueued(
            ForgotPasswordMail::class,
            fn (ForgotPasswordMail $mail): bool => $mail->user->is($user)
                && $mail->hasTo($user->email)
                && str_starts_with(
                    $mail->resetUrl,
                    'https://apply.talora.test/reset-password?'
                )
                && str_contains($mail->resetUrl, 'token=')
                && str_contains(
                    $mail->resetUrl,
                    'email=' . urlencode($user->email)
                )
        );

        $this->assertDatabaseHas('password_reset_tokens', [
            'email' => $user->email,
        ]);
    });

    it('builds a deep link for the mobile client', function (): void {
        config()->set('services.mobile.url', 'talora-apply://');

        $user = User::factory()->create();

        $this->postJson('/api/auth/forgot-password', [
            'email'  => $user->email,
            'client' => 'mobile',
        ])->assertOk();

        Mail::assertQueued(
            ForgotPasswordMail::class,
            fn (ForgotPasswordMail $mail): bool => str_starts_with(
                $mail->resetUrl,
                'talora-apply://reset-password?'
            )
        );
    });

    it('does not reveal that an email is not registered', function (): void {
        $response = $this->postJson('/api/auth/forgot-password', [
            'email' => 'unknown@example.com',
        ]);

        $response
            ->assertOk()
            ->assertExactJson([
                'code'    => 200,
                'message' => 'If the email is registered, password reset instructions will be sent.',
                'data'    => [],
            ]);

        Mail::assertNothingQueued();
    });

    it('validates the forgot password payload', function (array $payload, array $errors): void {
        $response = $this->postJson('/api/auth/forgot-password', $payload);

        $response
            ->assertUnprocessable()
            ->assertJsonPath('code', 422)
            ->assertJsonPath('message', 'Data validation errors')
            ->assertJsonValidationErrors($errors, 'data.errors');

        Mail::assertNothingQueued();
    })->with([
        'email is required'        => [[], ['email']],
        'email must be valid'      => [['email' => 'invalid-email'], ['email']],
        'client must be supported' => [[
            'email'  => 'gustavo@example.com',
            'client' => 'desktop',
        ], ['client']],
    ]);
});
