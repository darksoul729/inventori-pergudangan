<?php

namespace App\Http\Controllers;

use App\Mail\PetayuSystemMail;
use Barryvdh\DomPDF\Facade\Pdf;
use App\Models\Plan;
use App\Models\Module;
use App\Models\SaasAuditLog;
use App\Models\SubscriptionPayment;
use App\Models\Tenant;
use App\Models\TenantModule;
use App\Models\TenantSubscription;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;
use Inertia\Response;

class BillingController extends Controller
{
    private const PAYMENT_TIMEOUT_HOURS = 24;

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
            ->map(function (SubscriptionPayment $payment) {
                $isExpired = $this->isPendingPaymentExpired($payment);
                return [
                    'id' => $payment->id,
                    'order_id' => $payment->provider_order_id,
                    'amount' => $payment->amount,
                    'status' => $payment->status,
                    'payment_url' => $payment->payment_url,
                    'is_expired' => $isExpired,
                    'expires_at' => $this->resolvePendingExpiresAt($payment)?->format('d M Y H:i'),
                    'expires_at_iso' => $this->resolvePendingExpiresAt($payment)?->toIso8601String(),
                    'can_retry' => $payment->status === 'pending' && !$isExpired && !empty($payment->payment_url),
                    'invoice_url' => $payment->status === 'paid' ? route('settings.billing.invoice', $payment->id) : null,
                    'created_at' => $payment->created_at?->format('d M Y H:i'),
                ];
            });

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

        $activePending = $payments->first(fn (array $p) => $p['status'] === 'pending' && !$p['is_expired']);
        $latestPayment = $payments->first();

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
            'subscription_center' => [
                'status_label' => $subscription ? $this->statusLabel($subscription->status) : 'Belum Aktif',
                'active_plan' => $subscription?->plan?->name ?? '-',
                'next_due_date' => optional($subscription?->ends_at)->format('d M Y') ?? '-',
                'pending_order_id' => $activePending['order_id'] ?? null,
                'pending_expires_at' => $activePending['expires_at'] ?? null,
                'pending_expires_at_iso' => $activePending['expires_at_iso'] ?? null,
                'last_payment_status' => $latestPayment ? $this->statusLabel((string) $latestPayment['status']) : '-',
            ],
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

        $idempotencyKey = $this->buildIdempotencyKey(
            tenantId: $tenantId,
            planCode: (string) ($targetPlan?->code ?? 'plan'),
            amount: $amount,
            purchaseAction: $purchaseAction
        );

        $existingPending = SubscriptionPayment::query()
            ->where('tenant_id', $tenantId)
            ->where('status', 'pending')
            ->where('raw_payload->idempotency_key', $idempotencyKey)
            ->latest('id')
            ->first();

