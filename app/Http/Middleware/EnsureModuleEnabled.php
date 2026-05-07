<?php

namespace App\Http\Middleware;

use App\Support\SaasEntitlement;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureModuleEnabled
{
    public function __construct(
        private readonly SaasEntitlement $entitlement
    ) {
    }

    public function handle(Request $request, Closure $next, string $moduleCode): Response
    {
        if (!$this->entitlement->moduleEnabledForUser($request->user(), $moduleCode)) {
            abort(403, 'Modul ini tidak aktif di paket Anda.');
        }

        return $next($request);
    }
}

