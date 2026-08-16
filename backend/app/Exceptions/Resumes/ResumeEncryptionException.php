<?php

declare(strict_types=1);

namespace App\Exceptions\Resumes;

use RuntimeException;

final class ResumeEncryptionException extends RuntimeException
{
    public static function notConfigured(): self
    {
        return new self('Resume encryption is not configured.');
    }

    public static function invalidContainer(): self
    {
        return new self('The encrypted resume container is invalid.');
    }

    public static function integrityFailure(): self
    {
        return new self('The encrypted resume failed its integrity check.');
    }
}
