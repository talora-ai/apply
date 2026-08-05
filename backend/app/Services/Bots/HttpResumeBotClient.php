<?php

declare(strict_types=1);

namespace App\Services\Bots;

use App\Contracts\Bots\ResumeBotClient;
use App\Data\Bots\ResumeExtractionResult;
use App\Exceptions\Bots\ResumeBotException;
use App\Models\UserResume;
use App\Services\Resumes\EncryptedResumeStorage;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

final class HttpResumeBotClient implements ResumeBotClient
{
    public function __construct(private readonly EncryptedResumeStorage $encryptedStorage) {}

    public function extract(UserResume $resume, string $processingId): ResumeExtractionResult
    {
        $url = rtrim((string) config('services.bot.url'), '/');
        $token = (string) config('services.bot.token');
        $signingSecret = (string) config('services.bot.signing_secret');

        if ($url === '' || $token === '' || $signingSecret === '') {
            throw ResumeBotException::notConfigured();
        }

        $stream = $this->encryptedStorage->decrypt($resume);

        if (! is_resource($stream)) {
            throw ResumeBotException::fileUnavailable();
        }

        $content = stream_get_contents($stream);

        if ($content === false) {
            fclose($stream);

            throw ResumeBotException::fileUnavailable();
        }

        $contentHash = hash('sha256', $content);
        sodium_memzero($content);
        rewind($stream);
        $timestamp = (string) now()->getTimestamp();
        $nonce = (string) Str::uuid();
        $signature = hash_hmac(
            'sha256',
            implode("\n", [$timestamp, $nonce, $processingId, $contentHash]),
            $signingSecret,
        );

        try {
            $response = Http::acceptJson()
                ->withToken($token)
                ->withHeaders([
                    'X-Talora-Processing-Id' => $processingId,
                    'X-Talora-Timestamp' => $timestamp,
                    'X-Talora-Nonce' => $nonce,
                    'X-Talora-Content-SHA256' => $contentHash,
                    'X-Talora-Signature' => $signature,
                ])
                ->connectTimeout((int) config('services.bot.connect_timeout', 5))
                ->timeout((int) config('services.bot.timeout', 45))
                ->attach(
                    'file',
                    $stream,
                    $resume->original_filename,
                    ['Content-Type' => $resume->mime_type],
                )
                ->post($url . '/api/v1/resumes/extract');
        } catch (ConnectionException $exception) {
            throw ResumeBotException::unavailable($exception);
        } finally {
            if (is_resource($stream)) {
                fclose($stream);
            }
        }

        if (! $response->successful()) {
            throw ResumeBotException::rejected();
        }

        $maximumBytes = (int) config('services.bot.max_response_kb', 2048) * 1024;

        if (strlen($response->body()) > $maximumBytes) {
            throw ResumeBotException::invalidResponse();
        }

        $payload = $response->json();

        if (! is_array($payload)) {
            throw ResumeBotException::invalidResponse();
        }

        $result = ResumeExtractionResult::fromArray($payload);

        if (! hash_equals($processingId, $result->processingId)
            || ! hash_equals($contentHash, $result->document['sha256'])) {
            throw ResumeBotException::invalidResponse();
        }

        return $result;
    }
}
