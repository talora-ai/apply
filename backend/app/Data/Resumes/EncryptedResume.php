<?php

declare(strict_types=1);

namespace App\Data\Resumes;

final readonly class EncryptedResume
{
    public function __construct(
        public string $path,
        public array $metadata,
    ) {}
}
