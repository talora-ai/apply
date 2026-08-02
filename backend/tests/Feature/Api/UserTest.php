<?php

declare(strict_types=1);

use App\Models\User;

describe('GET /api/user', function (): void {
    it('returns the authenticated user', function (): void {
        $user = User::factory()->create();
        $token = $user->createToken('test-client');

        $response = $this
            ->withToken($token->plainTextToken)
            ->getJson('/api/user');

        $response
            ->assertOk()
            ->assertJsonPath('id', $user->id)
            ->assertJsonPath('email', $user->email)
            ->assertJsonMissingPath('password')
            ->assertJsonMissingPath('remember_token');
    });

    it('rejects an unauthenticated request', function (): void {
        $this->getJson('/api/user')
            ->assertUnauthorized();
    });
});
