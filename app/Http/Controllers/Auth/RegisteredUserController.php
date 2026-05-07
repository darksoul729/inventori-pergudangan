<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Plan;
use App\Models\Role;
use App\Models\Tenant;
use App\Models\TenantSubscription;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    public function create(): Response
    {
        return Inertia::render('Auth/Register');
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'phone' => ['nullable', 'string', 'max:30'],
            'company_name' => ['required', 'string', 'max:255'],
            'warehouse_name' => ['required', 'string', 'max:255'],
            'city' => ['required', 'string', 'max:120'],
            'password' => ['required', 'confirmed', 'min:8'],
        ]);

        $managerRole = Role::query()->firstOrCreate(
            ['name' => 'Manager'],
            ['description' => 'Akses penuh operasional gudang, persetujuan, dan monitoring kinerja']
        );

        $slugBase = Str::slug($validated['company_name']);
        $slug = $slugBase;
        $i = 2;
        while (Tenant::query()->where('slug', $slug)->exists()) {
            $slug = $slugBase . '-' . $i++;
        }

        $tenant = Tenant::query()->create([
            'code' => 'TEN-' . strtoupper(Str::random(6)),
            'name' => $validated['company_name'],
            'slug' => $slug,
            'status' => 'active',
            'timezone' => 'Asia/Makassar',
            'locale' => 'id',
        ]);

        $user = User::query()->create([
            'tenant_id' => $tenant->id,
            'role_id' => $managerRole->id,
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'] ?? null,
            'password' => Hash::make($validated['password']),
            'status' => 'active',
            'email_verified_at' => now(),
        ]);

        $trialPlan = Plan::query()->where('code', 'trial_3d')->first()
            ?? Plan::query()->where('code', 'pro')->first()
            ?? Plan::query()->orderBy('id')->first();

        if ($trialPlan) {
            TenantSubscription::query()->create([
                'tenant_id' => $tenant->id,
                'plan_id' => $trialPlan->id,
                'status' => 'trialing',
                'starts_at' => now(),
                'trial_ends_at' => now()->addDays((int) config('saas.trial_days', 3)),
            ]);
        }

        event(new Registered($user));
        Auth::login($user);

        return redirect()->route('dashboard');
    }
}

