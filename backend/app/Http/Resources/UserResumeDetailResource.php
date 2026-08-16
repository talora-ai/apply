<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Enums\UserResumeStatus;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

final class UserResumeDetailResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $metadata = is_array($this->metadata) ? $this->metadata : [];

        return [
            ...(new UserResumeResource($this->resource))->resolve($request),
            'ats'     => $metadata['ats'] ?? null,
            'content' => $this->when(
                $this->status === UserResumeStatus::Completed,
                [
                    'full_text' => $this->extracted_text,
                    'sections'  => $metadata['sections'] ?? [],
                ],
            ),
            'processing_error' => $this->when(
                $this->status === UserResumeStatus::Failed,
                $metadata['processing']['failure_code'] ?? 'BOT_PROCESSING_FAILED',
            ),
        ];
    }
}
