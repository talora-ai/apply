<?php

declare(strict_types=1);

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'frontend' => [
        'url' => env('FRONTEND_URL', 'http://localhost:3000'),
    ],

    'mobile' => [
        // Eg: talora-apply
        'url' => env('MOBILE_URL', 'talora-apply://'),
    ],

    'bot' => [
        'url'             => env('BOT_URL', 'http://localhost:9000'),
        'token'           => env('BOT_SERVICE_TOKEN'),
        'signing_secret'  => env('BOT_SIGNING_SECRET'),
        'connect_timeout' => (int) env('BOT_CONNECT_TIMEOUT', 5),
        'timeout'         => (int) env('BOT_TIMEOUT', 45),
        'max_response_kb' => (int) env('BOT_MAX_RESPONSE_KB', 2048),
    ],

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key'    => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel'              => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

];
