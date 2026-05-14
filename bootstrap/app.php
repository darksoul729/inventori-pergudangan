<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // Trust all proxies (fixes HTTPS behind nginx/Cloudflare reverse proxy)
        $middleware->trustProxies(at: '*');

        $middleware->web(append: [
            \App\Http\Middleware\EnsureDesktopOnlyDashboard::class,
            \App\Http\Middleware\HandleInertiaRequests::class,
            \Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets::class,
            \App\Http\Middleware\SecurityHeaders::class,
            \App\Http\Middleware\EnsureTenantWriteAccess::class,
        ]);

        $middleware->alias([
            'role' => \App\Http\Middleware\EnsureUserHasRole::class,
            'module' => \App\Http\Middleware\EnsureModuleEnabled::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        $exceptions->respond(function (\Symfony\Component\HttpFoundation\Response $response, \Throwable $exception, \Illuminate\Http\Request $request) {
            if ($response->getStatusCode() === 403 && $request->header('X-Inertia')) {
                $defaultMessage = 'Anda tidak memiliki izin untuk mengakses fitur ini.';
                $message = trim((string) $exception->getMessage()) !== '' ? $exception->getMessage() : $defaultMessage;
                $isModuleLocked = str_contains(strtolower($message), 'modul ini tidak aktif');

                $previousUrl = url()->previous();
                $currentUrl = $request->fullUrl();
                $fallbackUrl = '/dashboard';
                $targetUrl = ($previousUrl && $previousUrl !== $currentUrl) ? $previousUrl : $fallbackUrl;

                return redirect()->to($targetUrl)
                    ->with('forbidden_modal', [
                        'status' => 403,
                        'title' => 'Akses Ditolak',
                        'message' => $message,
                        'module_locked' => $isModuleLocked,
                    ]);
            }

            if (! app()->environment(['local', 'testing']) && in_array($response->getStatusCode(), [500, 503, 404, 403])) {
                return \Inertia\Inertia::render('Error', [
                    'status' => $response->getStatusCode(),
                    'message' => $exception->getMessage()
                ])
                ->toResponse($request)
                ->setStatusCode($response->getStatusCode());
            } elseif (in_array($response->getStatusCode(), [403, 404])) {
                return \Inertia\Inertia::render('Error', [
                    'status' => $response->getStatusCode(),
                    'message' => $exception->getMessage()
                ])
                ->toResponse($request)
                ->setStatusCode($response->getStatusCode());
            }

            return $response;
        });
    })->create();
