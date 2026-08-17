<?php

declare(strict_types=1);

use Illuminate\Support\Str;

return [
    'domain' => env('HORIZON_DOMAIN'),
    'path' => env('HORIZON_PATH', 'horizon'),
    'use' => 'default',
    'prefix' => env(
        'HORIZON_PREFIX',
        Str::slug(env('APP_NAME', 'laravel'), '_').'_horizon:'
    ),
    'middleware' => ['web', 'auth:admin'],

    'waits' => [
        'redis:default' => 60,
        'redis:resume-processing' => 120,
    ],

    'trim' => [
        'recent' => 60,
        'pending' => 60,
        'completed' => 60,
        'recent_failed' => 10080,
        'failed' => 10080,
        'monitored' => 10080,
    ],

    'silenced' => [],
    'silenced_tags' => [],

    'metrics' => [
        'trim_snapshots' => [
            'job' => 24,
            'queue' => 24,
        ],
    ],

    'fast_termination' => false,
    'memory_limit' => 128,

    'defaults' => [
        'supervisor-default' => [
            'connection' => 'redis',
            'queue' => ['default'],
            'balance' => 'auto',
            'autoScalingStrategy' => 'time',
            'maxProcesses' => 2,
            'maxTime' => 0,
            'maxJobs' => 0,
            'memory' => 128,
            'tries' => 3,
            'timeout' => 120,
            'nice' => 0,
        ],
        'supervisor-resumes' => [
            'connection' => 'redis',
            'queue' => ['resume-processing'],
            'balance' => 'auto',
            'autoScalingStrategy' => 'time',
            'maxProcesses' => 3,
            'maxTime' => 0,
            'maxJobs' => 0,
            'memory' => 256,
            'tries' => 3,
            'timeout' => 300,
            'nice' => 0,
        ],
    ],

    'environments' => [
        'production' => [
            'supervisor-default' => [
                'maxProcesses' => 5,
            ],
            'supervisor-resumes' => [
                'maxProcesses' => 10,
            ],
        ],
        'local' => [
            'supervisor-default' => [
                'maxProcesses' => 2,
            ],
            'supervisor-resumes' => [
                'maxProcesses' => 3,
            ],
        ],
        '*' => [
            'supervisor-default' => [
                'maxProcesses' => 2,
            ],
            'supervisor-resumes' => [
                'maxProcesses' => 2,
            ],
        ],
    ],
];
