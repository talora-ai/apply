<?php

declare(strict_types=1);

namespace App\Services\Resumes;

use App\Data\Resumes\EncryptedResume;
use App\Exceptions\Resumes\ResumeEncryptionException;
use App\Models\UserResume;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

final class EncryptedResumeStorage
{
    private const CHUNK_BYTES = 64 * 1024;

    private const MAGIC = 'TLRAENC1';

    private const MAX_ENCRYPTED_CHUNK_BYTES = self::CHUNK_BYTES
        + SODIUM_CRYPTO_SECRETSTREAM_XCHACHA20POLY1305_ABYTES;

    public function store(UploadedFile $file): EncryptedResume
    {
        $storageId = (string) Str::uuid();
        $path = $storageId . '.enc';
        $input = fopen($file->getRealPath(), 'rb');

        if (! is_resource($input)) {
            throw ResumeEncryptionException::invalidContainer();
        }

        $encrypted = $this->temporaryStream();
        $dataKey = random_bytes(SODIUM_CRYPTO_SECRETSTREAM_XCHACHA20POLY1305_KEYBYTES);

        try {
            [$state, $header] = sodium_crypto_secretstream_xchacha20poly1305_init_push($dataKey);
            $hash = hash_init('sha256');

            $this->write($encrypted, self::MAGIC . $header);

            while (! feof($input)) {
                $chunk = fread($input, self::CHUNK_BYTES);

                if ($chunk === false) {
                    throw ResumeEncryptionException::invalidContainer();
                }

                if ($chunk === '') {
                    continue;
                }

                hash_update($hash, $chunk);
                $this->writeFrame(
                    $encrypted,
                    sodium_crypto_secretstream_xchacha20poly1305_push($state, $chunk),
                );
            }

            $this->writeFrame(
                $encrypted,
                sodium_crypto_secretstream_xchacha20poly1305_push(
                    $state,
                    '',
                    '',
                    SODIUM_CRYPTO_SECRETSTREAM_XCHACHA20POLY1305_TAG_FINAL,
                ),
            );

            rewind($encrypted);
            Storage::disk('resumes')->writeStream($path, $encrypted);

            return new EncryptedResume(
                path: $path,
                metadata: [
                    'storage_id'       => $storageId,
                    'algorithm'        => 'secretstream-xchacha20poly1305',
                    'key_version'      => (string) config('resumes.encryption.key_version', 'v1'),
                    'wrapped_key'      => $this->wrapKey($dataKey, $storageId),
                    'plaintext_sha256' => hash_final($hash),
                ],
            );
        } finally {
            fclose($input);
            fclose($encrypted);
            sodium_memzero($dataKey);
        }
    }

    /** @return resource */
    public function decrypt(UserResume $resume)
    {
        $encryption = $resume->metadata['encryption'] ?? null;

        if (! is_array($encryption)) {
            throw ResumeEncryptionException::invalidContainer();
        }

        $storageId = $this->metadataString($encryption, 'storage_id');
        $dataKey = $this->unwrapKey(
            $this->metadataString($encryption, 'wrapped_key'),
            $storageId,
        );
        $input = Storage::disk($resume->disk)->readStream($resume->path);
        $decrypted = $this->temporaryStream();

        if (! is_resource($input)) {
            sodium_memzero($dataKey);

            throw ResumeEncryptionException::invalidContainer();
        }

        try {
            $prefix = $this->readExactly(
                $input,
                strlen(self::MAGIC) + SODIUM_CRYPTO_SECRETSTREAM_XCHACHA20POLY1305_HEADERBYTES,
            );

            if (! str_starts_with($prefix, self::MAGIC)) {
                throw ResumeEncryptionException::invalidContainer();
            }

            $header = substr($prefix, strlen(self::MAGIC));
            $state = sodium_crypto_secretstream_xchacha20poly1305_init_pull($header, $dataKey);
            $hash = hash_init('sha256');
            $finished = false;

            while (! feof($input)) {
                $lengthBytes = fread($input, 4);

                if ($lengthBytes === false || $lengthBytes === '') {
                    break;
                }

                if (strlen($lengthBytes) !== 4) {
                    throw ResumeEncryptionException::invalidContainer();
                }

                $length = unpack('Nlength', $lengthBytes)['length'];

                if ($length < 1 || $length > self::MAX_ENCRYPTED_CHUNK_BYTES) {
                    throw ResumeEncryptionException::invalidContainer();
                }

                $pulled = sodium_crypto_secretstream_xchacha20poly1305_pull(
                    $state,
                    $this->readExactly($input, $length),
                );

                if ($pulled === false || $finished) {
                    throw ResumeEncryptionException::integrityFailure();
                }

                [$chunk, $tag] = $pulled;
                hash_update($hash, $chunk);
                $this->write($decrypted, $chunk);
                $finished = $tag === SODIUM_CRYPTO_SECRETSTREAM_XCHACHA20POLY1305_TAG_FINAL;
            }

            if (! $finished || ! hash_equals(
                $this->metadataString($encryption, 'plaintext_sha256'),
                hash_final($hash),
            )) {
                throw ResumeEncryptionException::integrityFailure();
            }

            rewind($decrypted);

            return $decrypted;
        } catch (\Throwable $exception) {
            fclose($decrypted);

            throw $exception;
        } finally {
            fclose($input);
            sodium_memzero($dataKey);
        }
    }

