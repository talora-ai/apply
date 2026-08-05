<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Contracts\Bots\ResumeBotClient;
use App\Enums\UserResumeStatus;
use App\Exceptions\Bots\ResumeBotException;
use App\Models\UserResume;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\Middleware\WithoutOverlapping;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Throwable;

final class ProcessUserResumeJob implements ShouldQueue
{
    use Dispatchable;
    use InteractsWithQueue;
    use Queueable;
    use SerializesModels;

    public int $tries = 3;

    public int $timeout = 60;

    public bool $failOnTimeout = true;

    public function __construct(
        public readonly int $resumeId,
        public readonly int $userId,
        public readonly string $processingId,
    ) {
        $this->onQueue('resume-processing');
        $this->afterCommit();
    }

    public function handle(ResumeBotClient $botClient): void
    {
        $resume = $this->findAuthorizedResume();

        if ($resume === null || $resume->status === UserResumeStatus::Completed) {
            return;
        }

        if (($resume->metadata['processing']['id'] ?? null) !== $this->processingId) {
            throw ResumeBotException::invalidProcessingContext();
        }

        if (! Storage::disk($resume->disk)->exists($resume->path)) {
            throw ResumeBotException::fileUnavailable();
        }

        $resume->update([
            'status' => UserResumeStatus::Processing,
            'processed_at' => null,
        ]);

        $result = $botClient->extract($resume, $this->processingId);

        DB::transaction(function () use ($result): void {
            $resume = UserResume::query()
                ->where('user_id', $this->userId)
                ->lockForUpdate()
                ->find($this->resumeId);

            if ($resume === null || $resume->status === UserResumeStatus::Completed) {
                return;
            }

            $metadata = $resume->metadata ?? [];
            $metadata = array_replace_recursive($metadata, $result->metadata());
            $metadata['processing'] = [
                'id' => $this->processingId,
                'completed_at' => now()->toISOString(),
            ];

            $resume->update([
                'status' => UserResumeStatus::Completed,
                'extracted_text' => $result->fullText,
                'metadata' => $metadata,
                'processed_at' => now(),
            ]);
        });
    }

    public function middleware(): array
    {
        return [
            (new WithoutOverlapping('resume-processing:' . $this->resumeId))
                ->releaseAfter(30)
                ->expireAfter(120),
        ];
    }

    public function backoff(): array
    {
        return [60, 300];
    }

    public function failed(?Throwable $exception): void
    {
        $resume = $this->findAuthorizedResume();

        if ($resume === null || $resume->status === UserResumeStatus::Completed) {
            return;
        }

        $metadata = $resume->metadata ?? [];
        $metadata['processing'] = [
            'id' => $this->processingId,
            'failure_code' => $exception instanceof ResumeBotException
                ? $exception->errorCode
                : 'BOT_PROCESSING_FAILED',
            'failed_at' => now()->toISOString(),
        ];

        $resume->update([
            'status' => UserResumeStatus::Failed,
            'metadata' => $metadata,
            'processed_at' => null,
        ]);
    }

    private function findAuthorizedResume(): ?UserResume
    {
        return UserResume::query()
            ->where('user_id', $this->userId)
            ->find($this->resumeId);
    }
}
