<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    /**
     * Display the login view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => session('status'),
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        $request->authenticate();

        $request->session()->regenerate();

        $roleName = strtolower((string) ($request->user()?->role?->name ?? ''));
        if (
            str_contains($roleName, 'admin sistem')
            || str_contains($roleName, 'admin system')
            || str_contains($roleName, 'super admin')
        ) {
            return redirect()->intended(route('settings.saas', absolute: false));
        }

        // Skip panduan-setup if all setup steps are already completed
        $user = $request->user();
        $tenantId = (int) ($user->tenant_id ?? 0);
        if ($tenantId <= 0) {
            return redirect()
                ->intended(route('dashboard', absolute: false))
                ->with('auth_onboarding', true);
        }

        $warehouse = \App\Models\Warehouse::query()
            ->when($tenantId > 0, fn ($q) => $q->where('tenant_id', $tenantId))
            ->orderBy('id')->first();

        $allDone = \App\Models\Category::when($tenantId > 0, fn ($q) => $q->where('tenant_id', $tenantId))->exists()
            && \App\Models\Unit::when($tenantId > 0, fn ($q) => $q->where('tenant_id', $tenantId))->exists()
            && $warehouse && \App\Models\WarehouseZone::where('warehouse_id', $warehouse->id)->exists()
            && $warehouse && \App\Models\Rack::whereHas('zone', fn ($q) => $q->where('warehouse_id', $warehouse->id))->exists()
            && \App\Models\Product::when($tenantId > 0, fn ($q) => $q->where('tenant_id', $tenantId))->exists();

        if ($allDone) {
            return redirect()
                ->intended(route('dashboard', absolute: false))
                ->with('auth_onboarding', true);
        }

        return redirect()
            ->intended(route('panduan-setup', absolute: false))
            ->with('auth_onboarding', true);
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();

        $request->session()->regenerateToken();

        return redirect('/');
    }
}
