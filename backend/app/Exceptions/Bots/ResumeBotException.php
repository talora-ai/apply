<?php

declare(strict_types=1);

namespace App\Exceptions\Bots;

use RuntimeException;
use Throwable;

final class ResumeBotException extends RuntimeException
{
    public function __construct(
        public readonly string $errorCode,
        string $message,
        ?Throwable $previous = null,
    ) {
        parent::__construct($message, 0, $previous);
    }

    public static function notConfigured(): self
    {
        return new self('BOT_NOT_CONFIGURED', 'The resume Bot is not configured.');
    }

    public static function fileUnavailable(): self
    {
        return new self('RESUME_FILE_UNAVAILABLE', 'The private resume file is unavailable.');
    }

    public static function unavailable(?Throwable $previous = null): self
    {
        return new self('BOT_UNAVAILABLE', 'The resume Bot is unavailable.', $previous);
    }

    public static function rejected(): self
    {
        return new self('BOT_REJECTED_RESUME', 'The resume Bot rejected the document.');
    }

    public static function invalidResponse(): self
    {
        return new self('BOT_INVALID_RESPONSE', 'The resume Bot returned an invalid response.');
    }

    public static function invalidProcessingContext(): self
    {
        return new self('INVALID_PROCESSING_CONTEXT', 'The processing context is invalid.');
    }
}
