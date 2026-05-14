<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response;

class EnsureDesktopOnlyDashboard
{
    public function handle(Request $request, Closure $next): Response
    {
        if (!$request->user()) {
            return $next($request);
        }

        // Always allow logout so blocked mobile users can exit session.
        if ($request->routeIs('logout') || $request->is('logout')) {
            return $next($request);
        }

        // Apply only to web pages (Inertia/HTML), not API calls/download assets.
        if ($request->expectsJson() || !$request->acceptsHtml()) {
            return $next($request);
        }

        if (!$this->isMobileRequest($request)) {
            return $next($request);
        }

        return Inertia::render('Error', [
            'status' => 403,
            'message' => 'Akses dashboard hanya tersedia untuk perangkat desktop/laptop.',
        ])->toResponse($request)->setStatusCode(403);
    }

    private function isMobileRequest(Request $request): bool
    {
        $chMobile = strtolower((string) $request->header('sec-ch-ua-mobile'));
        if ($chMobile === '?1') {
            return true;
        }

        $ua = strtolower((string) $request->userAgent());
        if ($ua === '') {
            return false;
        }

        return (bool) preg_match('/android|iphone|ipad|ipod|blackberry|opera mini|iemobile|mobile/i', $ua);
    }
}
