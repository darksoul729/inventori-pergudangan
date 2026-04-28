<?php

namespace App\Http\Controllers;

use App\Models\Shipment;
use App\Models\ShipmentItem;
use App\Models\Product;
use App\Models\RackStock;
use App\Traits\HandlesShipmentStock;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Str;
use Inertia\Inertia;

class ShipmentsController extends Controller
{
    use HandlesShipmentStock;
    public function index(Request $request)
    {
        Gate::authorize('viewAny', Shipment::class);

        $perPage = max(5, min($request->integer('per_page', 10), 50));
        $search = $request->input('search');

        $shipments = Shipment::with(['driver.user', 'items'])
            ->when($search, function ($query, $search) {
                return $query->where(function ($q) use ($search) {
                    $q->where('shipment_id', 'like', "%{$search}%")
                      ->orWhere('origin', 'like', "%{$search}%")
                      ->orWhere('origin_name', 'like', "%{$search}%")
                      ->orWhere('destination', 'like', "%{$search}%")
                      ->orWhere('destination_name', 'like', "%{$search}%")
                      ->orWhereHas('driver.user', function ($driverQuery) use ($search) {
                          $driverQuery->where('name', 'like', "%{$search}%");
                      });
                });
            })
            ->latest()
            ->paginate($perPage)
            ->withQueryString()
            ->through(function ($shipment) {
                $routeMetrics = $this->buildRouteMetrics($shipment);
                $alerts = $this->buildAlerts($shipment, $routeMetrics);

                return [
                    'id' => $shipment->shipment_id,
                    'database_id' => $shipment->id,
                    'origin' => $shipment->origin,
                    'origin_name' => $shipment->origin_name,
                    'origin_lat' => $this->nullableCoordinate($shipment->origin_lat),
                    'origin_lng' => $this->nullableCoordinate($shipment->origin_lng),
                    'destination' => $shipment->destination,
                    'destination_name' => $shipment->destination_name,
                    'dest_lat' => $this->nullableCoordinate($shipment->dest_lat),
                    'dest_lng' => $this->nullableCoordinate($shipment->dest_lng),
                    'status' => $shipment->status,
                    'tracking_stage' => $shipment->tracking_stage,
                    'tracking_stage_label' => Shipment::trackingStageLabels()[$shipment->tracking_stage] ?? $shipment->tracking_stage,
                    'last_tracking_note' => $shipment->last_tracking_note,
                    'estimated_arrival' => $shipment->estimated_arrival?->format('M d, H:i'),
                    'load_type' => $shipment->load_type,
                    'driver_name' => $shipment->driver?->user?->name ?? 'Belum ditugaskan',
                    'driver_id' => $shipment->driver_id,
                    'driver_lat' => $this->nullableCoordinate($shipment->driver?->latitude),
                    'driver_lng' => $this->nullableCoordinate($shipment->driver?->longitude),
                    'last_location_mock' => (bool) ($shipment->driver?->last_location_mock ?? false),
                    'last_location_at' => $this->lastLocationLabel($shipment),
                    'items' => $shipment->items->map(fn ($item) => [
                        'id' => $item->id,
                        'product_name' => $item->product_name,
                        'sku' => $item->sku,
                        'quantity' => (float) $item->quantity,
                        'unit' => $item->unit,
                        'weight_kg' => $item->weight_kg ? (float) $item->weight_kg : null,
                    ]),
                    'items_summary' => $this->itemsSummary($shipment),
                    'alerts' => $alerts,
                ];
            });

        // Fetch approved drivers for the dropdown with busy status
        $approvedDrivers = \App\Models\Driver::with('user:id,name')
            ->where('status', 'approved')
            ->get()
            ->map(function ($driver) {
                return [
                    'id' => $driver->id,
                    'name' => $driver->user->name,
                    'is_busy' => $driver->hasActiveShipment(),
                ];
            });

        // Calculate statistics
        $stats = [
            'in_transit' => Shipment::where('status', 'in-transit')->count(),
            'in_transit_trend' => '+12%',
            'delayed' => Shipment::where('status', 'delayed')->count(),
            'delayed_trend' => '-3%',
            'delivered_today' => Shipment::where('status', 'delivered')->whereDate('updated_at', today())->count(),
            'delivered_trend' => 'Optimal',
            'sea_freight' => Shipment::where('load_type', 'sea')->count(),
            'air_cargo' => Shipment::where('load_type', 'air')->count(),
            'ground' => Shipment::where('load_type', 'ground')->count(),
        ];

        return Inertia::render('Shipments', [
            'shipments' => $shipments,
            'stats' => $stats,
            'drivers' => $approvedDrivers,
            'filters' => [
                'search' => $search,
            ],
        ]);
    }

