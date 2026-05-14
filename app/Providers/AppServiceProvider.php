<?php

namespace App\Providers;

use App\Models\PetayuConversation;
use App\Models\Shipment;
use App\Policies\PetayuConversationPolicy;
use App\Policies\ShipmentPolicy;
use App\Support\RoleCapability;
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
            if (RoleCapability::isManager($user->role?->name)) {
                return true;
            }

            return null; // fall through to policy
        });

        // Define permissions for models without explicit policies
        // These match the route middleware role assignments
        $operationalRoles = function ($user) {
            return RoleCapability::isOperational($user->role?->name);
        };

        $supervisorAndAbove = function ($user) {
            return RoleCapability::isManager($user->role?->name) || RoleCapability::isSupervisor($user->role?->name);
        };

        $managerOnly = fn ($user) => RoleCapability::isManager($user->role?->name);

        // Product (Inventory) — create/update = manager only
        Gate::define('create-product', $managerOnly);
        Gate::define('update-product', $managerOnly);

        // StockOut — create = all operational roles (matches route middleware)
        Gate::define('create-stockOut', $operationalRoles);

        // StockTransfer, StockOpname — create = all operational (staff bisa input, approve tetap supervisor+)
        Gate::define('create-stockTransfer', $operationalRoles);
        Gate::define('create-stockOpname', $operationalRoles);

        // Approve/Reject — supervisor and above (but not self-approval, checked in controller)
        Gate::define('approve-stockOpname', $supervisorAndAbove);
        Gate::define('approve-stockTransfer', $supervisorAndAbove);
        Gate::define('approve-stockAdjustment', $supervisorAndAbove);

        // PurchaseOrder — create = all operational (staff input), update-status = operational
        // Controller tetap membatasi aksi approval/cancel ke supervisor/manager.
        Gate::define('create-purchaseOrder', $operationalRoles);
        Gate::define('update-purchaseOrder', $operationalRoles);

        // Supplier — create = manager only
        Gate::define('create-supplier', $managerOnly);

        // SupplierPerformance — create = supervisor and above
        Gate::define('create-supplierPerformance', $supervisorAndAbove);

        // StockMovement — update (verify) = supervisor and above
        Gate::define('update-stockMovement', $supervisorAndAbove);

        Vite::prefetch(concurrency: 3);
    }
}
