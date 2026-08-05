<?php

declare(strict_types=1);

use App\Contracts\Bots\ResumeBotClient;
use App\Enums\UserResumeStatus;
use App\Exceptions\Bots\ResumeBotException;
use App\Jobs\ProcessUserResumeJob;
use App\Models\User;
use App\Models\UserResume;
use App\Services\Resumes\EncryptedResumeStorage;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

function validResumeBotPayload(string $processingId, string $documentHash): array
{
    return [
        'schema_version' => '1.4',
        'processing_id' => $processingId,
        'document' => [
            'filename' => 'resume.pdf',
            'mime_type' => 'application/pdf',
            'page_count' => 1,
            'character_count' => 120,
            'sha256' => $documentHash,
            'metadata' => [
                'encrypted' => false,
            ],
            'ats' => [
                'ats_friendly' => false,
                'confidence' => 0.96,
                'layout_type' => 'multi_column',
                'extraction_quality' => 'partial',
                'reason_codes' => [
                    'multi_column_layout',
                    'ambiguous_reading_order',
                ],
                'metrics' => [
                    'text_blocks' => 20,
                    'images' => 1,
                    'drawings' => 15,
                    'selectable_characters' => 120,
                    'multi_column_pages' => 1,
                ],
            ],
        ],
        'content' => [
            'full_text' => 'Gustavo Martim Backend Engineer PHP Laravel',
            'sections' => [
                'summary' => ['Backend Engineer'],
                'skills' => ['PHP', 'Laravel'],
                'experiences' => [[
                    'position' => 'Backend Engineer',
                    'company' => 'Talora',
                    'period' => '2024-Atual',
                    'start_date' => '2024',
                    'end_date' => null,
                    'is_current' => true,
                    'description' => ['Desenvolvimento de APIs REST.'],
                ]],
                'education' => ['Engenharia de Software'],
                'languages' => [[
                    'name' => 'Português',
                    'proficiency' => 'Nativo',
                ]],
                'projects' => [[
                    'name' => 'Talora Apply',
                    'description' => ['Plataforma de apoio a candidaturas.'],
                ]],
                'certifications' => [],
            ],
        ],
    ];
}

function createPendingResume(?User $user = null, ?string $processingId = null): UserResume
{
    $processingId ??= (string) Str::uuid();
    $content = '%PDF-1.4 private resume';
    $encrypted = app(EncryptedResumeStorage::class)->store(
        UploadedFile::fake()->createWithContent('resume.pdf', $content),
    );
    $resume = UserResume::factory()->create([
        'user_id' => $user?->id ?? User::factory(),
        'disk' => 'resumes',
        'path' => $encrypted->path,
        'original_filename' => 'resume.pdf',
        'mime_type' => 'application/pdf',
        'status' => UserResumeStatus::Pending,
        'extracted_text' => null,
        'metadata' => [
            'encryption' => $encrypted->metadata,
            'processing' => ['id' => $processingId],
        ],
        'processed_at' => null,
    ]);

    return $resume;
}

