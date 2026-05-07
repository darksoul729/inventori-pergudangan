<?php

namespace App\Http\Controllers;

use Barryvdh\DomPDF\Facade\Pdf;
use App\Models\Plan;
use App\Models\SubscriptionPayment;
use App\Models\Tenant;
use App\Models\TenantSubscription;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class BillingController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $tenantId = $this->resolveTenantId($user);
        $subscription = TenantSubscription::query()
            ->with('plan')
            ->where('tenant_id', $tenantId)
            ->latest('id')
            ->first();

        $pendingPayments = SubscriptionPayment::query()
            ->where('tenant_id', $tenantId)
            ->where('status', 'pending')
            ->latest('id')
            ->limit(10)
            ->get();

        foreach ($pendingPayments as $pendingPayment) {
            $this->syncPaymentStatusFromMidtrans($pendingPayment);
        }

        $payments = SubscriptionPayment::query()
            ->where('tenant_id', $tenantId)
            ->latest('id')
            ->limit(20)
            ->get()
            ->map(fn (SubscriptionPayment $payment) => [
                'id' => $payment->id,
                'order_id' => $payment->provider_order_id,
                'amount' => $payment->amount,
                'status' => $payment->status,
                'payment_url' => $payment->payment_url,
                'can_retry' => $payment->status === 'pending' && !empty($payment->payment_url),
                'invoice_url' => $payment->status === 'paid' ? route('settings.billing.invoice', $payment->id) : null,
                'created_at' => $payment->created_at?->format('d M Y H:i'),
            ]);

        $plans = collect(config('saas.plans', []))
            ->map(function (array $plan, string $code) use ($subscription) {
                $limitWarehouses = (int) ($plan['limits']['warehouses'] ?? 0);
                $limitUsers = (int) ($plan['limits']['users'] ?? 0);
                $planPrice = (int) ($plan['price_monthly'] ?? 0);
                $currentPrice = (int) ($subscription?->plan?->monthly_price ?? 0);
                $action = 'choose';
                if ($subscription?->plan?->code === $code) {
                    $action = 'renew';
                } elseif ($planPrice > $currentPrice) {
                    $action = 'upgrade';
                } elseif ($planPrice < $currentPrice) {
                    $action = 'downgrade';
                }

                return [
                    'code' => $code,
                    'name' => (string) ($plan['name'] ?? strtoupper($code)),
                    'tagline' => (string) ($plan['tagline'] ?? ''),
                    'price_monthly' => $planPrice,
                    'benefits' => array_values($plan['benefits'] ?? []),
                    'modules_count' => count($plan['modules'] ?? []),
                    'limits' => [
                        'warehouses' => $limitWarehouses >= 999 ? 'Tidak terbatas' : $limitWarehouses,
                        'users' => $limitUsers >= 999 ? 'Tidak terbatas' : $limitUsers,
                    ],
                    'recommended' => (bool) ($plan['recommended'] ?? false),
                    'is_current' => ($subscription?->plan?->code === $code),
                    'action' => $action,
                ];
            })
            ->values();

        return Inertia::render('Saas/Billing', [
            'subscription' => $subscription ? [
                'id' => $subscription->id,
                'plan' => $subscription->plan?->name ?? '-',
                'plan_code' => $subscription->plan?->code,
                'status' => $subscription->status,
                'trial_ends_at' => optional($subscription->trial_ends_at)->format('d M Y'),
                'starts_at' => optional($subscription->starts_at)->format('d M Y'),
                'ends_at' => optional($subscription->ends_at)->format('d M Y'),
            ] : null,
            'payments' => $payments,
            'plans' => $plans,
            'midtrans' => [
                'client_key' => (string) config('services.midtrans.client_key'),
                'is_sandbox' => str_contains((string) config('services.midtrans.base_url'), 'sandbox'),
            ],
        ]);
    }

    public function checkout(Request $request): JsonResponse|RedirectResponse
    {
        $validated = $request->validate([
            'plan_code' => ['nullable', 'string', 'exists:plans,code'],
        ]);

        $user = $request->user();
        $tenantId = $this->resolveTenantId($user);

        $subscription = TenantSubscription::query()
            ->with('plan')
            ->where('tenant_id', $tenantId)
            ->latest('id')
            ->first();

        if (!$subscription) {
            $defaultPlan = Plan::query()->where('code', 'pro')->first()
                ?? Plan::query()->where('code', 'trial_3d')->first()
                ?? Plan::query()->orderBy('id')->first();

            if (!$defaultPlan) {
                return back()->with('error', 'Data paket belum tersedia. Jalankan seeder SaaS terlebih dahulu.');
            }

            $subscription = TenantSubscription::query()->create([
                'tenant_id' => $tenantId,
                'plan_id' => $defaultPlan->id,
                'status' => 'trialing',
                'starts_at' => now(),
                'trial_ends_at' => now()->addDays((int) config('saas.trial_days', 3)),
            ])->load('plan');
        }

        $selectedPlan = null;
        if (!empty($validated['plan_code'])) {
            $selectedPlan = Plan::query()->where('code', $validated['plan_code'])->first();
        }

        $targetPlan = $selectedPlan ?: $subscription->plan;
        $currentPlan = $subscription->plan;
        $currentPrice = (int) ($currentPlan?->monthly_price ?? 0);
        $targetPrice = (int) ($targetPlan?->monthly_price ?? 0);
        $purchaseAction = $targetPlan?->code === $currentPlan?->code
            ? 'renew'
            : ($targetPrice > $currentPrice ? 'upgrade' : 'downgrade');

        if ($purchaseAction === 'downgrade') {
            return response()->json([
                'message' => 'Downgrade belum bisa otomatis dari halaman ini. Silakan selesaikan masa paket aktif lalu ganti paket.',
            ], 422);
        }

        $amount = (int) ($targetPlan?->monthly_price ?? 0);
        if ($amount <= 0) {
            return response()->json(['message' => 'Plan ini belum memiliki harga bulanan.'], 422);
        }

        $existingPending = SubscriptionPayment::query()
            ->where('tenant_id', $tenantId)
            ->where('status', 'pending')
            ->where('amount', $amount)
            ->latest('id')
            ->first();

        if ($existingPending && !empty($existingPending->payment_url)) {
            return response()->json([
                'ok' => true,
                'snap_token' => data_get($existingPending->raw_payload, 'token'),
                'redirect_url' => $existingPending->payment_url,
                'order_id' => $existingPending->provider_order_id,
            ]);
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
                'id' => 'sub-' . ($targetPlan?->code ?? 'plan'),
                'price' => $amount,
                'quantity' => 1,
                'name' => 'Langganan ' . ($targetPlan?->name ?? 'PETAYU'),
            ]],
            'callbacks' => [
                'finish' => route('settings.billing'),
                'error' => route('settings.billing'),
                'pending' => route('settings.billing'),
            ],
        ];

        $serverKey = (string) config('services.midtrans.server_key');
        if ($serverKey === '') {
            return response()->json(['message' => 'MIDTRANS_SERVER_KEY belum diatur.'], 422);
        }

        try {
            $response = Http::withBasicAuth($serverKey, '')
                ->acceptJson()
                ->timeout(20)
                ->retry(2, 400)
                ->post(rtrim((string) config('services.midtrans.base_url'), '/') . '/snap/v1/transactions', $payload);
        } catch (ConnectionException $e) {
            Log::warning('Midtrans checkout connection failed', [
                'message' => $e->getMessage(),
            ]);
            return response()->json(['message' => 'Koneksi ke gateway pembayaran sedang bermasalah. Coba lagi 1-2 menit.'], 422);
        } catch (\Throwable $e) {
            Log::warning('Midtrans checkout exception', [
                'message' => $e->getMessage(),
            ]);
            return response()->json(['message' => 'Terjadi kendala saat membuat transaksi pembayaran. Coba lagi.'], 422);
        }

        if (!$response->successful()) {
            Log::warning('Midtrans checkout failed', [
                'status' => $response->status(),
                'body' => $response->json() ?: $response->body(),
            ]);
            $apiMessage = (string) ($response->json('status_message') ?? $response->json('error_messages.0') ?? '');
            return response()->json(['message' => 'Gagal membuat transaksi pembayaran Midtrans.' . ($apiMessage !== '' ? ' ' . $apiMessage : '')], 422);
        }

        $json = $response->json();

        SubscriptionPayment::query()->create([
            'tenant_subscription_id' => $subscription->id,
            'tenant_id' => $tenantId,
            'provider' => 'midtrans',
            'provider_order_id' => $orderId,
            'amount' => $amount,
            'currency' => 'IDR',
            'status' => 'pending',
            'payment_url' => $json['redirect_url'] ?? null,
            'raw_payload' => array_merge($json, [
                'selected_plan_code' => $targetPlan?->code,
                'purchase_action' => $purchaseAction,
            ]),
        ]);

        return response()->json([
            'ok' => true,
            'snap_token' => $json['token'] ?? null,
            'redirect_url' => $json['redirect_url'] ?? null,
            'order_id' => $orderId,
        ]);
    }

    public function webhook(Request $request)
    {
        $signatureKey = (string) $request->input('signature_key');
        $orderId = (string) $request->input('order_id');
        $statusCode = (string) $request->input('status_code');
        $grossAmount = (string) $request->input('gross_amount');
        $serverKey = (string) config('services.midtrans.server_key');

        $expected = hash('sha512', $orderId . $statusCode . $grossAmount . $serverKey);
        if ($signatureKey === '' || !hash_equals($expected, $signatureKey)) {
            return response()->json(['message' => 'invalid signature'], 403);
        }

        $transactionStatus = (string) $request->input('transaction_status');
        $fraudStatus = (string) $request->input('fraud_status');
        $status = match (true) {
            in_array($transactionStatus, ['capture', 'settlement'], true) && ($fraudStatus === '' || $fraudStatus === 'accept') => 'paid',
            in_array($transactionStatus, ['deny', 'cancel', 'expire'], true) => 'failed',
            default => 'pending',
        };

        $payment = SubscriptionPayment::query()->where('provider_order_id', $orderId)->first();
        if ($payment) {
            $previousPayload = is_array($payment->raw_payload) ? $payment->raw_payload : [];
            $payment->update([
                'provider_transaction_id' => $request->input('transaction_id'),
                'status' => $status,
                'raw_payload' => array_merge($previousPayload, ['webhook' => $request->all()]),
            ]);

            if ($payment->tenant_subscription_id) {
                $subscription = TenantSubscription::query()->find($payment->tenant_subscription_id);
                if ($subscription) {
                    $selectedPlanCode = (string) data_get($previousPayload, 'selected_plan_code');
                    $selectedPlan = $selectedPlanCode !== ''
                        ? Plan::query()->where('code', $selectedPlanCode)->first()
                        : Plan::query()->where('monthly_price', (int) $payment->amount)->orderByDesc('id')->first();
                    $purchaseAction = (string) data_get($previousPayload, 'purchase_action', 'renew');

                    $subscription->update([
                        'plan_id' => $status === 'paid' && $selectedPlan && $purchaseAction === 'upgrade'
                            ? $selectedPlan->id
                            : $subscription->plan_id,
                        'status' => $status === 'paid'
                            ? 'active'
                            : (($status === 'failed' && $subscription->status !== 'active') ? 'past_due' : $subscription->status),
                        'trial_ends_at' => $status === 'paid' ? now() : $subscription->trial_ends_at,
                        'starts_at' => $status === 'paid' ? ($subscription->starts_at ?? now()) : $subscription->starts_at,
                        'ends_at' => $status === 'paid'
                            ? (($subscription->ends_at && $subscription->ends_at->isFuture()
                                ? $subscription->ends_at
                                : now())->copy()->addMonth())
                            : $subscription->ends_at,
                    ]);
                }
            }
        }

        return response()->json(['ok' => true]);
    }

    private function syncPaymentStatusFromMidtrans(SubscriptionPayment $payment): void
    {
        $serverKey = (string) config('services.midtrans.server_key');
        if ($serverKey === '' || $payment->provider_order_id === '') {
            return;
        }

        $baseUrl = rtrim((string) config('services.midtrans.base_url'), '/');
        try {
            $response = Http::withBasicAuth($serverKey, '')
                ->acceptJson()
                ->timeout(12)
                ->retry(2, 300)
                ->get($baseUrl . '/v2/' . rawurlencode($payment->provider_order_id) . '/status');
        } catch (ConnectionException $e) {
            Log::warning('Midtrans status sync connection failed', [
                'order_id' => $payment->provider_order_id,
                'message' => $e->getMessage(),
            ]);
            return;
        } catch (\Throwable $e) {
            Log::warning('Midtrans status sync failed', [
                'order_id' => $payment->provider_order_id,
                'message' => $e->getMessage(),
            ]);
            return;
        }

        if (!$response->successful()) {
            return;
        }

        $transactionStatus = (string) $response->json('transaction_status');
        $fraudStatus = (string) $response->json('fraud_status');
        $mappedStatus = match (true) {
            in_array($transactionStatus, ['capture', 'settlement'], true) && ($fraudStatus === '' || $fraudStatus === 'accept') => 'paid',
            in_array($transactionStatus, ['deny', 'cancel', 'expire'], true) => 'failed',
            default => 'pending',
        };

        if ($mappedStatus === $payment->status) {
            return;
        }

        $payment->update([
            'provider_transaction_id' => $response->json('transaction_id') ?: $payment->provider_transaction_id,
            'status' => $mappedStatus,
            'raw_payload' => array_merge(
                is_array($payment->raw_payload) ? $payment->raw_payload : [],
                ['status_check' => $response->json()]
            ),
        ]);

        if ($payment->tenant_subscription_id) {
            $subscription = TenantSubscription::query()->find($payment->tenant_subscription_id);
            if ($subscription) {
                $selectedPlanCode = (string) data_get($payment->raw_payload, 'selected_plan_code');
                $selectedPlan = $selectedPlanCode !== ''
                    ? Plan::query()->where('code', $selectedPlanCode)->first()
                    : Plan::query()->where('monthly_price', (int) $payment->amount)->orderByDesc('id')->first();
                $purchaseAction = (string) data_get($payment->raw_payload, 'purchase_action', 'renew');

                $subscription->update([
                    'plan_id' => $mappedStatus === 'paid' && $selectedPlan && $purchaseAction === 'upgrade'
                        ? $selectedPlan->id
                        : $subscription->plan_id,
                    'status' => $mappedStatus === 'paid'
                        ? 'active'
                        : (($mappedStatus === 'failed' && $subscription->status !== 'active') ? 'past_due' : $subscription->status),
                    'trial_ends_at' => $mappedStatus === 'paid' ? now() : $subscription->trial_ends_at,
                    'starts_at' => $mappedStatus === 'paid' ? ($subscription->starts_at ?? now()) : $subscription->starts_at,
                    'ends_at' => $mappedStatus === 'paid'
                        ? (($subscription->ends_at && $subscription->ends_at->isFuture()
                            ? $subscription->ends_at
                            : now())->copy()->addMonth())
                        : $subscription->ends_at,
                ]);
            }
        }
    }

    private function resolveTenantId($user): int
    {
        if ($user->tenant_id) {
            return (int) $user->tenant_id;
        }

        $tenant = Tenant::query()->first();
        if (!$tenant) {
            $tenant = Tenant::query()->create([
                'code' => 'TENANT-DEFAULT',
                'name' => 'Tenant Default',
                'status' => 'active',
            ]);
        }

        $user->tenant_id = $tenant->id;
        $user->save();

        return (int) $tenant->id;
    }

    public function invoice(Request $request, SubscriptionPayment $payment)
    {
        $tenantId = $this->resolveTenantId($request->user());
        if ((int) $payment->tenant_id !== (int) $tenantId) {
            abort(403, 'Anda tidak memiliki akses ke invoice ini.');
        }

        $subscription = TenantSubscription::query()
            ->with('plan')
            ->where('tenant_id', $tenantId)
            ->latest('id')
            ->first();

        $invoiceNumber = 'INV-SUB-' . str_pad((string) $payment->id, 6, '0', STR_PAD_LEFT);
        $pdf = Pdf::loadView('saas.billing_invoice_pdf', [
            'invoiceNumber' => $invoiceNumber,
            'payment' => $payment,
            'subscription' => $subscription,
            'tenantName' => $request->user()->name,
        ]);

        return $pdf->download($invoiceNumber . '.pdf');
    }
}
