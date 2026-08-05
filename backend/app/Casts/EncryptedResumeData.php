<?php

declare(strict_types=1);

namespace App\Casts;

use App\Exceptions\Resumes\ResumeEncryptionException;
use Illuminate\Contracts\Database\Eloquent\CastsAttributes;
use Illuminate\Database\Eloquent\Model;
use JsonException;

/** @implements CastsAttributes<mixed, mixed> */
final class EncryptedResumeData implements CastsAttributes
{
    public function __construct(private readonly string $type = 'string') {}

    public function get(
        Model $model,
        string $key,
        mixed $value,
        array $attributes,
    ): mixed {
        if ($value === null) {
            return null;
        }

        $parts = explode(':', (string) $value, 3);

        if (count($parts) !== 3 || $parts[0] !== 'talora') {
            throw ResumeEncryptionException::integrityFailure();
        }

        [, $version, $encodedPayload] = $parts;

        if (! hash_equals((string) config('resumes.data_encryption.key_version', 'v1'), $version)) {
            throw ResumeEncryptionException::integrityFailure();
        }

        $payload = base64_decode($encodedPayload, true);

        if ($payload === false) {
            throw ResumeEncryptionException::integrityFailure();
        }

        $nonceBytes = SODIUM_CRYPTO_AEAD_XCHACHA20POLY1305_IETF_NPUBBYTES;
        $nonce = substr($payload, 0, $nonceBytes);
        $ciphertext = substr($payload, $nonceBytes);
        $masterKey = $this->masterKey();

        try {
            $plaintext = sodium_crypto_aead_xchacha20poly1305_ietf_decrypt(
                $ciphertext,
                $this->associatedData($model, $key, $version),
                $nonce,
                $masterKey,
            );
        } finally {
            sodium_memzero($masterKey);
        }

        if ($plaintext === false) {
            throw ResumeEncryptionException::integrityFailure();
        }

        if ($this->type !== 'array') {
            return $plaintext;
        }

        try {
            return json_decode($plaintext, true, 512, JSON_THROW_ON_ERROR);
        } catch (JsonException $exception) {
            throw ResumeEncryptionException::integrityFailure();
        }
    }

    public function set(
        Model $model,
        string $key,
        mixed $value,
        array $attributes,
    ): ?string {
        if ($value === null) {
            return null;
        }

        try {
            $plaintext = $this->type === 'array'
                ? json_encode($value, JSON_THROW_ON_ERROR)
                : (string) $value;
        } catch (JsonException $exception) {
            throw ResumeEncryptionException::invalidContainer();
        }

        $masterKey = $this->masterKey();
        $nonce = random_bytes(SODIUM_CRYPTO_AEAD_XCHACHA20POLY1305_IETF_NPUBBYTES);

        try {
            $ciphertext = sodium_crypto_aead_xchacha20poly1305_ietf_encrypt(
                $plaintext,
                $this->associatedData($model, $key),
                $nonce,
                $masterKey,
            );
        } finally {
            sodium_memzero($masterKey);
        }

        $version = (string) config('resumes.data_encryption.key_version', 'v1');

        return 'talora:' . $version . ':' . base64_encode($nonce . $ciphertext);
    }

    private function masterKey(): string
    {
        $key = base64_decode((string) config('resumes.data_encryption.key'), true);

        if ($key === false || strlen($key) !== SODIUM_CRYPTO_AEAD_XCHACHA20POLY1305_IETF_KEYBYTES) {
            throw ResumeEncryptionException::notConfigured();
        }

        return $key;
    }

    private function associatedData(Model $model, string $key, ?string $version = null): string
    {
        return $model->getTable() . ':' . $key . ':'
            . ($version ?? (string) config('resumes.data_encryption.key_version', 'v1'));
    }
}
