<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Services\Resumes\ResumeEncryptionConfiguration;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

final class EncryptLegacyResumeDataCommand extends Command
{
    protected $signature = 'resumes:encrypt-legacy-data {--dry-run : Only report plaintext values without changing them}';

    protected $description = 'Encrypt legacy plaintext fields in user_resumes created before encrypted casts were enabled';

    public function __construct(private readonly ResumeEncryptionConfiguration $configuration)
    {
        parent::__construct();
    }

    public function handle(): int
    {
        $this->configuration->assertReady();
        $key = $this->configuration->dataKey();
        $version = (string) config('resumes.data_encryption.key_version', 'v1');
        $dryRun = (bool) $this->option('dry-run');
        $rowsChanged = 0;
        $valuesChanged = 0;

        try {
            DB::table('user_resumes')
                ->orderBy('id')
                ->chunkById(100, function ($resumes) use ($key, $version, $dryRun, &$rowsChanged, &$valuesChanged): void {
                    foreach ($resumes as $resume) {
                        $updates = [];

                        foreach (['name', 'original_filename', 'extracted_text', 'metadata'] as $column) {
                            $value = $resume->{$column};

                            if ($value === null || str_starts_with((string) $value, 'talora:')) {
                                continue;
                            }

                            $valuesChanged++;
                            $updates[$column] = $this->encrypt((string) $value, $column, $version, $key);
                        }

                        if ($updates === []) {
                            continue;
                        }

                        $rowsChanged++;

                        if (! $dryRun) {
                            DB::table('user_resumes')
                                ->where('id', $resume->id)
                                ->update($updates);
                        }
                    }
                });
        } finally {
            sodium_memzero($key);
        }

        if ($dryRun) {
            $this->info("Found {$valuesChanged} plaintext value(s) across {$rowsChanged} resume row(s). No changes were made.");
        } else {
            $this->info("Encrypted {$valuesChanged} legacy value(s) across {$rowsChanged} resume row(s).");
        }

        return self::SUCCESS;
    }

    private function encrypt(string $plaintext, string $column, string $version, string $key): string
    {
        $nonce = random_bytes(SODIUM_CRYPTO_AEAD_XCHACHA20POLY1305_IETF_NPUBBYTES);
        $ciphertext = sodium_crypto_aead_xchacha20poly1305_ietf_encrypt(
            $plaintext,
            'user_resumes:' . $column . ':' . $version,
            $nonce,
            $key,
        );

        return 'talora:' . $version . ':' . base64_encode($nonce . $ciphertext);
    }
}
