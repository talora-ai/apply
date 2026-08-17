<?php

declare(strict_types=1);

namespace App\Console\Commands;

use Illuminate\Console\Command;

final class GenerateResumeEncryptionKeysCommand extends Command
{
    protected $signature = 'resumes:generate-encryption-keys';

    protected $description = 'Generate independent encryption keys for resume files and resume database fields';

    public function handle(): int
    {
        $this->warn('Store these values in .env and keep them stable. Losing or changing them makes existing encrypted resume data unreadable.');
        $this->newLine();
        $this->line('RESUME_ENCRYPTION_KEY=' . base64_encode(random_bytes(32)));
        $this->line('RESUME_DATA_ENCRYPTION_KEY=' . base64_encode(random_bytes(32)));
        $this->newLine();
        $this->comment('Then run: php artisan config:clear');

        return self::SUCCESS;
    }
}
