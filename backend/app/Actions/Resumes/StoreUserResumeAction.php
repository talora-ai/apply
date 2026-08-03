<?php

declare(strict_types=1);

namespace App\Actions\Resumes;

use App\Enums\UserResumeStatus;
use App\Jobs\ProcessUserResumeJob;
use App\Models\User;
use App\Models\UserResume;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Throwable;

final class StoreUserResumeAction
{
    private const DISK = 'resumes';

    public function execute(
        User $user,
        UploadedFile $file,
        string $name,
        bool $isPrimary = false,
    ): UserResume {
        $path = null;

        try {
            $extension = strtolower($file->extension());
            $path = $file->storeAs(
                (string) $user->getKey(),
                Str::uuid() . '.' . $extension,
                self::DISK,
            );

            return DB::transaction(function () use ($user, $file, $name, $isPrimary, $path): UserResume {
                if ($isPrimary) {
                    $user->resumes()
                        ->where('is_primary', true)
                        ->update(['is_primary' => false]);
                }

                $resume = $user->resumes()->create([
                    'name'              => $name,
                    'original_filename' => $file->getClientOriginalName(),
                    'disk'              => self::DISK,
                    'path'              => $path,
                    'mime_type'         => $file->getMimeType() ?? $file->getClientMimeType(),
                    'size'              => $file->getSize(),
                    'status'            => UserResumeStatus::Pending,
                    'is_primary'        => $isPrimary,
                ]);

                ProcessUserResumeJob::dispatch($resume->getKey());

                return $resume;
            });
        } catch (Throwable $exception) {
            if (is_string($path)) {
                Storage::disk(self::DISK)->delete($path);
            }

            throw $exception;
        }
    }
}
