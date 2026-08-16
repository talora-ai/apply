<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('user_resumes', function (Blueprint $table): void {
            $table->text('name')->change();
            $table->text('original_filename')->change();
            $table->longText('extracted_text')->nullable()->change();
            $table->longText('metadata')->nullable()->change();
        });

        $this->transformExistingValues(encrypt: true);
    }

    public function down(): void
    {
        $this->transformExistingValues(encrypt: false);

        Schema::table('user_resumes', function (Blueprint $table): void {
            $table->string('name')->change();
            $table->string('original_filename')->change();
            $table->text('extracted_text')->nullable()->change();
            $table->json('metadata')->nullable()->change();
        });
    }

    private function transformExistingValues(bool $encrypt): void
    {
        DB::table('user_resumes')
            ->orderBy('id')
            ->chunkById(100, function ($resumes) use ($encrypt): void {
                foreach ($resumes as $resume) {
                    $updates = [];

                    foreach (['name', 'original_filename', 'extracted_text', 'metadata'] as $column) {
                        $value = $resume->{$column};

                        if ($value === null) {
                            continue;
                        }

                        $updates[$column] = $encrypt
                            ? $this->encrypt((string) $value, $column)
                            : $this->decrypt((string) $value, $column);
                    }

                    DB::table('user_resumes')
                        ->where('id', $resume->id)
                        ->update($updates);
                }
            });
    }

    private function encrypt(string $plaintext, string $column): string
    {
        if (str_starts_with($plaintext, 'talora:')) {
            return $plaintext;
        }

        $key = $this->key();
        $version = (string) config('resumes.data_encryption.key_version', 'v1');
        $nonce = random_bytes(SODIUM_CRYPTO_AEAD_XCHACHA20POLY1305_IETF_NPUBBYTES);

        try {
            $ciphertext = sodium_crypto_aead_xchacha20poly1305_ietf_encrypt(
                $plaintext,
                'user_resumes:' . $column . ':' . $version,
                $nonce,
                $key,
            );
        } finally {
            sodium_memzero($key);
        }

        return 'talora:' . $version . ':' . base64_encode($nonce . $ciphertext);
    }

    private function decrypt(string $value, string $column): string
    {
        $parts = explode(':', $value, 3);

        if (count($parts) !== 3 || $parts[0] !== 'talora') {
            return $value;
        }

        [, $version, $encodedPayload] = $parts;
        $payload = base64_decode($encodedPayload, true);

        if ($payload === false) {
            throw new RuntimeException('Unable to decrypt legacy resume data.');
        }

        $nonceBytes = SODIUM_CRYPTO_AEAD_XCHACHA20POLY1305_IETF_NPUBBYTES;
        $key = $this->key();

        try {
            $plaintext = sodium_crypto_aead_xchacha20poly1305_ietf_decrypt(
                substr($payload, $nonceBytes),
                'user_resumes:' . $column . ':' . $version,
                substr($payload, 0, $nonceBytes),
                $key,
            );
        } finally {
            sodium_memzero($key);
        }

        if ($plaintext === false) {
            throw new RuntimeException('Unable to decrypt legacy resume data.');
        }

        return $plaintext;
    }

    private function key(): string
    {
        $key = base64_decode((string) config('resumes.data_encryption.key'), true);

        if ($key === false || strlen($key) !== SODIUM_CRYPTO_AEAD_XCHACHA20POLY1305_IETF_KEYBYTES) {
            throw new RuntimeException('Resume data encryption is not configured.');
        }

        return $key;
    }
};
