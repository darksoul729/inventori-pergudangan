<?php

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

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'groq' => [
        'key'   => env('GROQ_API_KEY'),
        'model' => env('GROQ_MODEL', 'llama-3.3-70b-versatile'),
        'url'   => 'https://api.groq.com/openai/v1/chat/completions',
        'timeout' => env('GROQ_TIMEOUT', 25),
        'connect_timeout' => env('GROQ_CONNECT_TIMEOUT', 8),
        'max_tokens' => env('GROQ_MAX_TOKENS', 2048),
        'voice_max_tokens' => env('GROQ_VOICE_MAX_TOKENS', 180),
        'transcription_model' => env('GROQ_TRANSCRIPTION_MODEL', 'whisper-large-v3-turbo'),
        'transcription_url' => 'https://api.groq.com/openai/v1/audio/transcriptions',
    ],

];
