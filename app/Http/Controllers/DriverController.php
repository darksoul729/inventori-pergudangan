<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Models\Driver;
use App\Models\Role;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;

class DriverController extends Controller
{
    public function index()
    {
        return Inertia::render('Drivers', [
            'drivers' => Driver::with('user:id,name,email,role_id,status')->get(),
        ]);
    }

    public function show(Driver $driver)
    {
        $driver->load([
            'user:id,name,email,role_id,status',
            'shipments' => fn ($query) => $query
                ->select(
                    'id',
                    'shipment_id',
                    'driver_id',
                    'status',
                    'tracking_stage',
                    'origin_name',
                    'destination_name',
                    'estimated_arrival',
                    'pod_verification_status',
                    'updated_at'
                )
                ->latest('updated_at')
                ->limit(8),
        ]);

        $activeShipment = $driver->shipments
            ->first(fn ($shipment) => $shipment->tracking_stage !== 'delivered')
            ?? $driver->shipments->first(fn ($shipment) => $shipment->tracking_stage === 'delivered' && $shipment->pod_verification_status !== 'approved');

        return Inertia::render('DriverDetail', [
            'driver' => [
                'id' => $driver->id,
                'name' => $driver->user?->name,
                'email' => $driver->user?->email,
                'account_status' => $driver->user?->status,
                'license_number' => $driver->license_number,
                'phone' => $driver->phone,
                'photo_id_card' => $driver->photo_id_card,
                'status' => $driver->status,
                'is_active' => (bool) $driver->is_active,
                'latitude' => $driver->latitude,
                'longitude' => $driver->longitude,
                'last_location_mock' => (bool) ($driver->last_location_mock ?? false),
                'updated_at' => $driver->updated_at?->toISOString(),
                'active_shipment' => $activeShipment ? [
                    'id' => $activeShipment->id,
                    'shipment_id' => $activeShipment->shipment_id,
                    'status' => $activeShipment->status,
                    'tracking_stage' => $activeShipment->tracking_stage,
                    'origin_name' => $activeShipment->origin_name,
                    'destination_name' => $activeShipment->destination_name,
                    'estimated_arrival' => $activeShipment->estimated_arrival?->format('d M Y H:i'),
                    'pod_verification_status' => $activeShipment->pod_verification_status,
                ] : null,
                'shipments' => $driver->shipments->map(fn ($shipment) => [
                    'id' => $shipment->id,
                    'shipment_id' => $shipment->shipment_id,
                    'status' => $shipment->status,
                    'tracking_stage' => $shipment->tracking_stage,
                    'origin_name' => $shipment->origin_name,
                    'destination_name' => $shipment->destination_name,
                    'estimated_arrival' => $shipment->estimated_arrival?->format('d M Y H:i'),
                    'pod_verification_status' => $shipment->pod_verification_status,
                    'updated_at' => $shipment->updated_at?->format('d M Y H:i'),
                    'url' => route('shipments.show', $shipment),
                ])->values(),
                'stats' => [
                    'total_shipments' => $driver->shipments->count(),
                    'active_shipments' => $driver->shipments->filter(fn ($shipment) => $shipment->tracking_stage !== 'delivered')->count(),
                    'delivered_shipments' => $driver->shipments->filter(fn ($shipment) => $shipment->tracking_stage === 'delivered')->count(),
                ],
            ],
        ]);
    }

    public function updateStatus(Request $request, Driver $driver)
    {
        $request->validate([
            'status' => 'required|in:approved,suspended,pending',
        ]);

        $driver->update(['status' => $request->status]);

        // If approved, also activate the associated user account
        if ($request->status === 'approved') {
            $driver->user->update(['status' => 'active']);
        } else {
            $driver->user->update(['status' => 'inactive']);
        }

        return redirect()->back()->with('message', 'Driver status updated successfully.');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'email' => ['required', 'string', 'lowercase', 'email', 'max:100', 'unique:users,email'],
            'phone' => ['nullable', 'string', 'max:20'],
            'license_number' => ['required', 'string', 'max:100', 'unique:drivers,license_number'],
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'status' => ['required', 'in:pending,approved'],
        ]);

        $driverRole = Role::where('name', 'Driver')->firstOrFail();

        DB::transaction(function () use ($validated, $driverRole): void {
            $user = User::create([
                'role_id' => $driverRole->id,
                'name' => $validated['name'],
                'email' => $validated['email'],
                'phone' => $validated['phone'] ?? null,
                'password' => Hash::make($validated['password']),
                'email_verified_at' => now(),
                'status' => $validated['status'] === 'approved' ? 'active' : 'inactive',
            ]);

            Driver::create([
                'user_id' => $user->id,
                'license_number' => $validated['license_number'],
                'phone' => $validated['phone'] ?? null,
                'status' => $validated['status'],
                'is_active' => $validated['status'] === 'approved',
            ]);
        });

        return redirect()->route('drivers.index')->with('message', 'Akun driver berhasil dibuat.');
    }

    public function getLocations()
    {
        $drivers = Driver::with([
            'user:id,name',
            'shipments' => function ($query) {
                $query->where('tracking_stage', '!=', 'delivered')
                    ->orWhere(function ($deliveredQuery) {
                        $deliveredQuery->where('tracking_stage', 'delivered')
                            ->where(function ($verificationQuery) {
                                $verificationQuery->whereNull('pod_verification_status')
                                    ->orWhere('pod_verification_status', '!=', 'approved');
                            });
                    })
                    ->select('id', 'shipment_id', 'driver_id', 'tracking_stage', 'origin_name', 'destination_name');
            }
        ])
            ->where('status', 'approved')
            ->select('id', 'user_id', 'latitude', 'longitude', 'status', 'updated_at', 'last_location_mock')
            ->get()
            ->map(function ($driver) {
                // Get the most "active" shipment (not ready_for_pickup takes priority)
                $activeShipment = $driver->shipments->first(fn($s) => $s->tracking_stage !== 'ready_for_pickup')
                    ?? $driver->shipments->first();

                $driver->active_shipment_id = $activeShipment?->shipment_id;
                $driver->active_shipment_stage = $activeShipment?->tracking_stage;
                $driver->active_shipment_origin = $activeShipment?->origin_name;
                $driver->active_shipment_destination = $activeShipment?->destination_name;

                unset($driver->shipments); // Remove full list to keep response small
                return $driver;
            });

        return response()->json($drivers);
    }
}