describe(ProcessUserResumeJob::class, function (): void {
    beforeEach(function (): void {
        Storage::fake('resumes');
        config()->set('services.bot.url', 'http://localhost:9000');
        config()->set('services.bot.token', 'shared-service-token');
        config()->set('services.bot.signing_secret', 'shared-signing-secret-at-least-32-bytes');
        config()->set('services.bot.connect_timeout', 5);
        config()->set('services.bot.timeout', 45);
        config()->set('services.bot.max_response_kb', 2048);
        config()->set('resumes.encryption.key', base64_encode(str_repeat('k', 32)));
    });

    it('sends the private resume to the Bot and persists the structured result', function (): void {
        $processingId = (string) Str::uuid();
        $contentHash = hash('sha256', '%PDF-1.4 private resume');
        Http::fake([
            'http://localhost:9000/api/v1/resumes/extract' => Http::response(
                validResumeBotPayload($processingId, $contentHash),
            ),
        ]);

        $resume = createPendingResume(processingId: $processingId);
        $job = new ProcessUserResumeJob($resume->id, $resume->user_id, $processingId);

        $job->handle(app(ResumeBotClient::class));

        $resume->refresh();

        expect($resume->status)->toBe(UserResumeStatus::Completed)
            ->and($resume->extracted_text)->toBe('Gustavo Martim Backend Engineer PHP Laravel')
            ->and($resume->processed_at)->not->toBeNull()
            ->and($resume->metadata['schema_version'])->toBe('1.4')
            ->and($resume->metadata['encryption']['algorithm'])
            ->toBe('secretstream-xchacha20poly1305')
            ->and($resume->metadata['ats']['ats_friendly'])->toBeFalse()
            ->and($resume->metadata['ats']['layout_type'])->toBe('multi_column')
            ->and($resume->metadata['sections']['skills'])->toBe(['PHP', 'Laravel'])
            ->and($resume->metadata['sections']['projects'][0]['description'])->toBe([
                'Plataforma de apoio a candidaturas.',
            ]);

        $rawResume = DB::table('user_resumes')->find($resume->id);
        expect($rawResume->extracted_text)->not->toContain('Gustavo Martim')
            ->and($rawResume->metadata)->not->toContain('Backend Engineer')
            ->and($rawResume->original_filename)->not->toContain('resume.pdf');

        Http::assertSent(
            fn ($request): bool => $request->url() === 'http://localhost:9000/api/v1/resumes/extract'
                && $request->hasHeader('Authorization', 'Bearer shared-service-token')
                && $request->hasHeader('X-Talora-Processing-Id', $processingId)
                && $request->hasHeader('X-Talora-Content-SHA256', $contentHash)
                && $request->hasHeader('X-Talora-Signature'),
        );
    });

    it('does not process an already completed resume again', function (): void {
        Http::fake();
        $resume = UserResume::factory()->create([
            'status' => UserResumeStatus::Completed,
        ]);

        (new ProcessUserResumeJob($resume->id, $resume->user_id, (string) Str::uuid()))
            ->handle(app(ResumeBotClient::class));

        Http::assertNothingSent();
    });

    it('does not process a soft deleted resume', function (): void {
        Http::fake();
        $resume = createPendingResume();
        $resume->delete();

        (new ProcessUserResumeJob($resume->id, $resume->user_id, (string) Str::uuid()))
            ->handle(app(ResumeBotClient::class));

        Http::assertNothingSent();
    });

    it('does not process a resume under a different user context', function (): void {
        Http::fake();
        $resume = createPendingResume();
        $otherUser = User::factory()->create();

        (new ProcessUserResumeJob(
            $resume->id,
            $otherUser->id,
            $resume->metadata['processing']['id'],
        ))->handle(app(ResumeBotClient::class));

        expect($resume->refresh()->status)->toBe(UserResumeStatus::Pending);
        Http::assertNothingSent();
    });

    it('fails safely when the private file is unavailable', function (): void {
        Http::fake();
        $processingId = (string) Str::uuid();
        $resume = UserResume::factory()->create([
            'disk' => 'resumes',
            'path' => 'missing/resume.pdf',
            'status' => UserResumeStatus::Pending,
            'metadata' => [
                'processing' => [
                    'id' => $processingId,
                ],
            ],
        ]);
        $job = new ProcessUserResumeJob($resume->id, $resume->user_id, $processingId);
        $exception = null;

        try {
            $job->handle(app(ResumeBotClient::class));
        } catch (ResumeBotException $caught) {
            $exception = $caught;
        }

        expect($exception)->toBeInstanceOf(ResumeBotException::class)
            ->and($exception->errorCode)->toBe('RESUME_FILE_UNAVAILABLE');

        $job->failed($exception);

        expect($resume->refresh()->status)->toBe(UserResumeStatus::Failed)
            ->and($resume->metadata['processing']['failure_code'])
            ->toBe('RESUME_FILE_UNAVAILABLE');

        Http::assertNothingSent();
    });

    it('rejects an incompatible Bot schema without persisting raw data', function (): void {
        $processingId = (string) Str::uuid();
        $payload = validResumeBotPayload(
            $processingId,
            hash('sha256', '%PDF-1.4 private resume'),
        );
        $payload['schema_version'] = '1.3';

        Http::fake([
            'http://localhost:9000/api/v1/resumes/extract' => Http::response($payload),
        ]);

        $resume = createPendingResume(processingId: $processingId);
        $job = new ProcessUserResumeJob($resume->id, $resume->user_id, $processingId);
        $exception = null;

        try {
            $job->handle(app(ResumeBotClient::class));
        } catch (ResumeBotException $caught) {
            $exception = $caught;
        }

        expect($exception)->toBeInstanceOf(ResumeBotException::class)
            ->and($exception->errorCode)->toBe('BOT_INVALID_RESPONSE')
            ->and($resume->refresh()->extracted_text)->toBeNull();

        $job->failed($exception);

        expect($resume->refresh()->status)->toBe(UserResumeStatus::Failed)
            ->and($resume->metadata)->not->toHaveKey('raw_response');
    });

    it('maps Bot errors to a safe failure code', function (): void {
        Http::fake([
            'http://localhost:9000/api/v1/resumes/extract' => Http::response([
                'error' => [
                    'code' => 'INVALID_PDF',
                    'message' => 'Technical Bot message that must not be persisted.',
                ],
            ], 422),
        ]);

        $processingId = (string) Str::uuid();
        $resume = createPendingResume(processingId: $processingId);
        $job = new ProcessUserResumeJob($resume->id, $resume->user_id, $processingId);
        $exception = null;

        try {
            $job->handle(app(ResumeBotClient::class));
        } catch (ResumeBotException $caught) {
            $exception = $caught;
        }

        $job->failed($exception);
        $resume->refresh();

        expect($exception?->errorCode)->toBe('BOT_REJECTED_RESUME')
            ->and($resume->status)->toBe(UserResumeStatus::Failed)
            ->and($resume->metadata['processing']['failure_code'])->toBe('BOT_REJECTED_RESUME')
            ->and(json_encode($resume->metadata))->not->toContain('Technical Bot message');
    });

    it('exposes persisted ATS and structured content only through the authorized detail route', function (): void {
        $user = User::factory()->create();
        $payload = validResumeBotPayload((string) Str::uuid(), str_repeat('a', 64));
        $resume = UserResume::factory()->for($user)->create([
            'status' => UserResumeStatus::Completed,
            'extracted_text' => $payload['content']['full_text'],
            'metadata' => [
                'schema_version' => '1.4',
                'processing_id' => $payload['processing_id'],
                'document' => [
                    'page_count' => 1,
                    'character_count' => 120,
                    'sha256' => $payload['document']['sha256'],
                    'metadata' => [],
                ],
                'ats' => $payload['document']['ats'],
                'sections' => $payload['content']['sections'],
            ],
            'processed_at' => now(),
        ]);

        $this
            ->actingAs($user)
            ->getJson("/api/client/user/resumes/{$resume->id}")
            ->assertOk()
            ->assertJsonPath('data.resume.ats.ats_friendly', false)
            ->assertJsonPath('data.resume.content.sections.skills.0', 'PHP')
            ->assertJsonPath(
                'data.resume.content.sections.projects.0.description.0',
                'Plataforma de apoio a candidaturas.',
            )
            ->assertJsonMissingPath('data.resume.disk')
            ->assertJsonMissingPath('data.resume.path');
    });
});
