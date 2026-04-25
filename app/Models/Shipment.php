<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Shipment extends Model
{
    public const TRACKING_STAGES = [
        'ready_for_pickup',
        'picked_up',
        'in_transit',
        'arrived_at_destination',
        'delivered',
    ];

    protected $fillable = [
        'shipment_id',
        'origin',
        'origin_name',
        'origin_lat',
        'origin_lng',
        'destination',
        'destination_name',
        'dest_lat',
        'dest_lng',
        'status',
        'estimated_arrival',
        'load_type',
        'purchase_order_id',
        'goods_receipt_id',
        'driver_id',
        'tracking_stage',
        'last_tracking_note',
        'claimed_at',
        'picked_up_at',
        'in_transit_at',
        'arrived_at_destination_at',
        'delivered_at',
        'delivery_recipient_name',
        'delivery_note',
        'delivery_photo_path',
        'pod_verification_status',
        'pod_verified_at',
        'pod_verified_by',
        'pod_verification_note',
    ];

    public function getRouteKeyName()
    {
        return 'shipment_id';
    }

    protected $casts = [
        'estimated_arrival' => 'datetime',
        'claimed_at' => 'datetime',
        'picked_up_at' => 'datetime',
        'in_transit_at' => 'datetime',
        'arrived_at_destination_at' => 'datetime',
        'delivered_at' => 'datetime',
        'pod_verified_at' => 'datetime',
    ];

    // Relationships
    public function driver()
    {
        return $this->belongsTo(Driver::class);
    }

    public function purchaseOrder()
    {
        return $this->belongsTo(PurchaseOrder::class);
    }

    public function goodsReceipt()
    {
        return $this->belongsTo(GoodsReceipt::class);
    }

    public static function trackingStageLabels(): array
    {
        return [
            'ready_for_pickup' => 'Siap Diambil',
            'picked_up' => 'Sudah Diambil',
            'in_transit' => 'Dalam Perjalanan',
            'arrived_at_destination' => 'Sampai Gudang Tujuan',
            'delivered' => 'Terkirim',
        ];
    }

    public function syncTrackingTimestamps(string $trackingStage): void
    {
        $now = now();

        if (!$this->claimed_at) {
            $this->claimed_at = $now;
        }

        if (in_array($trackingStage, ['picked_up', 'in_transit', 'arrived_at_destination', 'delivered'], true) && !$this->picked_up_at) {
            $this->picked_up_at = $now;
        }

        if (in_array($trackingStage, ['in_transit', 'arrived_at_destination', 'delivered'], true) && !$this->in_transit_at) {
            $this->in_transit_at = $now;
        }

        if (in_array($trackingStage, ['arrived_at_destination', 'delivered'], true) && !$this->arrived_at_destination_at) {
            $this->arrived_at_destination_at = $now;
        }

        if ($trackingStage === 'delivered' && !$this->delivered_at) {
            $this->delivered_at = $now;
        }
    }

    public function requirePendingProofVerification(): void
    {
        if ($this->pod_verification_status === 'approved') {
            return;
        }

        $this->pod_verification_status = 'pending';
        $this->pod_verified_at = null;
        $this->pod_verified_by = null;
    }
}