    public function create()
    {
        Gate::authorize('create', Shipment::class);

        $approvedDrivers = \App\Models\Driver::with('user:id,name')
            ->where('status', 'approved')
            ->get()
            ->map(function ($driver) {
                return [
                    'id' => $driver->id,
                    'name' => $driver->user->name,
                    'is_busy' => $driver->hasActiveShipment(),
                ];
            });

        $products = $this->shipmentProductCatalog();

        return Inertia::render('Shipments/Create', [
            'drivers' => $approvedDrivers,
            'products' => $products,
        ]);
    }

    public function store(Request $request)
    {
        Gate::authorize('create', Shipment::class);

        $validated = $request->validate([
            'origin' => 'required|string',
            'origin_name' => 'required|string',
            'origin_lat' => 'nullable|numeric',
            'origin_lng' => 'nullable|numeric',
            'destination' => 'required|string',
            'destination_name' => 'required|string',
            'dest_lat' => 'nullable|numeric',
            'dest_lng' => 'nullable|numeric',
            'tracking_stage' => 'required|in:ready_for_pickup,picked_up,in_transit,arrived_at_destination',
            'estimated_arrival' => 'required|date',
            'load_type' => 'required|in:sea,air,ground',
            'driver_id' => 'nullable|exists:drivers,id',
            'items' => 'nullable|array',
            'items.*.product_name' => 'required|string|max:255',
            'items.*.sku' => 'nullable|string|max:100',
            'items.*.quantity' => 'required|numeric|min:1',
            'items.*.unit' => 'nullable|string|max:50',
            'items.*.weight_kg' => 'nullable|numeric|min:0',
            'items.*.notes' => 'nullable|string|max:500',
            'items.*.product_id' => 'nullable|exists:products,id',
        ]);

        if ($request->filled('driver_id')) {
            $driver = \App\Models\Driver::findOrFail($request->driver_id);
            if ($driver->hasActiveShipment()) {
                return back()->withErrors(['driver_id' => 'Driver ini sedang memiliki pengiriman aktif.']);
            }
        }

        $validated['status'] = $this->mapTrackingStageToStatus($validated['tracking_stage']);
        $validated['shipment_id'] = $this->generateShipmentId();
        $validated['claimed_at'] = $validated['driver_id'] ? now() : null;
        $validated['last_tracking_note'] = $this->trackingStageNote($validated['tracking_stage'], (bool) $validated['driver_id']);

        $itemsData = $validated['items'] ?? [];
        unset($validated['items']);

        DB::transaction(function () use ($validated, $itemsData) {
            // Reserve stock for items that have product_id
            $itemsWithProduct = array_filter($itemsData, fn($item) => !empty($item['product_id']));
            if (!empty($itemsWithProduct)) {
                $this->reserveShipmentStock($itemsWithProduct);
            }

            $shipment = Shipment::create($validated);

            foreach ($itemsData as $item) {
                $shipment->items()->create($item);
            }
        });

        return redirect()
            ->route('shipments.index', ['page' => $request->integer('page', 1)])
            ->with('success', 'Pengiriman berhasil dibuat.');
    }

    private function generateShipmentId(): string
    {
        do {
            $candidate = 'TRK-'.now()->format('ymd').'-'.Str::upper(Str::random(4));
        } while (Shipment::where('shipment_id', $candidate)->exists());

        return $candidate;
    }

    public function edit(Shipment $shipment)
    {
        Gate::authorize('update', $shipment);

        $approvedDrivers = \App\Models\Driver::with('user:id,name')
            ->where('status', 'approved')
            ->get()
            ->map(function ($driver) {
                return [
                    'id' => $driver->id,
                    'name' => $driver->user->name,
                    'is_busy' => $driver->hasActiveShipment(),
                ];
            });

        $products = $this->shipmentProductCatalog();

        $shipment->load('items');

        return Inertia::render('Shipments/Edit', [
            'shipment' => [
                'id' => $shipment->id,
                'shipment_id' => $shipment->shipment_id,
                'origin' => $shipment->origin,
                'origin_name' => $shipment->origin_name,
                'origin_lat' => $shipment->origin_lat,
                'origin_lng' => $shipment->origin_lng,
                'destination' => $shipment->destination,
                'destination_name' => $shipment->destination_name,
                'dest_lat' => $shipment->dest_lat,
                'dest_lng' => $shipment->dest_lng,
                'status' => $shipment->status,
                'tracking_stage' => $shipment->tracking_stage,
                'estimated_arrival' => $shipment->estimated_arrival?->format('Y-m-d\TH:i'),
                'load_type' => $shipment->load_type,
                'driver_id' => $shipment->driver_id,
                'items' => $shipment->items->map(fn ($item) => [
                    'id' => $item->id,
                    'product_id' => $item->product_id,
                    'product_name' => $item->product_name,
                    'sku' => $item->sku,
                    'quantity' => (float) $item->quantity,
                    'unit' => $item->unit,
                    'weight_kg' => $item->weight_kg ? (float) $item->weight_kg : null,
                    'notes' => $item->notes,
                ]),
            ],
            'drivers' => $approvedDrivers,
            'products' => $products,
        ]);
    }

