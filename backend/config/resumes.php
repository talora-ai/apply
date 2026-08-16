<?php

declare(strict_types=1);

return [
    'encryption' => [
        'key'                => env('RESUME_ENCRYPTION_KEY'),
        'key_version'        => env('RESUME_ENCRYPTION_KEY_VERSION', 'v1'),
        'memory_limit_bytes' => (int) env('RESUME_ENCRYPTION_MEMORY_BYTES', 12 * 1024 * 1024),
    ],
    'data_encryption' => [
        'key'         => env('RESUME_DATA_ENCRYPTION_KEY'),
        'key_version' => env('RESUME_DATA_ENCRYPTION_KEY_VERSION', 'v1'),
    ],
];
