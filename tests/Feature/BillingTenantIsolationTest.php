<?php

namespace Tests\Feature;

use App\Models\Plan;
use App\Models\Module;
use App\Models\Role;
use App\Models\SubscriptionPayment;
use App\Models\Tenant;
use App\Models\TenantModule;
use App\Models\TenantSubscription;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class BillingTenantIsolationTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_cannot_download_billing_invoice_from_other_tenant(): void
    {
        $managerRole = Role::query()->firstOrCreate(
            ['name' => 'Manager'],
            ['description' => 'Akses penuh operasional gudang']
        );

        $plan = Plan::query()->create([
            'code' => 'pro',
            'name' => 'Pro',
            'monthly_price' => 799000,
            'yearly_price' => 7990000,
            'is_public' => true,
        ]);

        $tenantA = Tenant::query()->create([
            'code' => 'TEN-A',
            'name' => 'Tenant A',
            'slug' => 'tenant-a',
            'status' => 'active',
            'timezone' => 'Asia/Makassar',
            'locale' => 'id',
        ]);

        $tenantB = Tenant::query()->create([
            'code' => 'TEN-B',
            'name' => 'Tenant B',
            'slug' => 'tenant-b',
            'status' => 'active',
            'timezone' => 'Asia/Makassar',
            'locale' => 'id',
        ]);

        $userB = User::factory()->create([
            'role_id' => $managerRole->id,
            'tenant_id' => $tenantB->id,
            'email_verified_at' => now(),
        ]);

        $subA = TenantSubscription::query()->create([
            'tenant_id' => $tenantA->id,
            'plan_id' => $plan->id,
            'status' => 'active',
            'starts_at' => now(),
            'ends_at' => now()->addMonth(),
        ]);

        $paymentA = SubscriptionPayment::query()->create([
            'tenant_subscription_id' => $subA->id,
            'tenant_id' => $tenantA->id,
            'provider' => 'midtrans',
            'provider_order_id' => 'SUB-ORDER-A-001',
            'amount' => 799000,
            'currency' => 'IDR',
            'status' => 'paid',
            'raw_payload' => [],
        ]);

        $this->actingAs($userB)
            ->get(route('settings.billing.invoice', $paymentA))
            ->assertForbidden();
    }

    public function test_webhook_does_not_update_subscription_when_tenant_mismatch(): void
    {
        Mail::fake();
        config()->set('services.midtrans.server_key', 'test-server-key');

        $planPro = Plan::query()->create([
            'code' => 'pro',
            'name' => 'Pro',
            'monthly_price' => 799000,
            'yearly_price' => 7990000,
            'is_public' => true,
        ]);

        $planEnterprise = Plan::query()->create([
            'code' => 'enterprise',
            'name' => 'Enterprise',
            'monthly_price' => 2499000,
            'yearly_price' => 24990000,
            'is_public' => true,
        ]);

        $tenantA = Tenant::query()->create([
            'code' => 'TEN-WA',
            'name' => 'Tenant Webhook A',
            'slug' => 'tenant-webhook-a',
            'status' => 'active',
            'timezone' => 'Asia/Makassar',
            'locale' => 'id',
        ]);

        $tenantB = Tenant::query()->create([
            'code' => 'TEN-WB',
            'name' => 'Tenant Webhook B',
            'slug' => 'tenant-webhook-b',
            'status' => 'active',
            'timezone' => 'Asia/Makassar',
            'locale' => 'id',
        ]);

        $subA = TenantSubscription::query()->create([
            'tenant_id' => $tenantA->id,
            'plan_id' => $planPro->id,
            'status' => 'trialing',
            'starts_at' => now(),
            'trial_ends_at' => now()->addDays(3),
        ]);

        $subB = TenantSubscription::query()->create([
            'tenant_id' => $tenantB->id,
            'plan_id' => $planPro->id,
            'status' => 'trialing',
            'starts_at' => now(),
            'trial_ends_at' => now()->addDays(3),
        ]);

        $orderId = 'SUB-WEBHOOK-TEST-001';
        SubscriptionPayment::query()->create([
            'tenant_subscription_id' => $subB->id, // sengaja mismatch dengan tenant_id payment
            'tenant_id' => $tenantA->id,
            'provider' => 'midtrans',
            'provider_order_id' => $orderId,
            'amount' => 2499000,
            'currency' => 'IDR',
            'status' => 'pending',
            'raw_payload' => [
                'selected_plan_code' => $planEnterprise->code,
                'purchase_action' => 'upgrade',
            ],
        ]);

        $statusCode = '200';
        $grossAmount = '2499000';
        $signature = hash('sha512', $orderId . $statusCode . $grossAmount . 'test-server-key');

        $this->postJson(route('webhooks.midtrans'), [
            'order_id' => $orderId,
            'status_code' => $statusCode,
            'gross_amount' => $grossAmount,
            'signature_key' => $signature,
            'transaction_status' => 'settlement',
            'fraud_status' => 'accept',
            'transaction_id' => 'TX-TEST-001',
        ])->assertOk();

        $subA->refresh();
        $subB->refresh();

        $this->assertSame('trialing', $subA->status);
        $this->assertSame($planPro->id, $subA->plan_id);
        $this->assertSame('trialing', $subB->status);
        $this->assertSame($planPro->id, $subB->plan_id);
    }

    public function test_paid_webhook_syncs_tenant_modules_based_on_new_plan(): void
    {
        Mail::fake();
        config()->set('services.midtrans.server_key', 'test-server-key');

        $planTrial = Plan::query()->create([
            'code' => 'trial_3d',
            'name' => 'Trial',
            'monthly_price' => 0,
            'yearly_price' => 0,
            'is_public' => true,
        ]);

        $planPro = Plan::query()->create([
            'code' => 'pro',
            'name' => 'Pro',
            'monthly_price' => 799000,
            'yearly_price' => 7990000,
            'is_public' => true,
        ]);

        $coreInventory = Module::query()->create([
            'code' => 'core_inventory',
            'name' => 'Core Inventory',
            'is_core' => true,
        ]);
        $shipment = Module::query()->create([
            'code' => 'shipment',
            'name' => 'Shipment',
            'is_core' => false,
        ]);

        $tenant = Tenant::query()->create([
            'code' => 'TEN-SYNC',
            'name' => 'Tenant Sync',
            'slug' => 'tenant-sync',
            'status' => 'active',
            'timezone' => 'Asia/Makassar',
            'locale' => 'id',
        ]);

        $subscription = TenantSubscription::query()->create([
            'tenant_id' => $tenant->id,
            'plan_id' => $planTrial->id,
            'status' => 'trialing',
            'starts_at' => now(),
            'trial_ends_at' => now()->addDays(3),
        ]);

        TenantModule::query()->create([
            'tenant_id' => $tenant->id,
            'module_id' => $coreInventory->id,
            'is_enabled' => true,
            'source' => 'onboarding',
            'starts_at' => now(),
        ]);
        TenantModule::query()->create([
            'tenant_id' => $tenant->id,
            'module_id' => $shipment->id,
            'is_enabled' => false,
            'source' => 'onboarding',
            'starts_at' => now(),
        ]);

        $orderId = 'SUB-SYNC-MODULE-001';
        SubscriptionPayment::query()->create([
            'tenant_subscription_id' => $subscription->id,
            'tenant_id' => $tenant->id,
            'provider' => 'midtrans',
            'provider_order_id' => $orderId,
            'amount' => 799000,
            'currency' => 'IDR',
            'status' => 'pending',
            'raw_payload' => [
                'selected_plan_code' => 'pro',
                'purchase_action' => 'upgrade',
            ],
        ]);

        $statusCode = '200';
        $grossAmount = '799000';
        $signature = hash('sha512', $orderId . $statusCode . $grossAmount . 'test-server-key');

        $this->postJson(route('webhooks.midtrans'), [
            'order_id' => $orderId,
            'status_code' => $statusCode,
            'gross_amount' => $grossAmount,
            'signature_key' => $signature,
            'transaction_status' => 'settlement',
            'fraud_status' => 'accept',
            'transaction_id' => 'TX-SYNC-001',
        ])->assertOk();

        $subscription->refresh();

        $this->assertSame('active', $subscription->status);
        $this->assertSame($planPro->id, $subscription->plan_id);
        $this->assertDatabaseHas('tenant_modules', [
            'tenant_id' => $tenant->id,
            'module_id' => $shipment->id,
            'is_enabled' => 1,
        ]);
    }
}