    public function update(Request $request, Shipment $shipment)
    {
        Gate::authorize('update', $shipment);

        $validated = $request->validate([
            'origin' => 'required|string',
            'origin_name' => 'required|string',
            'origin_lat' => 'nullable|numeric',
            'origin_lng' => 'nullable|numeric',
            'destination' => 'required|string',
            'destination_name' => 'required|string',
            'dest_lat' => 'nullable|numeric',
            'dest_lng' => 'nullable|numeric',
            'tracking_stage' => 'required|in:ready_for_pickup,picked_up,in_transit,arrived_at_destination',
            'estimated_arrival' => 'required|date',
            'load_type' => 'required|in:sea,air,ground',
            'driver_id' => 'nullable|exists:drivers,id',
            'items' => 'nullable|array',
            'items.*.product_name' => 'required|string|max:255',
            'items.*.sku' => 'nullable|string|max:100',
            'items.*.quantity' => 'required|numeric|min:1',
            'items.*.unit' => 'nullable|string|max:50',
            'items.*.weight_kg' => 'nullable|numeric|min:0',
            'items.*.notes' => 'nullable|string|max:500',
            'items.*.product_id' => 'nullable|exists:products,id',
        ]);

        $validated['status'] = $this->mapTrackingStageToStatus($validated['tracking_stage']);
        $validated['last_tracking_note'] = $this->trackingStageNote($validated['tracking_stage'], (bool) $validated['driver_id']);

        if ($request->filled('driver_id') && $request->driver_id != $shipment->driver_id) {
            $driver = \App\Models\Driver::findOrFail($request->driver_id);
            if ($driver->hasActiveShipment()) {
                return back()->withErrors(['driver_id' => 'Driver ini sedang memiliki pengiriman aktif.']);
            }
        }

        $itemsData = $validated['items'] ?? [];
        unset($validated['items']);

        DB::transaction(function () use ($validated, $itemsData, $shipment) {
            // Release old reserved stock
            $oldItems = $shipment->items->filter(fn($i) => $i->product_id)->map(fn($i) => [
                'product_id' => $i->product_id,
                'quantity' => (int) $i->quantity,
            ])->toArray();
            if (!empty($oldItems)) {
                $this->releaseShipmentStock($oldItems);
            }

            $shipment->fill($validated);
            $shipment->syncTrackingTimestamps($validated['tracking_stage']);
            $shipment->save();

            // Sync items: delete old, create new
            $shipment->items()->delete();
            foreach ($itemsData as $item) {
                $shipment->items()->create($item);
            }

            // Reserve new stock
            $itemsWithProduct = array_filter($itemsData, fn($item) => !empty($item['product_id']));
            if (!empty($itemsWithProduct)) {
                $this->reserveShipmentStock($itemsWithProduct);
            }
        });

        return redirect()
            ->route('shipments.index', ['page' => $request->integer('page', 1)])
            ->with('success', 'Pengiriman berhasil diperbarui.');
    }

    public function destroy(Request $request, Shipment $shipment)
    {
        Gate::authorize('delete', $shipment);

        DB::transaction(function () use ($shipment) {
            // Release reserved stock
            $items = $shipment->items->filter(fn($i) => $i->product_id)->map(fn($i) => [
                'product_id' => $i->product_id,
                'quantity' => (int) $i->quantity,
            ])->toArray();
            if (!empty($items)) {
                $this->releaseShipmentStock($items);
            }

            $shipment->delete();
        });

        return redirect()
            ->route('shipments.index', ['page' => $request->integer('page', 1)])
            ->with('success', 'Pengiriman berhasil dihapus.');
    }

