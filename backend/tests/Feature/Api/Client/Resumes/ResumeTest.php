<?php

declare(strict_types=1);

use App\Enums\UserResumeStatus;
use App\Jobs\ProcessUserResumeJob;
use App\Models\User;
use App\Models\UserResume;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Facades\Storage;

describe('client resumes', function (): void {
    beforeEach(function (): void {
        Storage::fake('resumes');
        Queue::fake();
    });

    it('defines every resume processing status', function (): void {
        expect(array_column(UserResumeStatus::cases(), 'value'))->toBe([
            'pending',
            'processing',
            'completed',
            'failed',
        ]);
    });

    it('requires authentication for every resume endpoint', function (): void {
        $resume = UserResume::factory()->create();

        $this->getJson('/api/client/user/resumes')->assertUnauthorized();
        $this->postJson('/api/client/user/resumes')->assertUnauthorized();
        $this->getJson("/api/client/user/resumes/{$resume->id}")->assertUnauthorized();
        $this->deleteJson("/api/client/user/resumes/{$resume->id}")->assertUnauthorized();
    });

    it('lists only resumes owned by the authenticated user', function (): void {
        $user = User::factory()->create();
        $ownResume = UserResume::factory()->for($user)->create();
        $otherResume = UserResume::factory()->create();

        $response = $this
            ->actingAs($user)
            ->getJson('/api/client/user/resumes');

        $response
            ->assertOk()
            ->assertJsonPath('data.resumes.0.id', $ownResume->id)
            ->assertJsonMissing(['id' => $otherResume->id])
            ->assertJsonMissingPath('data.resumes.0.disk')
            ->assertJsonMissingPath('data.resumes.0.path')
            ->assertJsonMissingPath('data.resumes.0.extracted_text')
            ->assertJsonMissingPath('data.resumes.0.metadata');
    });

    it('stores a private resume and dispatches its processing job after commit', function (): void {
        $user = User::factory()->create();
        $file = UploadedFile::fake()->create(
            'curriculo-gustavo.pdf',
            512,
            'application/pdf',
        );

        $response = $this
            ->actingAs($user)
            ->postJson('/api/client/user/resumes', [
                'name'       => 'Currículo principal',
                'file'       => $file,
                'is_primary' => true,
            ]);

        $response
            ->assertAccepted()
            ->assertJsonPath('code', 202)
            ->assertJsonPath('message', 'Resume uploaded and queued for processing.')
            ->assertJsonPath('data.resume.name', 'Currículo principal')
            ->assertJsonPath('data.resume.original_filename', 'curriculo-gustavo.pdf')
            ->assertJsonPath('data.resume.status', 'pending')
            ->assertJsonPath('data.resume.is_primary', true)
            ->assertJsonMissingPath('data.resume.disk')
            ->assertJsonMissingPath('data.resume.path');

        $resume = UserResume::query()->sole();

        expect($resume->user_id)->toBe($user->id)
            ->and($resume->disk)->toBe('resumes')
            ->and($resume->path)->toMatch('/^' . preg_quote((string) $user->id, '/') . '\/[0-9a-f-]{36}\.pdf$/')
            ->and($resume->status)->toBe(UserResumeStatus::Pending)
            ->and($resume->extracted_text)->toBeNull()
            ->and($resume->metadata)->toBeNull()
            ->and($resume->processed_at)->toBeNull();

        Storage::disk('resumes')->assertExists($resume->path);

        Queue::assertPushed(
            ProcessUserResumeJob::class,
            fn (ProcessUserResumeJob $job): bool => $job->resumeId === $resume->id
                && $job->queue === 'resume-processing'
                && $job->afterCommit === true,
        );
    });

    it('makes the uploaded resume the only primary resume when requested', function (): void {
        $user = User::factory()->create();
        $previousPrimary = UserResume::factory()->for($user)->create([
            'is_primary' => true,
        ]);

        $this
            ->actingAs($user)
            ->postJson('/api/client/user/resumes', [
                'name'       => 'Novo currículo principal',
                'file'       => UploadedFile::fake()->create('resume.pdf', 100, 'application/pdf'),
                'is_primary' => true,
            ])
            ->assertAccepted();

        expect($previousPrimary->refresh()->is_primary)->toBeFalse()
            ->and($user->resumes()->where('is_primary', true)->count())->toBe(1);
    });

    it('validates the resume upload payload', function (array $payload, array $errors): void {
        $user = User::factory()->create();

        $response = $this
            ->actingAs($user)
            ->postJson('/api/client/user/resumes', $payload);

        $response
            ->assertUnprocessable()
            ->assertJsonPath('code', 422)
            ->assertJsonPath('message', 'Data validation errors')
            ->assertJsonValidationErrors($errors, 'data.errors');

        expect(UserResume::query()->count())->toBe(0);
        Queue::assertNothingPushed();
    })->with([
        'empty payload'     => [[], ['name', 'file']],
        'invalid file type' => [[
            'name' => 'Currículo',
            'file' => UploadedFile::fake()->create('resume.exe', 100, 'application/octet-stream'),
        ], ['file']],
        'file is larger than 10 MB' => [[
            'name' => 'Currículo',
            'file' => UploadedFile::fake()->create('resume.pdf', 10_241, 'application/pdf'),
        ], ['file']],
    ]);

    it('shows a resume owned by the authenticated user without exposing storage details', function (): void {
        $user = User::factory()->create();
        $resume = UserResume::factory()->for($user)->create();

        $this
            ->actingAs($user)
            ->getJson("/api/client/user/resumes/{$resume->id}")
            ->assertOk()
            ->assertJsonPath('data.resume.id', $resume->id)
            ->assertJsonMissingPath('data.resume.disk')
            ->assertJsonMissingPath('data.resume.path');
    });

    it('forbids reading another users resume', function (): void {
        $user = User::factory()->create();
        $resume = UserResume::factory()->create();

        $this
            ->actingAs($user)
            ->getJson("/api/client/user/resumes/{$resume->id}")
            ->assertForbidden();
    });

    it('soft deletes a resume owned by the authenticated user', function (): void {
        $user = User::factory()->create();
        $resume = UserResume::factory()->for($user)->create();

        $this
            ->actingAs($user)
            ->deleteJson("/api/client/user/resumes/{$resume->id}")
            ->assertOk()
            ->assertJsonPath('message', 'Resume deleted successfully.');

        $this->assertSoftDeleted('user_resumes', [
            'id' => $resume->id,
        ]);
    });

    it('forbids deleting another users resume', function (): void {
        $user = User::factory()->create();
        $resume = UserResume::factory()->create();

        $this
            ->actingAs($user)
            ->deleteJson("/api/client/user/resumes/{$resume->id}")
            ->assertForbidden();

        $this->assertNotSoftDeleted('user_resumes', [
            'id' => $resume->id,
        ]);
    });
});
