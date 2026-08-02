<?php

declare(strict_types=1);

use App\Models\User;

describe('POST /api/auth/logout', function (): void {
    it('revokes only the token used by the current request', function (): void {
        $user = User::factory()->create();
        $currentToken = $user->createToken('current-device');
        $otherToken = $user->createToken('other-device');

        $response = $this
            ->withToken($currentToken->plainTextToken)
            ->postJson('/api/auth/logout');

        $response
            ->assertOk()
            ->assertExactJson([
                'code'    => 200,
                'message' => 'Successfully logged out.',
                'data'    => [],
            ]);

        $this->assertDatabaseMissing('personal_access_tokens', [
            'id' => $currentToken->accessToken->getKey(),
        ]);

        $this->assertDatabaseHas('personal_access_tokens', [
            'id' => $otherToken->accessToken->getKey(),
        ]);
    });

    it('rejects an unauthenticated request', function (): void {
        $this->postJson('/api/auth/logout')
            ->assertUnauthorized();
    });
});