    public function show(Shipment $shipment)
    {
        Gate::authorize('view', $shipment);

        $shipment->load(['driver.user', 'items']);
        $routeMetrics = $this->buildRouteMetrics($shipment);
        $alerts = $this->buildAlerts($shipment, $routeMetrics);

        return Inertia::render('ShipmentDetail', [
            'shipment' => [
                'id' => $shipment->shipment_id,
                'origin' => $shipment->origin,
                'origin_name' => $shipment->origin_name,
                'origin_lat' => $this->nullableCoordinate($shipment->origin_lat),
                'origin_lng' => $this->nullableCoordinate($shipment->origin_lng),
                'destination' => $shipment->destination,
                'destination_name' => $shipment->destination_name,
                'dest_lat' => $this->nullableCoordinate($shipment->dest_lat),
                'dest_lng' => $this->nullableCoordinate($shipment->dest_lng),
                'status' => $shipment->status,
                'tracking_stage' => $shipment->tracking_stage,
                'tracking_stage_label' => Shipment::trackingStageLabels()[$shipment->tracking_stage] ?? $shipment->tracking_stage,
                'last_tracking_note' => $shipment->last_tracking_note,
                'estimated_arrival' => $shipment->estimated_arrival?->format('F d, Y H:i'),
                'load_type' => $shipment->load_type,
                'created_at' => $shipment->created_at?->format('F d, Y'),
                'driver_name' => $shipment->driver?->user?->name ?? 'Belum ditugaskan',
                'driver_lat' => $this->nullableCoordinate($shipment->driver?->latitude),
                'driver_lng' => $this->nullableCoordinate($shipment->driver?->longitude),
                'last_location_at' => $this->lastLocationLabel($shipment),
                'claimed_at' => $shipment->claimed_at?->format('F d, Y H:i'),
                'picked_up_at' => $shipment->picked_up_at?->format('F d, Y H:i'),
                'in_transit_at' => $shipment->in_transit_at?->format('F d, Y H:i'),
                'arrived_at_destination_at' => $shipment->arrived_at_destination_at?->format('F d, Y H:i'),
                'delivered_at' => $shipment->delivered_at?->format('F d, Y H:i'),
                'delivery_recipient_name' => $shipment->delivery_recipient_name,
                'delivery_note' => $shipment->delivery_note,
                'delivery_photo_url' => $shipment->delivery_photo_path ? '/storage/' . $shipment->delivery_photo_path : null,
                'pod_verification_status' => $shipment->pod_verification_status,
                'pod_verification_note' => $shipment->pod_verification_note,
                'pod_verified_at' => $shipment->pod_verified_at?->format('F d, Y H:i'),
                'items' => $shipment->items->map(fn ($item) => [
                    'id' => $item->id,
                    'product_name' => $item->product_name,
                    'sku' => $item->sku,
                    'quantity' => (float) $item->quantity,
                    'unit' => $item->unit,
                    'weight_kg' => $item->weight_kg ? (float) $item->weight_kg : null,
                    'notes' => $item->notes,
                ]),
                'items_summary' => $this->itemsSummary($shipment),
                'route_metrics' => $routeMetrics,
                'alerts' => $alerts,
            ],
        ]);
    }

    public function updateStatus(Request $request, Shipment $shipment)
    {
        Gate::authorize('updateStatus', $shipment);

        $validated = $request->validate([
            'status' => 'required|in:on-time,delayed,in-transit,delivered',
        ]);

        $wasDelivered = $shipment->status === 'delivered';
        $shipment->fill($validated);

        if ($validated['status'] === 'delivered') {
            $shipment->tracking_stage = 'delivered';
            $shipment->syncTrackingTimestamps('delivered');
            $shipment->requirePendingProofVerification();

            // Deduct actual stock from warehouse when delivered
            if (!$wasDelivered) {
                $this->deductShipmentStock($shipment);
            }
        }

        $shipment->save();

        return redirect()->back()->with('success', 'Status pengiriman berhasil diperbarui.');
    }