        if ($existingPending) {
            if ($this->isPendingPaymentExpired($existingPending)) {
                $existingPending->update([
                    'status' => 'expired',
                    'raw_payload' => array_merge(
                        is_array($existingPending->raw_payload) ? $existingPending->raw_payload : [],
                        [
                            'timeout_expired_at' => now()->toIso8601String(),
                            'timeout_hours' => self::PAYMENT_TIMEOUT_HOURS,
                        ]
                    ),
                ]);
            } elseif (!empty($existingPending->payment_url)) {
                return response()->json([
                    'ok' => true,
                    'snap_token' => data_get($existingPending->raw_payload, 'token'),
                    'redirect_url' => $existingPending->payment_url,
                    'order_id' => $existingPending->provider_order_id,
                ]);
            }
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
                'plan_snapshot' => [
                    'code' => $targetPlan?->code,
                    'name' => $targetPlan?->name,
                    'price_monthly' => $amount,
                ],
                'idempotency_key' => $idempotencyKey,
                'expires_at' => now()->addHours(self::PAYMENT_TIMEOUT_HOURS)->toIso8601String(),
                'timeout_hours' => self::PAYMENT_TIMEOUT_HOURS,
            ]),
        ]);

        $this->audit($tenantId, (int) ($user?->id ?? 0), 'billing.checkout_created', 'tenant_subscriptions', (int) $subscription->id, [
            'order_id' => $orderId,
            'plan_code' => $targetPlan?->code,
            'amount' => $amount,
            'idempotency_key' => $idempotencyKey,
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
            in_array($transactionStatus, ['expire'], true) => 'expired',
            in_array($transactionStatus, ['deny', 'cancel'], true) => 'failed',
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
                    if ((int) $subscription->tenant_id !== (int) $payment->tenant_id) {
                        Log::warning('Skipped subscription update due to tenant mismatch on webhook', [
                            'payment_id' => $payment->id,
                            'payment_tenant_id' => $payment->tenant_id,
                            'subscription_id' => $subscription->id,
                            'subscription_tenant_id' => $subscription->tenant_id,
                        ]);
                        return response()->json(['ok' => true]);
                    }

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
                            : (in_array($status, ['failed', 'expired'], true) && $subscription->status !== 'active' ? 'past_due' : $subscription->status),
                        'trial_ends_at' => $status === 'paid' ? now() : $subscription->trial_ends_at,
                        'starts_at' => $status === 'paid' ? ($subscription->starts_at ?? now()) : $subscription->starts_at,
                        'ends_at' => $status === 'paid'
                            ? (($subscription->ends_at && $subscription->ends_at->isFuture()
                                ? $subscription->ends_at
                                : now())->copy()->addMonth())
                            : $subscription->ends_at,
                    ]);

                    if ($status === 'paid') {
                        $effectivePlan = $selectedPlan ?: $subscription->plan;
                        if ($effectivePlan) {
                            $this->syncTenantModulesForPlan((int) $subscription->tenant_id, (string) $effectivePlan->code);
                        }
                    }
                }
            }

            $this->notifyBillingStatus($payment, $status);
            $this->audit((int) $payment->tenant_id, 0, 'billing.webhook_status_updated', 'subscription_payments', (int) $payment->id, [
                'status' => $status,
                'order_id' => $orderId,
            ]);
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
            in_array($transactionStatus, ['expire'], true) => 'expired',
            in_array($transactionStatus, ['deny', 'cancel'], true) => 'failed',
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
                if ((int) $subscription->tenant_id !== (int) $payment->tenant_id) {
                    Log::warning('Skipped subscription update due to tenant mismatch on status sync', [
                        'payment_id' => $payment->id,
                        'payment_tenant_id' => $payment->tenant_id,
                        'subscription_id' => $subscription->id,
                        'subscription_tenant_id' => $subscription->tenant_id,
                    ]);
                    return;
                }

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
                        : (in_array($mappedStatus, ['failed', 'expired'], true) && $subscription->status !== 'active' ? 'past_due' : $subscription->status),
                    'trial_ends_at' => $mappedStatus === 'paid' ? now() : $subscription->trial_ends_at,
                    'starts_at' => $mappedStatus === 'paid' ? ($subscription->starts_at ?? now()) : $subscription->starts_at,
                    'ends_at' => $mappedStatus === 'paid'
                        ? (($subscription->ends_at && $subscription->ends_at->isFuture()
                            ? $subscription->ends_at
                            : now())->copy()->addMonth())
                        : $subscription->ends_at,
                ]);

                if ($mappedStatus === 'paid') {
                    $effectivePlan = $selectedPlan ?: $subscription->plan;
                    if ($effectivePlan) {
                        $this->syncTenantModulesForPlan((int) $subscription->tenant_id, (string) $effectivePlan->code);
                    }
                }
            }
        }

        $this->notifyBillingStatus($payment, $mappedStatus);
    }

    private function notifyBillingStatus(SubscriptionPayment $payment, string $status): void
    {
        if (!in_array($status, ['paid', 'pending', 'failed', 'expired'], true)) {
            return;
        }

        $raw = is_array($payment->raw_payload) ? $payment->raw_payload : [];
        $sentStatuses = collect($raw['emailed_statuses'] ?? [])->filter()->values()->all();
        if (in_array($status, $sentStatuses, true)) {
            return;
        }

        $tenant = Tenant::query()->find($payment->tenant_id);
        if (!$tenant) {
            return;
        }

        $emails = $tenant->users()
            ->whereNotNull('email')
            ->pluck('email')
            ->unique()
            ->values()
            ->all();

        if (empty($emails)) {
            return;
        }

        $statusLabel = match ($status) {
            'paid' => 'Terbayar',
            'pending' => 'Menunggu Pembayaran',
            'failed' => 'Gagal',
            'expired' => 'Kedaluwarsa',
            default => strtoupper($status),
        };

        $subject = match ($status) {
            'paid' => 'Pembayaran berhasil - Petayu WMS',
            'pending' => 'Tagihan menunggu pembayaran - Petayu WMS',
            'failed' => 'Pembayaran gagal - Petayu WMS',
            'expired' => 'Link pembayaran kedaluwarsa - Petayu WMS',
            default => 'Update billing - Petayu WMS',
        };

        $lines = match ($status) {
            'paid' => [
                'Pembayaran paket SaaS Anda berhasil dikonfirmasi.',
                'Masa aktif langganan sudah diperbarui otomatis.',
            ],
            'failed' => [
                'Pembayaran paket SaaS belum berhasil diproses.',
                'Silakan ulangi pembayaran dari halaman Billing untuk menghindari gangguan akses fitur.',
            ],
            'expired' => [
                'Link pembayaran sebelumnya sudah kedaluwarsa.',
                'Silakan buat ulang link pembayaran dari halaman Billing.',
            ],
            default => [
                'Tagihan paket SaaS sudah dibuat dan menunggu pembayaran.',
                'Silakan lanjutkan pembayaran dari halaman Billing.',
            ],
        };

        try {
            $attachments = [];
            if ($status === 'paid') {
                $subscription = $payment->subscription()->with('plan')->first();
                $invoiceNumber = $this->generateBillingInvoiceNumber($tenant, $payment);
                $tenantName = $tenant->users()->orderBy('id')->value('name') ?: $tenant->name;
                $pdf = Pdf::loadView('saas.billing_invoice_pdf', [
                    'invoiceNumber' => $invoiceNumber,
                    'payment' => $payment,
                    'subscription' => $subscription,
                    'tenantName' => $tenantName,
                ]);
                $attachments[] = [
                    'name' => $invoiceNumber . '.pdf',
                    'mime' => 'application/pdf',
                    'data' => base64_encode($pdf->output()),
                    'is_base64' => true,
                ];
            }

            $this->sendMailWithRetry($emails, new PetayuSystemMail(
                subjectLine: $subject,
                heading: 'Status Billing: ' . $statusLabel,
                lines: $lines,
                ctaLabel: 'Buka Billing',
                ctaUrl: route('settings.billing'),
                meta: [
                    'Order ID' => $payment->provider_order_id,
                    'Jumlah' => 'Rp ' . number_format((int) $payment->amount, 0, ',', '.'),
                    'Status' => $statusLabel,
                    'Tenant' => $tenant->name,
                ],
                attachmentsData: $attachments,
            ));

            $sentStatuses[] = $status;
            $payment->update([
                'raw_payload' => array_merge($raw, [
                    'emailed_statuses' => array_values(array_unique($sentStatuses)),
                ]),
            ]);
        } catch (\Throwable $e) {
            Log::warning('Failed to send billing status email', [
                'payment_id' => $payment->id,
                'status' => $status,
                'message' => $e->getMessage(),
            ]);
        }
    }

    private function resolveTenantId($user): int
    {
        if ($user && $user->tenant_id) {
            return (int) $user->tenant_id;
        }

        abort(403, 'Akun belum terhubung ke tenant. Hubungi admin untuk aktivasi billing.');
    }

    private function resolvePendingExpiresAt(SubscriptionPayment $payment): ?Carbon
    {
        $raw = is_array($payment->raw_payload) ? $payment->raw_payload : [];
        $expires = data_get($raw, 'expires_at');
        if (is_string($expires) && trim($expires) !== '') {
            try {
                return Carbon::parse($expires);
            } catch (\Throwable) {
                // fallback below
            }
        }

        return $payment->created_at?->copy()->addHours(self::PAYMENT_TIMEOUT_HOURS);
    }

    private function isPendingPaymentExpired(SubscriptionPayment $payment): bool
    {
        if ($payment->status !== 'pending') {
            return false;
        }
        $expiresAt = $this->resolvePendingExpiresAt($payment);
        return $expiresAt ? $expiresAt->isPast() : false;
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

        $invoiceNumber = $this->generateBillingInvoiceNumber(Tenant::query()->find($tenantId), $payment);
        $pdf = Pdf::loadView('saas.billing_invoice_pdf', [
            'invoiceNumber' => $invoiceNumber,
            'payment' => $payment,
            'subscription' => $subscription,
            'tenantName' => $request->user()->name,
        ]);

        return $pdf->download($invoiceNumber . '.pdf');
    }

    public function cancelPayment(Request $request, SubscriptionPayment $payment)
    {
        $tenantId = $this->resolveTenantId($request->user());
        if ((int) $payment->tenant_id !== (int) $tenantId) {
            abort(403, 'Anda tidak memiliki akses ke pembayaran ini.');
        }

        if ($payment->status !== 'pending') {
            return back()->with('error', 'Hanya pembayaran dengan status pending yang dapat dibatalkan.');
        }

        $payment->update([
            'status' => 'canceled',
            'raw_payload' => array_merge(
                is_array($payment->raw_payload) ? $payment->raw_payload : [],
                ['canceled_at' => now()->toDateTimeString(), 'canceled_by' => $request->user()->id]
            ),
        ]);

        $this->audit((int) $tenantId, (int) ($request->user()?->id ?? 0), 'billing.payment_canceled', 'subscription_payments', (int) $payment->id, [
            'order_id' => $payment->provider_order_id,
        ]);

        return back()->with('success', 'Pembayaran paket berhasil dibatalkan.');
    }

    private function sendMailWithRetry(string|array $recipient, PetayuSystemMail $mail): void
    {
        $attempts = 0;
        $maxAttempts = 3;
        $lastException = null;

        while ($attempts < $maxAttempts) {
            $attempts++;
            try {
                Mail::to($recipient)->send($mail);
                return;
            } catch (\Throwable $e) {
                $lastException = $e;
                usleep($attempts * 200000);
            }
        }

        Log::warning('Billing email failed after retries', [
            'recipient' => $recipient,
            'attempts' => $attempts,
            'message' => $lastException?->getMessage(),
        ]);
    }

    private function statusLabel(?string $status): string
    {
        return match (strtolower((string) $status)) {
            'active' => 'Aktif',
            'trialing' => 'Masa Coba',
            'past_due' => 'Perlu Pembayaran',
            'canceled' => 'Nonaktif',
            'paid' => 'Terbayar',
            'pending' => 'Menunggu Bayar',
            'failed' => 'Gagal',
            'expired' => 'Kedaluwarsa',
            default => trim((string) $status) !== '' ? ucfirst((string) $status) : '-',
        };
    }

    private function buildIdempotencyKey(int $tenantId, string $planCode, int $amount, string $purchaseAction): string
    {
        $bucket = now()->format('YmdH');
        return hash('sha256', implode('|', [$tenantId, $planCode, $amount, $purchaseAction, $bucket]));
    }

    private function generateBillingInvoiceNumber(?Tenant $tenant, SubscriptionPayment $payment): string
    {
        $tenantCode = strtoupper(trim((string) ($tenant?->code ?? 'TEN')));
        $tenantCode = preg_replace('/[^A-Z0-9]/', '', $tenantCode) ?: 'TEN';
        return 'INV-' . $tenantCode . '-' . $payment->created_at?->format('Ym') . '-' . str_pad((string) $payment->id, 6, '0', STR_PAD_LEFT);
    }

    private function syncTenantModulesForPlan(int $tenantId, string $planCode): void
    {
        $allModuleCodes = collect(array_keys(config('saas.modules', [])));
        if ($allModuleCodes->isEmpty()) {
            return;
        }

        $requiredCodes = collect(config('saas.modules', []))
            ->filter(fn (array $module) => (bool) ($module['required'] ?? false))
            ->keys();

        $planCodes = collect(config("saas.plans.{$planCode}.modules", []))
            ->filter(fn ($code) => is_string($code) && $allModuleCodes->contains($code));

        $enabledCodes = $requiredCodes
            ->merge($planCodes)
            ->unique()
            ->values();

        $modules = Module::query()
            ->whereIn('code', $allModuleCodes->all())
            ->get(['id', 'code']);

        foreach ($modules as $module) {
            $shouldEnable = $enabledCodes->contains($module->code);
            TenantModule::query()->updateOrCreate(
                [
                    'tenant_id' => $tenantId,
                    'module_id' => $module->id,
                ],
                [
                    'is_enabled' => $shouldEnable,
                    'source' => 'plan',
                    'starts_at' => now(),
                    'ends_at' => null,
                ]
            );
        }
    }

    private function audit(int $tenantId, int $actorUserId, string $eventType, string $targetType, int $targetId, array $payload = []): void
    {
        SaasAuditLog::query()->create([
            'tenant_id' => $tenantId,
            'actor_user_id' => $actorUserId > 0 ? $actorUserId : null,
            'event_type' => $eventType,
            'target_type' => $targetType,
            'target_id' => $targetId,
            'payload' => $payload,
        ]);
    }
}
