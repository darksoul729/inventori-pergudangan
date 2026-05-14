<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Mail\PetayuSystemMail;
use App\Models\Module;
use App\Models\Plan;
use App\Models\Role;
use App\Models\SaasAuditLog;
use App\Models\SubscriptionPayment;
use App\Models\Tenant;
use App\Models\TenantModule;
use App\Models\TenantSubscription;
use App\Models\User;
use App\Models\Warehouse;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    private const PAYMENT_TIMEOUT_HOURS = 24;

    public function create(): Response
    {
        $moduleMeta = [
            'core_inventory' => ['category' => 'Inti Gudang', 'description' => 'Stok, produk, supplier, barang masuk/keluar.'],
            'warehouse_ops' => ['category' => 'Inti Gudang', 'description' => 'Pindah rak, stock opname, dokumen gudang.'],
            'shipment' => ['category' => 'Operasional Lanjut', 'description' => 'Pengiriman, driver, dan tracking.'],
            'invoicing' => ['category' => 'Keuangan', 'description' => 'Tagihan, status bayar, dan invoice PDF.'],
            'reports_advanced' => ['category' => 'Keuangan', 'description' => 'Laporan analitik dan ringkasan operasional.'],
            'ai_contextual' => ['category' => 'AI Asisten', 'description' => 'Saran kontekstual untuk keputusan harian.'],
        ];

        $moduleOptions = collect(config('saas.modules', []))
            ->map(function (array $module, string $code) use ($moduleMeta) {
                $meta = $moduleMeta[$code] ?? ['category' => 'Lainnya', 'description' => 'Modul operasional tambahan.'];
                return [
                    'code' => $code,
                    'name' => (string) ($module['name'] ?? $code),
                    'required' => (bool) ($module['required'] ?? false),
                    'category' => $meta['category'],
                    'description' => $meta['description'],
                ];
            })
            ->values();

        return Inertia::render('Auth/Register', [
            'moduleOptions' => $moduleOptions,
            'trialDays' => (int) config('saas.trial_days', 3),
            'planOptions' => Plan::query()
                ->where('is_public', true)
                ->orderBy('monthly_price')
                ->get(['id', 'code', 'name', 'monthly_price', 'yearly_price', 'metadata'])
                ->map(fn (Plan $plan) => [
                    'id' => $plan->id,
                    'code' => $plan->code,
                    'name' => $plan->name,
                    'monthly_price' => (int) ($plan->monthly_price ?? 0),
                    'yearly_price' => (int) ($plan->yearly_price ?? 0),
                    'metadata' => $plan->metadata ?? [],
                ])
                ->values(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => [
                'required', 'string', 'email', 'max:255', 'unique:users,email',
                function ($attribute, $value, $fail) {
                    $domain = substr(strrchr($value, "@"), 1);
                    $blockedDomains = [
                        'mailinator.com', 'yopmail.com', '10minutemail.com',
                        'guerrillamail.com', 'temp-mail.org', 'throwawaymail.com',
                        'tempmail.com', 'tempmail.net', 'tempmail.org', 'tempmail.io'
                    ];
                    if (in_array(strtolower($domain), $blockedDomains)) {
                        $fail('Pendaftaran tidak dapat menggunakan email sementara.');
                    }
                },
            ],
            'phone' => ['nullable', 'string', 'max:30'],
            'company_name' => ['required', 'string', 'max:255'],
            'warehouse_name' => ['required', 'string', 'max:255'],
            'city' => ['required', 'string', 'max:120'],
            'password' => ['required', 'confirmed', 'min:8'],
            'selected_modules' => ['nullable', 'array'],
            'selected_modules.*' => ['string'],
            'onboarding_mode' => ['nullable', 'in:trial,paid'],
            'selected_plan_code' => ['nullable', 'string', 'exists:plans,code'],
        ]);

        if (($validated['onboarding_mode'] ?? 'trial') === 'paid' && empty($validated['selected_plan_code'])) {
            return back()->withErrors([
                'selected_plan_code' => 'Pilih paket berbayar terlebih dahulu.',
            ])->withInput();
        }

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
            'email_verified_at' => null,
        ]);

        // Auto-create main warehouse from onboarding form.
        Warehouse::query()->create([
            'tenant_id' => $tenant->id,
            'code' => 'WH-UTAMA',
            'name' => $validated['warehouse_name'],
            'location' => $validated['city'],
            'description' => 'Gudang utama hasil onboarding registrasi trial.',
        ]);

        $trialDays = (int) config('saas.trial_days', 3);
        $onboardingMode = $validated['onboarding_mode'] ?? 'trial';

        $trialPlan = Plan::query()->where('code', 'trial_3d')->first()
            ?? Plan::query()->where('code', 'pro')->first();

        $selectedPaidPlan = null;
        if ($onboardingMode === 'paid' && !empty($validated['selected_plan_code'])) {
            $selectedPaidPlan = Plan::query()
                ->where('is_public', true)
                ->where('code', $validated['selected_plan_code'])
                ->first();
        }

        $subscriptionPlan = $onboardingMode === 'paid'
            ? ($selectedPaidPlan ?? $trialPlan)
            : ($trialPlan ?? Plan::query()->where('is_public', true)->orderBy('id')->first());

        $subscription = null;
        if ($subscriptionPlan) {
            $subscription = TenantSubscription::query()->create([
                'tenant_id' => $tenant->id,
                'plan_id' => $subscriptionPlan->id,
                'status' => $onboardingMode === 'paid' ? 'past_due' : 'trialing',
                'starts_at' => now(),
                'trial_ends_at' => $onboardingMode === 'trial' ? now()->addDays($trialDays) : null,
            ]);
        }

        $validModuleCodes = collect(array_keys(config('saas.modules', [])));
        $selectedModules = collect($validated['selected_modules'] ?? [])
            ->filter(fn ($code) => is_string($code))
            ->map(fn ($code) => trim($code))
            ->filter(fn ($code) => $validModuleCodes->contains($code))
            ->unique()
            ->values();

        $requiredModules = collect(config('saas.modules', []))
            ->filter(fn ($item) => (bool) ($item['required'] ?? false))
            ->keys();

        $finalModuleCodes = $selectedModules
            ->merge($requiredModules)
            ->unique()
            ->values();

        $moduleRecords = Module::query()
            ->whereIn('code', $finalModuleCodes)
            ->get()
            ->keyBy('code');

        foreach ($finalModuleCodes as $moduleCode) {
            $module = $moduleRecords->get($moduleCode);
            if (!$module) {
                continue;
            }

            TenantModule::query()->updateOrCreate(
                [
                    'tenant_id' => $tenant->id,
                    'module_id' => $module->id,
                ],
                [
                    'is_enabled' => true,
                    'source' => 'onboarding',
                    'starts_at' => now(),
                    'ends_at' => null,
                ]
            );
        }

        event(new Registered($user));
        // Fallback: bila listener verifikasi email tidak aktif, kirim OTP langsung.
        if (empty($user->emailVerificationMeta()['sent_at'] ?? null)) {
            $user->sendEmailVerificationNotification();
        }
        Auth::login($user);

        SaasAuditLog::query()->create([
            'tenant_id' => $tenant->id,
            'actor_user_id' => $user->id,
            'event_type' => 'onboarding.register_completed',
            'target_type' => 'tenants',
            'target_id' => $tenant->id,
            'payload' => [
                'mode' => $onboardingMode,
                'selected_plan_code' => $selectedPaidPlan?->code,
                'selected_modules' => $finalModuleCodes->values()->all(),
            ],
        ]);

        $paymentMeta = [
            'status' => 'not_required',
            'payment_url' => null,
            'order_id' => null,
            'expires_at' => null,
        ];

        if ($onboardingMode === 'paid' && $selectedPaidPlan && $subscription) {
            $paymentMeta = $this->createInitialPendingPayment(
                user: $user,
                tenant: $tenant,
                subscription: $subscription,
                selectedPlan: $selectedPaidPlan
            );
        }

        if ($onboardingMode === 'trial') {
            return redirect()
                ->route('dashboard')
                ->with('auth_onboarding', true);
        }

        return redirect()
            ->route('register.success')
            ->with('register_success', [
                'mode' => $onboardingMode,
                'company_name' => $tenant->name,
                'email' => $user->email,
                'plan_name' => $subscriptionPlan?->name,
                'payment' => $paymentMeta,
            ]);
    }

    public function success(Request $request): RedirectResponse|Response
    {
        $user = $request->user();
        if ($user && !$user->hasVerifiedEmail()) {
            return redirect()->route('verification.notice');
        }

        $payload = $request->session()->get('register_success');
        if (!is_array($payload)) {
            return Inertia::render('Auth/RegisterSuccess', [
                'successData' => null,
            ]);
        }

        return Inertia::render('Auth/RegisterSuccess', [
            'successData' => $payload,
        ]);
    }

    private function createInitialPendingPayment(User $user, Tenant $tenant, TenantSubscription $subscription, Plan $selectedPlan): array
    {
        $amount = (int) ($selectedPlan->monthly_price ?? 0);
        if ($amount <= 0) {
            return [
                'status' => 'plan_without_price',
                'payment_url' => null,
                'order_id' => null,
                'expires_at' => null,
            ];
        }

        $serverKey = (string) config('services.midtrans.server_key');
        if ($serverKey === '') {
            return [
                'status' => 'midtrans_key_missing',
                'payment_url' => null,
                'order_id' => null,
                'expires_at' => null,
            ];
        }

        $orderId = 'SUB-' . now()->format('YmdHis') . '-' . strtoupper(substr(md5((string) microtime(true)), 0, 8));
        $payload = [
            'transaction_details' => [
                'order_id' => $orderId,
                'gross_amount' => $amount,
            ],
            'customer_details' => [
                'first_name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
            ],
            'item_details' => [[
                'id' => 'sub-' . $selectedPlan->code,
                'price' => $amount,
                'quantity' => 1,
                'name' => 'Langganan ' . $selectedPlan->name,
            ]],
            'callbacks' => [
                'finish' => route('settings.billing'),
                'error' => route('settings.billing'),
                'pending' => route('settings.billing'),
            ],
        ];

        try {
            $response = Http::withBasicAuth($serverKey, '')
                ->acceptJson()
                ->timeout(20)
                ->retry(2, 400)
                ->post(rtrim((string) config('services.midtrans.base_url'), '/') . '/snap/v1/transactions', $payload);
        } catch (ConnectionException $e) {
            Log::warning('Midtrans onboarding auto-checkout connection failed', ['message' => $e->getMessage()]);
            return [
                'status' => 'gateway_unreachable',
                'payment_url' => null,
                'order_id' => null,
                'expires_at' => null,
            ];
        } catch (\Throwable $e) {
            Log::warning('Midtrans onboarding auto-checkout failed', ['message' => $e->getMessage()]);
            return [
                'status' => 'gateway_error',
                'payment_url' => null,
                'order_id' => null,
                'expires_at' => null,
            ];
        }

        if (!$response->successful()) {
            Log::warning('Midtrans onboarding auto-checkout rejected', [
                'status' => $response->status(),
                'body' => $response->json() ?: $response->body(),
            ]);
            return [
                'status' => 'gateway_rejected',
                'payment_url' => null,
                'order_id' => null,
                'expires_at' => null,
            ];
        }

        $json = $response->json();
        $expiresAt = now()->addHours(self::PAYMENT_TIMEOUT_HOURS);

        SubscriptionPayment::query()->create([
            'tenant_subscription_id' => $subscription->id,
            'tenant_id' => $tenant->id,
            'provider' => 'midtrans',
            'provider_order_id' => $orderId,
            'amount' => $amount,
            'currency' => 'IDR',
            'status' => 'pending',
            'payment_url' => $json['redirect_url'] ?? null,
            'raw_payload' => array_merge($json, [
                'selected_plan_code' => $selectedPlan->code,
                'purchase_action' => 'upgrade',
                'expires_at' => $expiresAt->toIso8601String(),
                'timeout_hours' => self::PAYMENT_TIMEOUT_HOURS,
                'source' => 'register_onboarding',
            ]),
        ]);

        SaasAuditLog::query()->create([
            'tenant_id' => $tenant->id,
            'actor_user_id' => $user->id,
            'event_type' => 'onboarding.pending_payment_created',
            'target_type' => 'tenant_subscriptions',
            'target_id' => $subscription->id,
            'payload' => [
                'order_id' => $orderId,
                'plan_code' => $selectedPlan->code,
                'amount' => $amount,
                'expires_at' => $expiresAt->toIso8601String(),
            ],
        ]);

        return [
            'status' => 'pending_created',
            'payment_url' => $json['redirect_url'] ?? null,
            'order_id' => $orderId,
            'expires_at' => $expiresAt->format('d M Y H:i'),
            'expires_at_iso' => $expiresAt->toIso8601String(),
        ];
    }
}