    public function verifyProof(Request $request, Shipment $shipment)
    {
        Gate::authorize('verifyProof', $shipment);

        $validated = $request->validate([
            'verification_status' => 'required|in:approved,rejected',
            'verification_note' => 'nullable|string|max:1000',
        ]);

        if ($shipment->tracking_stage !== 'delivered') {
            return back()->withErrors([
                'verification_status' => 'Shipment belum ada pada tahap delivered.',
            ]);
        }

        $shipment->pod_verification_status = $validated['verification_status'];
        $shipment->pod_verification_note = $validated['verification_note'] ?? null;
        $shipment->pod_verified_by = $request->user()->id;
        $shipment->pod_verified_at = now();
        $shipment->last_tracking_note = $validated['verification_status'] === 'approved'
            ? 'Bukti pengiriman diverifikasi penanggung jawab gudang.'
            : 'Bukti pengiriman ditolak penanggung jawab gudang. Driver harus kirim ulang bukti.';
        $shipment->save();

        return back()->with('success', 'Verifikasi bukti pengiriman berhasil disimpan.');
    }

    public function downloadProofPdf(Shipment $shipment)
    {
        Gate::authorize('view', $shipment);

        $shipment->load('driver.user');
        $routeMetrics = $this->buildRouteMetrics($shipment);
        $alerts = $this->buildAlerts($shipment, $routeMetrics);

        $pdf = Pdf::loadView('shipments.proof_of_delivery', [
            'shipment' => $shipment,
            'routeMetrics' => $routeMetrics,
            'alerts' => $alerts,
        ])->setPaper('a4');

        return $pdf->download("Proof_of_Delivery_{$shipment->shipment_id}.pdf");
    }

    private function buildRouteMetrics(Shipment $shipment): array
    {
        $originLat = $shipment->origin_lat ? (float) $shipment->origin_lat : null;
        $originLng = $shipment->origin_lng ? (float) $shipment->origin_lng : null;
        $destLat = $shipment->dest_lat ? (float) $shipment->dest_lat : null;
        $destLng = $shipment->dest_lng ? (float) $shipment->dest_lng : null;
        $driverLat = $shipment->driver?->latitude ? (float) $shipment->driver->latitude : null;
        $driverLng = $shipment->driver?->longitude ? (float) $shipment->driver->longitude : null;

        if ($originLat === null || $originLng === null || $destLat === null || $destLng === null) {
            return [
                'total_km' => null,
                'remaining_km' => null,
                'covered_km' => null,
                'progress_percent' => null,
            ];
        }

        $totalKm = $this->distanceKm($originLat, $originLng, $destLat, $destLng);
        $remainingKm = null;
        $coveredKm = null;
        $progressPercent = null;

        if ($driverLat !== null && $driverLng !== null) {
            $remainingKm = $this->distanceKm($driverLat, $driverLng, $destLat, $destLng);
            $coveredKm = max(0, $totalKm - $remainingKm);
            $progressPercent = $totalKm > 0 ? min(100, round(($coveredKm / $totalKm) * 100)) : null;
        } elseif ($shipment->status === 'delivered') {
            $remainingKm = 0;
            $coveredKm = $totalKm;
            $progressPercent = 100;
        }

        return [
            'total_km' => $totalKm ? round($totalKm, 1) : null,
            'remaining_km' => $remainingKm !== null ? round($remainingKm, 1) : null,
            'covered_km' => $coveredKm !== null ? round($coveredKm, 1) : null,
            'progress_percent' => $progressPercent,
        ];
    }

    private function nullableCoordinate(mixed $value): ?float
    {
        return $value === null || $value === '' ? null : (float) $value;
    }

    private function itemsSummary(Shipment $shipment): array
    {
        $items = $shipment->items;
        $totalWeight = $items->sum('weight_kg');
        $totalQty = $items->sum('quantity');
        $uniqueProducts = $items->count();

        $topItems = $items->sortByDesc('quantity')->take(3)->map(fn ($item) => [
            'product_name' => $item->product_name,
            'quantity' => (float) $item->quantity,
            'unit' => $item->unit,
        ])->values()->toArray();

        return [
            'total_items' => $uniqueProducts,
            'total_quantity' => round($totalQty, 2),
            'total_weight_kg' => $totalWeight ? round($totalWeight, 2) : null,
            'top_items' => $topItems,
        ];
    }

    private function mapTrackingStageToStatus(string $trackingStage): string
    {
        return $trackingStage === 'delivered' ? 'delivered' : 'in-transit';
    }

