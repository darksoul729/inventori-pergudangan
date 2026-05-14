<?php

namespace App\Http\Middleware;

use App\Support\SaasEntitlement;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureTenantWriteAccess
{
    public function __construct(
        private readonly SaasEntitlement $entitlement
    ) {
    }

    public function handle(Request $request, Closure $next): Response
    {
        if (in_array($request->method(), ['GET', 'HEAD', 'OPTIONS'], true)) {
            return $next($request);
        }

        $user = $request->user();
        if (!$user || !$user->tenant_id) {
            return $next($request);
        }

        $routeName = (string) ($request->route()?->getName() ?? '');
        if (str_starts_with($routeName, 'settings.billing')
            || $routeName === 'logout'
            || str_starts_with($routeName, 'verification.')
            || str_starts_with($routeName, 'password.')
            || str_starts_with($routeName, 'profile.')) {
            return $next($request);
        }

        $entitlement = $this->entitlement->resolveForUser($user);
        if ((bool) ($entitlement['write_locked'] ?? false)) {
            abort(403, 'Masa tenggang berakhir. Paket belum aktif, aksi ubah data dinonaktifkan sementara.');
        }

        return $next($request);
    }
}