    private function wrapKey(string $dataKey, string $storageId): string
    {
        $masterKey = $this->masterKey();
        $nonce = random_bytes(SODIUM_CRYPTO_AEAD_XCHACHA20POLY1305_IETF_NPUBBYTES);

        try {
            $ciphertext = sodium_crypto_aead_xchacha20poly1305_ietf_encrypt(
                $dataKey,
                $storageId,
                $nonce,
                $masterKey,
            );

            return base64_encode($nonce . $ciphertext);
        } finally {
            sodium_memzero($masterKey);
        }
    }

    private function unwrapKey(string $wrappedKey, string $storageId): string
    {
        $payload = base64_decode($wrappedKey, true);

        if ($payload === false) {
            throw ResumeEncryptionException::invalidContainer();
        }

        $nonceBytes = SODIUM_CRYPTO_AEAD_XCHACHA20POLY1305_IETF_NPUBBYTES;
        $nonce = substr($payload, 0, $nonceBytes);
        $ciphertext = substr($payload, $nonceBytes);
        $masterKey = $this->masterKey();

        try {
            $dataKey = sodium_crypto_aead_xchacha20poly1305_ietf_decrypt(
                $ciphertext,
                $storageId,
                $nonce,
                $masterKey,
            );
        } finally {
            sodium_memzero($masterKey);
        }

        if ($dataKey === false) {
            throw ResumeEncryptionException::integrityFailure();
        }

        return $dataKey;
    }

    private function masterKey(): string
    {
        $key = base64_decode((string) config('resumes.encryption.key'), true);

        if ($key === false || strlen($key) !== SODIUM_CRYPTO_AEAD_XCHACHA20POLY1305_IETF_KEYBYTES) {
            throw ResumeEncryptionException::notConfigured();
        }

        return $key;
    }

    /** @return resource */
    private function temporaryStream()
    {
        $limit = (int) config('resumes.encryption.memory_limit_bytes', 12 * 1024 * 1024);
        $stream = fopen('php://temp/maxmemory:' . $limit, 'w+b');

        if (! is_resource($stream)) {
            throw ResumeEncryptionException::invalidContainer();
        }

        return $stream;
    }

    /** @param resource $stream */
    private function write($stream, string $content): void
    {
        if (fwrite($stream, $content) !== strlen($content)) {
            throw ResumeEncryptionException::invalidContainer();
        }
    }

    /** @param resource $stream */
    private function writeFrame($stream, string $ciphertext): void
    {
        $this->write($stream, pack('N', strlen($ciphertext)) . $ciphertext);
    }

    /** @param resource $stream */
    private function readExactly($stream, int $length): string
    {
        $content = '';

        while (strlen($content) < $length && ! feof($stream)) {
            $chunk = fread($stream, $length - strlen($content));

            if ($chunk === false) {
                throw ResumeEncryptionException::invalidContainer();
            }

            $content .= $chunk;
        }

        if (strlen($content) !== $length) {
            throw ResumeEncryptionException::invalidContainer();
        }

        return $content;
    }

    private function metadataString(array $metadata, string $key): string
    {
        $value = $metadata[$key] ?? null;

        if (! is_string($value) || $value === '') {
            throw ResumeEncryptionException::invalidContainer();
        }

        return $value;
    }
}
