<?php

declare(strict_types=1);

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

final class UserResumeResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $metadata = is_array($this->metadata) ? $this->metadata : [];

        return [
            'id'                => $this->id,
            'name'              => $this->name,
            'original_filename' => $this->original_filename,
            'mime_type'         => $this->mime_type,
            'size'              => $this->size,
            'status'            => $this->status->value,
            'is_primary'        => $this->is_primary,
            'ats_friendly'      => $metadata['ats']['ats_friendly'] ?? null,
            'processed_at'      => $this->processed_at,
            'created_at'        => $this->created_at,
            'updated_at'        => $this->updated_at,
        ];
    }
}
