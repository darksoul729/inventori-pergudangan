<?php

namespace App\Http\Middleware;

use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $notifications = [];
        $pendingOpnameCount = 0;
        $pendingTransferCount = 0;
        $pendingAdjustmentCount = 0;
        $user = $request->user()?->loadMissing('role');
        
        if ($user) {
            // Low Stock alerts
            $lowStockCount = \App\Models\Product::whereHas('productStocks', function($query) {
                $query->whereColumn('current_stock', '<=', 'products.minimum_stock');
            })->count();
            
            if ($lowStockCount > 0) {
            $notifications[] = [
                'id' => 'low-stock',
                    'type' => 'warning',
                'title' => 'Stok Menipis',
                'message' => "Ada {$lowStockCount} produk di bawah batas minimum.",
                'link' => '/inventory',
            ];
            }

            // Pending Purchase Orders
            $pendingPOCount = \App\Models\PurchaseOrder::where('status', 'pending')->count();
            if ($pendingPOCount > 0) {
                $notifications[] = [
                    'id' => 'pending-po',
                    'type' => 'info',
                    'title' => 'PO Menunggu',
                    'message' => "Ada {$pendingPOCount} pesanan menunggu persetujuan.",
                    'link' => '/purchase-orders',
                ];
            }

            // Pending Stock Opnames
            $pendingOpnameCount = \App\Models\StockOpname::where('status', 'pending')->count();
            if ($pendingOpnameCount > 0) {
                $notifications[] = [
                    'id' => 'pending-opname',
                    'type' => 'info',
                    'title' => 'Opname Menunggu',
                    'message' => "Ada {$pendingOpnameCount} stock opname menunggu persetujuan.",
                    'link' => '/stock-opname',
                ];
            }

            // Pending Stock Transfers
            $pendingTransferCount = \App\Models\StockTransfer::where('status', 'pending')->count();
            if ($pendingTransferCount > 0) {
                $notifications[] = [
                    'id' => 'pending-transfer',
                    'type' => 'info',
                    'title' => 'Transfer Menunggu',
                    'message' => "Ada {$pendingTransferCount} transfer rack menunggu persetujuan.",
                    'link' => '/rack-allocation',
                ];
            }

            // Pending Manual Stock Adjustments
            $pendingAdjustmentCount = \App\Models\StockAdjustment::where('status', 'pending')
                ->where('reason', 'manual_rack_stock')
                ->count();
            if ($pendingAdjustmentCount > 0) {
                $notifications[] = [
                    'id' => 'pending-adjustment',
                    'type' => 'info',
                    'title' => 'Adjustment Menunggu',
                    'message' => "Ada {$pendingAdjustmentCount} koreksi stok manual menunggu persetujuan.",
                    'link' => '/wms-documents',
                ];
            }

            // Delayed Shipments
            $delayedShipmentCount = \App\Models\Shipment::where('status', 'delayed')
                ->orWhere(function ($query) {
                    $query->where('status', '!=', 'delivered')
                        ->where('estimated_arrival', '<', now());
                })
                ->count();
            if ($delayedShipmentCount > 0) {
                $notifications[] = [
                    'id' => 'delayed-shipment',
                    'type' => 'error',
                    'title' => 'Pengiriman Terlambat',
                    'message' => "Ada {$delayedShipmentCount} pengiriman yang melewati estimasi waktu.",
                    'link' => '/shipments',
                ];
            }

            $offRouteShipmentCount = \App\Models\Shipment::with('driver')
                ->whereNotNull('driver_id')
                ->whereNotNull('origin_lat')
                ->whereNotNull('origin_lng')
                ->whereNotNull('dest_lat')
                ->whereNotNull('dest_lng')
                ->get()
                ->filter(function ($shipment) {
                    if (!$shipment->driver?->latitude || !$shipment->driver?->longitude) {
                        return false;
                    }

                    $totalKm = $this->distanceKm(
                        (float) $shipment->origin_lat,
                        (float) $shipment->origin_lng,
                        (float) $shipment->dest_lat,
                        (float) $shipment->dest_lng
                    );

                    $thresholdKm = max(50, $totalKm * 0.12);
                    $deviationKm = $this->distancePointToSegmentKm(
                        (float) $shipment->driver->latitude,
                        (float) $shipment->driver->longitude,
                        (float) $shipment->origin_lat,
                        (float) $shipment->origin_lng,
                        (float) $shipment->dest_lat,
                        (float) $shipment->dest_lng
                    );

                    return $deviationKm > $thresholdKm;
                })
                ->count();

            if ($offRouteShipmentCount > 0) {
                $notifications[] = [
                    'id' => 'off-route-shipment',
                    'type' => 'warning',
                    'title' => 'Driver Keluar Jalur',
                    'message' => "Ada {$offRouteShipmentCount} pengiriman dengan deviasi rute yang perlu ditinjau.",
                    'link' => '/shipments',
                ];
            }

            // Expired / Expiring Stock Alerts
            $operationalWarehouse = \App\Models\Warehouse::orderBy('id')->first();
            if ($operationalWarehouse) {
                $today = now()->toDateString();
                $expiredCount = \App\Models\RackStock::whereHas('rack.zone', fn ($q) => $q->where('warehouse_id', $operationalWarehouse->id))
                    ->whereNotNull('expired_date')
                    ->where('expired_date', '<', $today)
                    ->count();
                $expiringCount = \App\Models\RackStock::whereHas('rack.zone', fn ($q) => $q->where('warehouse_id', $operationalWarehouse->id))
                    ->whereNotNull('expired_date')
                    ->where('expired_date', '>=', $today)
                    ->where('expired_date', '<=', now()->addDays(30)->toDateString())
                    ->count();

                if ($expiredCount > 0) {
                    $notifications[] = [
                        'id' => 'expired-stock',
                        'type' => 'error',
                        'title' => 'Stok Kadaluarsa',
                        'message' => "Ada {$expiredCount} produk sudah melewati tanggal kadaluarsa!",
                        'link' => '/inventory',
                    ];
                }
                if ($expiringCount > 0) {
                    $notifications[] = [
                        'id' => 'expiring-stock',
                        'type' => 'warning',
                        'title' => 'Stok Mendekati Kadaluarsa',
                        'message' => "Ada {$expiringCount} produk akan kadaluarsa dalam 30 hari.",
                        'link' => '/inventory',
                    ];
                }
            }

            // Warehouse Capacity State (Add a "Realtime" feel)
            $warehouses = \App\Models\Warehouse::all();
            foreach($warehouses as $w) {
                $totalStock = \App\Models\ProductStock::where('warehouse_id', $w->id)->sum('current_stock');
                $totalCapacity = \App\Models\Rack::whereHas('zone', fn ($q) => $q->where('warehouse_id', $w->id))
                    ->sum('capacity');
                $capacityPercent = $totalCapacity > 0
                    ? min(100, round(($totalStock / $totalCapacity) * 100))
                    : 0;
                
                if ($capacityPercent > 85) {
                    $notifications[] = [
                        'id' => "capacity-{$w->id}",
                        'type' => 'warning',
                        'title' => 'Kapasitas Kritis',
                        'message' => "Gudang {$w->name} sudah terisi {$capacityPercent}%. Segera lakukan alokasi rak.",
                        'link' => '/warehouse',
                    ];
                }
            }

            // System State "Realtime" Mock
            $notifications[] = [
                'id' => 'system-check',
                'type' => 'success',
                'title' => 'Sistem Sehat',
                'message' => 'Seluruh sinkronisasi barcode dan data transaksi berjalan normal.',
                'link' => '/dashboard',
            ];

            // Personal approval outcomes for creator (important for supervisor/staff follow-up)
            $recentWindow = now()->subDays(3);
            $creatorId = (int) $user->id;

            $recentOpnameResults = \App\Models\StockOpname::query()
                ->where('created_by', $creatorId)
                ->whereIn('status', ['completed', 'rejected'])
                ->where('updated_at', '>=', $recentWindow)
                ->latest('updated_at')
                ->limit(5)
                ->get();
            foreach ($recentOpnameResults as $opname) {
                $isApproved = $opname->status === 'completed';
                $statusLabel = $isApproved ? 'sudah disetujui' : 'ditolak';
                $updatedTs = $opname->updated_at?->timestamp ?? time();
                $notifications[] = [
                    'id' => "opname-result-{$opname->id}-{$updatedTs}",
                    'type' => $isApproved ? 'success' : 'warning',
                    'title' => $isApproved ? 'Opname Disetujui' : 'Opname Ditolak',
                    'message' => "Dokumen {$opname->opname_number} {$statusLabel} dan perlu ditindaklanjuti.",
                    'link' => "/stock-opname/{$opname->id}",
                ];
            }

            $recentTransferResults = \App\Models\StockTransfer::query()
                ->where('created_by', $creatorId)
                ->whereIn('status', ['completed', 'rejected'])
                ->where('updated_at', '>=', $recentWindow)
                ->latest('updated_at')
                ->limit(5)
                ->get();
            foreach ($recentTransferResults as $transfer) {
                $isApproved = $transfer->status === 'completed';
                $statusLabel = $isApproved ? 'sudah disetujui' : 'ditolak';
                $updatedTs = $transfer->updated_at?->timestamp ?? time();
                $notifications[] = [
                    'id' => "transfer-result-{$transfer->id}-{$updatedTs}",
                    'type' => $isApproved ? 'success' : 'warning',
                    'title' => $isApproved ? 'Transfer Disetujui' : 'Transfer Ditolak',
                    'message' => "Dokumen {$transfer->transfer_number} {$statusLabel} untuk perpindahan stok.",
                    'link' => "/rack-allocation/transfers/{$transfer->id}",
                ];
            }

            $recentAdjustmentResults = \App\Models\StockAdjustment::query()
                ->where('created_by', $creatorId)
                ->where('reason', 'manual_rack_stock')
                ->whereIn('status', ['completed', 'rejected'])
                ->where('updated_at', '>=', $recentWindow)
                ->latest('updated_at')
                ->limit(5)
                ->get();
            foreach ($recentAdjustmentResults as $adjustment) {
                $isApproved = $adjustment->status === 'completed';
                $statusLabel = $isApproved ? 'sudah disetujui' : 'ditolak';
                $updatedTs = $adjustment->updated_at?->timestamp ?? time();
                $notifications[] = [
                    'id' => "adjustment-result-{$adjustment->id}-{$updatedTs}",
                    'type' => $isApproved ? 'success' : 'warning',
                    'title' => $isApproved ? 'Koreksi Stok Disetujui' : 'Koreksi Stok Ditolak',
                    'message' => "Dokumen {$adjustment->adjustment_number} {$statusLabel}.",
                    'link' => "/stock-adjustments/{$adjustment->id}",
                ];
            }
        }

        return [
            ...parent::share($request),
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
            ],
            'auth' => [
                'user' => $user ? [
                    'id' => $user->id,
                    'role_id' => $user->role_id,
                    'role' => $user->role?->name,
                    'role_name' => $user->role?->name,
                    'name' => $user->name,
                    'email' => $user->email,
                    'email_verified_at' => $user->email_verified_at,
                    'phone' => $user->phone,
                    'profile_photo_url' => $this->profilePhotoUrl($user),
                    'status' => $user->status,
                ] : null,
            ],
            'notifications' => $notifications,
            'pendingApprovals' => [
                'opnames' => $pendingOpnameCount,
                'transfers' => $pendingTransferCount,
                'adjustments' => $pendingAdjustmentCount,
            ],
        ];
    }

    private function profilePhotoUrl($user): ?string
    {
        $path = $this->normalizePublicStoragePath($user?->profile_photo_path);
        if (!$path) {
            return null;
        }

        if (Storage::disk('public')->exists($path)) {
            return route('profile.photo', ['v' => optional($user->updated_at)?->timestamp ?? time()]);
        }

        return null;
    }

    private function normalizePublicStoragePath(?string $path): ?string
    {
        if (!$path) {
            return null;
        }

        $normalized = trim($path);
        if ($normalized === '') {
            return null;
        }

        if (str_starts_with($normalized, 'http://') || str_starts_with($normalized, 'https://')) {
            $parsedPath = parse_url($normalized, PHP_URL_PATH);
            $normalized = is_string($parsedPath) ? $parsedPath : $normalized;
        }

        $normalized = ltrim($normalized, '/');
        if (str_starts_with($normalized, 'storage/')) {
            $normalized = substr($normalized, 8);
        }

        return trim($normalized) !== '' ? $normalized : null;
    }

    private function distanceKm(float $lat1, float $lng1, float $lat2, float $lng2): float
    {
        $earthRadius = 6371;
        $latDelta = deg2rad($lat2 - $lat1);
        $lngDelta = deg2rad($lng2 - $lng1);

        $a = sin($latDelta / 2) ** 2
            + cos(deg2rad($lat1)) * cos(deg2rad($lat2)) * sin($lngDelta / 2) ** 2;

        return 2 * $earthRadius * asin(min(1, sqrt($a)));
    }

    private function distancePointToSegmentKm(
        float $pointLat,
        float $pointLng,
        float $startLat,
        float $startLng,
        float $endLat,
        float $endLng
    ): float {
        $avgLatRad = deg2rad(($startLat + $endLat + $pointLat) / 3);
        $scaleX = 111.32 * cos($avgLatRad);
        $scaleY = 110.57;

        $px = $pointLng * $scaleX;
        $py = $pointLat * $scaleY;
        $ax = $startLng * $scaleX;
        $ay = $startLat * $scaleY;
        $bx = $endLng * $scaleX;
        $by = $endLat * $scaleY;

        $abx = $bx - $ax;
        $aby = $by - $ay;
        $abLengthSquared = ($abx ** 2) + ($aby ** 2);

        if ($abLengthSquared == 0.0) {
            return sqrt((($px - $ax) ** 2) + (($py - $ay) ** 2));
        }

        $t = (($px - $ax) * $abx + ($py - $ay) * $aby) / $abLengthSquared;
        $t = max(0, min(1, $t));

        $closestX = $ax + ($t * $abx);
        $closestY = $ay + ($t * $aby);

        return sqrt((($px - $closestX) ** 2) + (($py - $closestY) ** 2));
    }
}
