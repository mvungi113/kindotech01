<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | Here you may configure your settings for cross-origin resource sharing
    | or "CORS". This determines what cross-origin operations may execute
    | in web browsers. You are free to adjust these settings as needed.
    |
    | To learn more: https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
    |
    */

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    /*
    |-----------------------------------------------------------------
    | Allowed Origins
    |-----------------------------------------------------------------
    |
    | Read allowed origins from the environment so we can configure
    | different frontends for local development and production.
    | Provide a comma-separated list in the env variable
    | `CORS_ALLOWED_ORIGINS` (e.g. "http://localhost:3000,https://myapp.com").
    |
    */
    'allowed_origins' => array_unique(array_merge(
        // Default allowed origins
        [
            'http://localhost:3000',
            'https://brave-wisdom-production.up.railway.app',
            // Frontend deployed on Vercel for keysblog
            'https://keysblog.vercel.app',
            // Preview/deployment hostname used by Vercel (project-specific)
            'https://keysblog-qz6jmqk3z-rogasians-projects.vercel.app',
        ],
        // Additional origins from environment variable
        array_filter(array_map('trim', explode(',', env('CORS_ALLOWED_ORIGINS', ''))))
    )),

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => true,

];