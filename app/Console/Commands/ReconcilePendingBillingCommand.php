<?php

namespace App\Console\Commands;

use App\Models\SubscriptionPayment;
use Illuminate\Console\Command;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ReconcilePendingBillingCommand extends Command
{
    protected $signature = 'billing:reconcile-pending {--limit=100}';
    protected $description = 'Sinkron status pembayaran pending ke Midtrans';

    public function handle(): int
    {
        $serverKey = (string) config('services.midtrans.server_key');
        if ($serverKey === '') {
            $this->warn('MIDTRANS_SERVER_KEY belum diatur, skip reconcile.');
            return self::SUCCESS;
        }

        $limit = max(1, (int) $this->option('limit'));
        $payments = SubscriptionPayment::query()
            ->where('provider', 'midtrans')
            ->where('status', 'pending')
            ->latest('id')
            ->limit($limit)
            ->get();

        $baseUrl = rtrim((string) config('services.midtrans.base_url'), '/');
        $updated = 0;
        foreach ($payments as $payment) {
            try {
                $response = Http::withBasicAuth($serverKey, '')
                    ->acceptJson()
                    ->timeout(12)
                    ->retry(2, 300)
                    ->get($baseUrl . '/v2/' . rawurlencode((string) $payment->provider_order_id) . '/status');
            } catch (ConnectionException $e) {
                Log::warning('Billing reconcile connection failed', ['order_id' => $payment->provider_order_id, 'message' => $e->getMessage()]);
                continue;
            } catch (\Throwable $e) {
                Log::warning('Billing reconcile failed', ['order_id' => $payment->provider_order_id, 'message' => $e->getMessage()]);
                continue;
            }

            if (! $response->successful()) {
                continue;
            }

            $transactionStatus = (string) $response->json('transaction_status');
            $fraudStatus = (string) $response->json('fraud_status');
            $mappedStatus = match (true) {
                in_array($transactionStatus, ['capture', 'settlement'], true) && ($fraudStatus === '' || $fraudStatus === 'accept') => 'paid',
                in_array($transactionStatus, ['expire'], true) => 'expired',
                in_array($transactionStatus, ['deny', 'cancel'], true) => 'failed',
                default => 'pending',
            };

            if ($mappedStatus === 'pending' || $mappedStatus === $payment->status) {
                continue;
            }

            $payment->update([
                'provider_transaction_id' => $response->json('transaction_id') ?: $payment->provider_transaction_id,
                'status' => $mappedStatus,
                'raw_payload' => array_merge(
                    is_array($payment->raw_payload) ? $payment->raw_payload : [],
                    ['reconcile' => $response->json(), 'reconciled_at' => now()->toIso8601String()]
                ),
            ]);
            $updated++;
        }

        $this->info("Reconcile selesai. Pending dicek: {$payments->count()}, status diperbarui: {$updated}.");
        return self::SUCCESS;
    }
}

