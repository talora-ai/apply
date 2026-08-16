<?php

declare(strict_types=1);

namespace App\Actions\Resumes;

use App\Enums\UserResumeStatus;
use App\Jobs\ProcessUserResumeJob;
use App\Models\User;
use App\Models\UserResume;
use App\Services\Resumes\EncryptedResumeStorage;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Throwable;

final class StoreUserResumeAction
{
    private const DISK = 'resumes';

    public function __construct(private readonly EncryptedResumeStorage $encryptedStorage) {}

    public function execute(
        User $user,
        UploadedFile $file,
        string $name,
        bool $isPrimary = false,
    ): UserResume {
        $encryptedResume = null;

        try {
            $encryptedResume = $this->encryptedStorage->store($file);
            $processingId = (string) Str::uuid();

            return DB::transaction(function () use (
                $user,
                $file,
                $name,
                $isPrimary,
                $encryptedResume,
                $processingId,
            ): UserResume {
                if ($isPrimary) {
                    $user->resumes()
                        ->where('is_primary', true)
                        ->update(['is_primary' => false]);
                }

                $resume = $user->resumes()->create([
                    'name'              => $name,
                    'original_filename' => $file->getClientOriginalName(),
                    'disk'              => self::DISK,
                    'path'              => $encryptedResume->path,
                    'mime_type'         => $file->getMimeType() ?? $file->getClientMimeType(),
                    'size'              => $file->getSize(),
                    'status'            => UserResumeStatus::Pending,
                    'is_primary'        => $isPrimary,
                    'metadata'          => [
                        'encryption' => $encryptedResume->metadata,
                        'processing' => [
                            'id' => $processingId,
                        ],
                    ],
                ]);

                ProcessUserResumeJob::dispatch(
                    resumeId: $resume->getKey(),
                    userId: $user->getKey(),
                    processingId: $processingId,
                );

                return $resume;
            });
        } catch (Throwable $exception) {
            if ($encryptedResume !== null) {
                Storage::disk(self::DISK)->delete($encryptedResume->path);
            }

            throw $exception;
        }
    }
}