    private function shipmentProductCatalog()
    {
        $warehouseId = \App\Models\Warehouse::query()->value('id');

        return Product::where('is_active', true)
            ->with(['unit:id,symbol', 'productStocks' => fn ($query) => $query->when($warehouseId, fn ($q) => $q->where('warehouse_id', $warehouseId))])
            ->orderBy('name')
            ->get(['id', 'sku', 'name', 'unit_id'])
            ->map(function ($p) use ($warehouseId) {
                $stock = $p->productStocks->first();

                $rackSources = RackStock::query()
                    ->with(['rack:id,code,warehouse_zone_id', 'rack.zone:id,code,name,warehouse_id'])
                    ->where('product_id', $p->id)
                    ->whereHas('rack.zone', fn ($q) => $q->where('warehouse_id', $warehouseId))
                    ->where('quantity', '>', 0)
                    ->orderByRaw('CASE WHEN expired_date IS NULL THEN 1 ELSE 0 END')
                    ->orderBy('expired_date')
                    ->get()
                    ->map(fn ($rs) => [
                        'rack_code' => $rs->rack?->code,
                        'zone_code' => $rs->rack?->zone?->code,
                        'zone_name' => $rs->rack?->zone?->name,
                        'available' => max(0, (int) $rs->quantity - (int) $rs->reserved_quantity),
                        'batch_number' => $rs->batch_number,
                        'expired_date' => $rs->expired_date?->format('Y-m-d'),
                    ])
                    ->filter(fn ($row) => $row['available'] > 0)
                    ->values();

                return [
                    'id' => $p->id,
                    'sku' => $p->sku,
                    'name' => $p->name,
                    'unit' => $p->unit?->symbol ?? 'pcs',
                    'available_stock' => $stock ? ((int) $stock->current_stock - (int) $stock->reserved_stock) : 0,
                    'current_stock' => $stock?->current_stock ?? 0,
                    'reserved_stock' => $stock?->reserved_stock ?? 0,
                    'rack_available_stock' => $rackSources->sum('available'),
                    'rack_sources' => $rackSources,
                ];
            });
    }

    private function trackingStageNote(string $trackingStage, bool $hasDriver): string
    {
        return match ($trackingStage) {
            'ready_for_pickup' => $hasDriver
                ? 'Shipment siap diambil oleh driver yang sudah dijadwalkan.'
                : 'Menunggu driver mengambil shipment.',
            'picked_up' => 'Barang sudah diambil driver dari gudang.',
            'in_transit' => 'Shipment sedang dalam perjalanan ke tujuan.',
            'arrived_at_destination' => 'Shipment sudah tiba di area tujuan dan menunggu finalisasi.',
            default => 'Status shipment diperbarui.',
        };
    }

    private function lastLocationLabel(Shipment $shipment): ?string
    {
        if ($shipment->driver?->latitude === null || $shipment->driver?->longitude === null) {
            return null;
        }

        return $shipment->driver->updated_at?->diffForHumans();
    }

    private function buildAlerts(Shipment $shipment, array $routeMetrics): array
    {
        $alerts = [
            'is_delayed' => false,
            'delay_minutes' => null,
            'eta_label' => null,
            'is_off_route' => false,
            'off_route_km' => null,
            'off_route_threshold_km' => null,
        ];

        if ($shipment->estimated_arrival && $shipment->status !== 'delivered') {
            $eta = Carbon::parse($shipment->estimated_arrival);
            if ($eta->isPast()) {
                $alerts['is_delayed'] = true;
                $alerts['delay_minutes'] = (int) round($eta->diffInMinutes(now()));
                $alerts['eta_label'] = $eta->locale('id')->diffForHumans();
            } else {
                $alerts['eta_label'] = $eta->locale('id')->diffForHumans();
            }
        }

        $originLat = $shipment->origin_lat ? (float) $shipment->origin_lat : null;
        $originLng = $shipment->origin_lng ? (float) $shipment->origin_lng : null;
        $destLat = $shipment->dest_lat ? (float) $shipment->dest_lat : null;
        $destLng = $shipment->dest_lng ? (float) $shipment->dest_lng : null;
        $driverLat = $shipment->driver?->latitude ? (float) $shipment->driver->latitude : null;
        $driverLng = $shipment->driver?->longitude ? (float) $shipment->driver->longitude : null;

        if ($originLat !== null && $originLng !== null && $destLat !== null && $destLng !== null && $driverLat !== null && $driverLng !== null) {
            $thresholdKm = max(50, (($routeMetrics['total_km'] ?? 0) * 0.12));
            $deviationKm = $this->distancePointToSegmentKm(
                $driverLat,
                $driverLng,
                $originLat,
                $originLng,
                $destLat,
                $destLng
            );

            $alerts['off_route_threshold_km'] = round($thresholdKm, 1);
            $alerts['off_route_km'] = round($deviationKm, 1);
            $alerts['is_off_route'] = $deviationKm > $thresholdKm;
        }

        return $alerts;
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
