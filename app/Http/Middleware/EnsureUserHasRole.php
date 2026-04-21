<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserHasRole
{
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        if (!$user) {
            abort(403);
        }

        $currentRole = $this->normalizeRole($user->role?->name);
        $allowedRoles = array_map(fn ($role) => $this->normalizeRole($role), $roles);

        if (!$currentRole || !in_array($currentRole, $allowedRoles, true)) {
            abort(403, 'Anda tidak memiliki izin untuk mengakses halaman ini.');
        }

        return $next($request);
    }

    private function normalizeRole(?string $roleName): ?string
    {
        if (!$roleName) {
            return null;
        }

        $value = strtolower($roleName);

        if (str_contains($value, 'admin gudang') || str_contains($value, 'manager') || str_contains($value, 'manajer')) {
            return 'manager';
        }

        if (str_contains($value, 'supervisor') || str_contains($value, 'spv')) {
            return 'supervisor';
        }

        if (str_contains($value, 'staff') || str_contains($value, 'staf')) {
            return 'staff';
        }

        if (str_contains($value, 'driver')) {
            return 'driver';
        }

        return $value;
    }
}
