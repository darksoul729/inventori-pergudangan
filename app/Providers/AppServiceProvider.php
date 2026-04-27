<?php

namespace App\Providers;

use App\Models\PetayuConversation;
use App\Models\Shipment;
use App\Policies\PetayuConversationPolicy;
use App\Policies\ShipmentPolicy;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Force HTTPS for all generated URLs when APP_URL is https (fixes mixed-content behind reverse proxy)
        if (str_starts_with(config('app.url', ''), 'https')) {
            URL::forceScheme('https');
        }

        Gate::policy(PetayuConversation::class, PetayuConversationPolicy::class);
        Gate::policy(Shipment::class, ShipmentPolicy::class);

        // Allow managers to do everything by default
        Gate::before(function ($user, $ability) {
            $role = strtolower($user->role?->name ?? '');
            if (str_contains($role, 'manager') || str_contains($role, 'admin gudang') || str_contains($role, 'manajer')) {
                return true;
            }

            return null; // fall through to policy
        });

        // Define permissions for models without explicit policies
        // These match the route middleware role assignments
        $operationalRoles = function ($user) {
            $role = strtolower($user->role?->name ?? '');
            return in_array(true, [
                str_contains($role, 'manager') || str_contains($role, 'admin gudang') || str_contains($role, 'manajer'),
                str_contains($role, 'supervisor') || str_contains($role, 'spv'),
                str_contains($role, 'staff') || str_contains($role, 'staf'),
            ], true);
        };

        $supervisorAndAbove = function ($user) {
            $role = strtolower($user->role?->name ?? '');
            return in_array(true, [
                str_contains($role, 'manager') || str_contains($role, 'admin gudang') || str_contains($role, 'manajer'),
                str_contains($role, 'supervisor') || str_contains($role, 'spv'),
            ], true);
        };

        $managerOnly = fn ($user) => in_array(true, [str_contains(strtolower($user->role?->name ?? ''), 'manager') || str_contains(strtolower($user->role?->name ?? ''), 'admin gudang') || str_contains(strtolower($user->role?->name ?? ''), 'manajer')]);

        // Product (Inventory) — create/update = manager only
        Gate::define('create-product', $managerOnly);
        Gate::define('update-product', $managerOnly);

        // StockOut — create = all operational roles (matches route middleware)
        Gate::define('create-stockOut', $operationalRoles);

        // StockTransfer, StockOpname — create = supervisor and above
        Gate::define('create-stockTransfer', $supervisorAndAbove);
        Gate::define('create-stockOpname', $supervisorAndAbove);

        // Approve/Reject — supervisor and above (but not self-approval, checked in controller)
        Gate::define('approve-stockOpname', $supervisorAndAbove);
        Gate::define('approve-stockTransfer', $supervisorAndAbove);
        Gate::define('approve-stockAdjustment', $supervisorAndAbove);

        // PurchaseOrder — create/update = supervisor and above
        Gate::define('create-purchaseOrder', $supervisorAndAbove);
        Gate::define('update-purchaseOrder', $supervisorAndAbove);

        // Supplier — create = manager only
        Gate::define('create-supplier', $managerOnly);

        // SupplierPerformance — create = supervisor and above
        Gate::define('create-supplierPerformance', $supervisorAndAbove);

        // StockMovement — update (verify) = supervisor and above
        Gate::define('update-stockMovement', $supervisorAndAbove);

        Vite::prefetch(concurrency: 3);
    }
}
