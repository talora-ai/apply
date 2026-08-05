<?php

declare(strict_types=1);

namespace App\Contracts\Bots;

use App\Data\Bots\ResumeExtractionResult;
use App\Models\UserResume;

interface ResumeBotClient
{
    public function extract(UserResume $resume, string $processingId): ResumeExtractionResult;
}
