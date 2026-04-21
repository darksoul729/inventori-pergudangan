<?php

namespace App\Providers;

use App\Models\AetherConversation;
use App\Policies\AetherConversationPolicy;
use Illuminate\Support\Facades\Gate;
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
        Gate::policy(AetherConversation::class, AetherConversationPolicy::class);
        Vite::prefetch(concurrency: 3);
    }
}
