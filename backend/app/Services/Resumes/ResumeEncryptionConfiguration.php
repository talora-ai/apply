<?php

declare(strict_types=1);

namespace App\Services\Resumes;

use App\Exceptions\Resumes\ResumeEncryptionException;

final class ResumeEncryptionConfiguration
{
    public function assertReady(): void
    {
        $this->decodeKey('resumes.encryption.key');
        $this->decodeKey('resumes.data_encryption.key');
    }

    public function storageKey(): string
    {
        return $this->decodeKey('resumes.encryption.key');
    }

    public function dataKey(): string
    {
        return $this->decodeKey('resumes.data_encryption.key');
    }

    private function decodeKey(string $configKey): string
    {
        $key = base64_decode((string) config($configKey), true);

        if ($key === false || strlen($key) !== SODIUM_CRYPTO_AEAD_XCHACHA20POLY1305_IETF_KEYBYTES) {
            throw ResumeEncryptionException::notConfigured();
        }

        return $key;
    }
}
