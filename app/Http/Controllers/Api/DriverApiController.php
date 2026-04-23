<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\Driver;
use App\Models\Role;
use App\Models\User;
use App\Models\Shipment;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class DriverApiController extends Controller
{
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
            'phone' => 'nullable|string',
            'license_number' => 'required|string|unique:drivers',
            'photo_id_card' => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $driverRole = Role::where('name', 'Driver')->first();

        if (!$driverRole) {
            return response()->json([
                'message' => 'Role driver belum tersedia. Jalankan seeder terlebih dahulu.',
            ], 500);
        }

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'phone' => $request->phone,
            'role_id' => $driverRole->id,
            'status' => 'active', // Diubah ke active agar bisa langsung login
        ]);

        $photoPath = null;
        if ($request->hasFile('photo_id_card')) {
            $photoPath = $request->file('photo_id_card')->store('drivers/id_cards', 'public');
        }

        $driver = Driver::create([
            'user_id' => $user->id,
            'license_number' => $request->license_number,
            'phone' => $request->phone,
            'photo_id_card' => $photoPath,
            'status' => 'approved', // Diubah ke approved untuk mempermudah debug
        ]);

        return response()->json([
            'message' => 'Driver registered successfully. Please wait for admin approval.',
            'driver' => $driver
        ], 201);
    }

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        $driver = $user->driver;

        if (!$driver || $driver->status !== 'approved') {
            return response()->json(['message' => 'Your account is pending approval or suspended.'], 403);
        }

        $token = $user->createToken('driver-token')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => $user,
            'driver' => $driver
        ]);
    }

    public function profile(Request $request)
    {
        $user = $request->user();
        $driver = $user->driver;

        return response()->json([
            'user' => $user,
            'driver' => $driver,
        ]);
    }

    public function assignedShipments(Request $request)
    {
        $driver = $request->user()->driver;

        // Strictly return only ONE shipment that is active/unapproved.
        // prioritized by Started tasks (in-progress), then by oldest assignment.
        // Tasks assigned by the warehouse team appear automatically.
        $shipment = Shipment::where('driver_id', $driver->id)
            ->where(function ($query) {
                $query->where('tracking_stage', '!=', 'delivered')
                    ->orWhere(function ($deliveredQuery) {
                        $deliveredQuery->where('tracking_stage', 'delivered')
                            ->where(function ($verificationQuery) {
                                $verificationQuery->whereNull('pod_verification_status')
                                    ->orWhere('pod_verification_status', '!=', 'approved');
                            });
                    });
            })
            ->orderByRaw("CASE WHEN tracking_stage != 'ready_for_pickup' THEN 0 ELSE 1 END")
            ->oldest() // Take the oldest assigned first
            ->first();

        $data = $shipment ? [$this->transformShipment($shipment)] : [];

        return response()->json([
            'message' => $shipment ? 'Assigned shipments loaded.' : 'No active shipments.',
            'data' => $data,
        ]);
    }

    public function claimShipment(Request $request)
    {
        $request->validate([
            'shipment_id' => 'required|string|exists:shipments,shipment_id',
        ]);

        $driver = $request->user()->driver;
        if ($this->hasBlockedShipment($driver->id)) {
            return response()->json([
                'message' => 'Selesaikan 1 pengiriman aktif Anda dulu. Pengiriman baru bisa diambil setelah bukti diverifikasi penanggung jawab gudang.',
            ], 422);
        }

        $shipmentCode = strtoupper(trim($request->string('shipment_id')->toString()));
        $shipment = Shipment::where('shipment_id', $shipmentCode)->first();

        // Check if shipment is already assigned to someone else
        if ($shipment->driver_id && (int) $shipment->driver_id !== (int) $driver->id) {
            return response()->json(['message' => 'Tugas ini sudah diberikan kepada driver lain.'], 422);
        }

        // If it's already active/claimed by current driver
        if ($shipment->claimed_at && (int) $shipment->driver_id === (int) $driver->id) {
            return response()->json(['message' => 'Shipment ini sudah ada di daftar tugas Anda.'], 422);
        }

        $shipment->update([
            'driver_id' => $driver->id,
            'tracking_stage' => 'ready_for_pickup',
            'claimed_at' => now(),
            'last_tracking_note' => $shipment->driver_id 
                ? 'Shipment diaktifkan oleh driver.'
                : 'Shipment diklaim oleh driver.',
        ]);

        return response()->json([
            'message' => 'Shipment berhasil ditambahkan.',
            'shipment' => $this->transformShipment($shipment->fresh())
        ]);
    }

    public function shipmentHistory(Request $request)
    {
        $driver = $request->user()->driver;

        // Show only delivered shipments with approved POD verification.
        $shipments = Shipment::where('driver_id', $driver->id)
            ->where('tracking_stage', 'delivered')
            ->where('pod_verification_status', 'approved')
            ->latest()
            ->get()
            ->map(fn (Shipment $shipment) => $this->transformShipment($shipment));

        return response()->json([
            'message' => 'Shipment history loaded.',
            'data' => $shipments,
        ]);
    }

    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'tracking_stage' => 'required|in:ready_for_pickup,picked_up,in_transit,arrived_at_destination,delivered',
            'note' => 'nullable|string|max:255',
            'delivery_recipient_name' => 'nullable|string|max:255',
            'delivery_note' => 'nullable|string|max:1000',
            'delivery_photo_base64' => 'nullable|string',
            'transaction_code' => 'nullable|string',
        ]);

        $shipment = Shipment::where('id', $id)
            ->where('driver_id', $request->user()->driver->id)
            ->firstOrFail();

        $trackingStage = $request->string('tracking_stage')->toString();

        $trackingStage = $request->string('tracking_stage')->toString();

        $shipment->fill([
            'tracking_stage' => $trackingStage,
            'last_tracking_note' => $request->input('note'),
        ]);

        if ($trackingStage === 'delivered') {
            $shipment->delivery_recipient_name = $request->input('delivery_recipient_name');
            $shipment->delivery_note = $request->input('delivery_note');
            if ($request->filled('delivery_photo_base64')) {
                $shipment->delivery_photo_path = $this->storeDeliveryPhoto($request->string('delivery_photo_base64')->toString());
            }
            $shipment->requirePendingProofVerification();
        }

        $shipment->syncTrackingTimestamps($trackingStage);
        $shipment->status = $this->mapTrackingStageToShipmentStatus($trackingStage, $shipment->status, $shipment->estimated_arrival);
        $shipment->save();

        return response()->json([
            'message' => 'Shipment status updated',
            'shipment' => $this->transformShipment($shipment->fresh()),
        ]);
    }

    public function updateLocation(Request $request)
    {
        $request->validate([
            'latitude' => 'required|numeric',
            'longitude' => 'required|numeric',
            'is_mock' => 'nullable|boolean',
        ]);

        $driver = $request->user()->driver;
        $driver->update([
            'latitude' => $request->latitude,
            'longitude' => $request->longitude,
            'last_location_mock' => $request->is_mock ?? false,
            'is_active' => true
        ]);
        
        // Ensure updated_at is refreshed even if lat/lng are identical (heartbeat)
        $driver->touch();

        return response()->json(['message' => 'Location updated']);
    }

    private function transformShipment(Shipment $shipment): array
    {
        return [
            'id' => $shipment->id,
            'shipment_id' => $shipment->shipment_id,
            'origin' => $shipment->origin,
            'origin_name' => $shipment->origin_name,
            'origin_lat' => $shipment->origin_lat ? (float) $shipment->origin_lat : null,
            'origin_lng' => $shipment->origin_lng ? (float) $shipment->origin_lng : null,
            'destination' => $shipment->destination,
            'destination_name' => $shipment->destination_name,
            'dest_lat' => $shipment->dest_lat ? (float) $shipment->dest_lat : null,
            'dest_lng' => $shipment->dest_lng ? (float) $shipment->dest_lng : null,
            'status' => $shipment->status,
            'tracking_stage' => $shipment->tracking_stage,
            'tracking_stage_label' => Shipment::trackingStageLabels()[$shipment->tracking_stage] ?? $shipment->tracking_stage,
            'estimated_arrival' => $shipment->estimated_arrival?->toIso8601String(),
            'last_tracking_note' => $shipment->last_tracking_note,
            'claimed_at' => $shipment->claimed_at?->toIso8601String(),
            'picked_up_at' => $shipment->picked_up_at?->toIso8601String(),
            'in_transit_at' => $shipment->in_transit_at?->toIso8601String(),
            'arrived_at_destination_at' => $shipment->arrived_at_destination_at?->toIso8601String(),
            'delivered_at' => $shipment->delivered_at?->toIso8601String(),
            'delivery_recipient_name' => $shipment->delivery_recipient_name,
            'delivery_note' => $shipment->delivery_note,
            'delivery_photo_url' => $shipment->delivery_photo_path ? '/storage/'.$shipment->delivery_photo_path : null,
            'pod_verification_status' => $shipment->pod_verification_status,
            'pod_verification_note' => $shipment->pod_verification_note,
            'pod_verified_at' => $shipment->pod_verified_at?->toIso8601String(),
        ];
    }

    private function hasBlockedShipment(int $driverId): bool
    {
        return Shipment::where('driver_id', $driverId)
            ->where(function ($query) {
                $query->where('tracking_stage', '!=', 'delivered')
                    ->orWhere(function ($deliveredQuery) {
                        $deliveredQuery->where('tracking_stage', 'delivered')
                            ->where(function ($verificationQuery) {
                                $verificationQuery->whereNull('pod_verification_status')
                                    ->orWhere('pod_verification_status', '!=', 'approved');
                            });
                    });
            })
            ->exists();
    }

    private function mapTrackingStageToShipmentStatus(string $trackingStage, string $currentStatus, ?\Carbon\Carbon $estimatedArrival = null): string
    {
        if ($trackingStage === 'delivered') {
            return 'delivered';
        }

        if (in_array($trackingStage, ['picked_up', 'in_transit', 'arrived_at_destination'])) {
            // If we have an estimated arrival, check if we are already late
            if ($estimatedArrival && $estimatedArrival->isPast()) {
                return 'delayed';
            }
            return 'in-transit'; // Or 'on-time' depending on preference, but 'in-transit' is safest
        }

        if ($trackingStage === 'ready_for_pickup') {
            if ($estimatedArrival && $estimatedArrival->isPast()) {
                return 'delayed';
            }
            return 'on-time';
        }

        return $currentStatus;
    }

    private function storeDeliveryPhoto(string $base64Payload): string
    {
        if (!preg_match('/^data:image\/(\w+);base64,/', $base64Payload, $matches)) {
            throw ValidationException::withMessages([
                'delivery_photo_base64' => 'Format foto POD tidak valid.',
            ]);
        }

        $extension = strtolower($matches[1]);
        if (!in_array($extension, ['jpg', 'jpeg', 'png', 'webp'], true)) {
            throw ValidationException::withMessages([
                'delivery_photo_base64' => 'Tipe foto POD tidak didukung.',
            ]);
        }

        $binary = base64_decode(substr($base64Payload, strpos($base64Payload, ',') + 1), true);
        if ($binary === false) {
            throw ValidationException::withMessages([
                'delivery_photo_base64' => 'Isi foto POD tidak valid.',
            ]);
        }

        if (strlen($binary) > 5 * 1024 * 1024) {
            throw ValidationException::withMessages([
                'delivery_photo_base64' => 'Ukuran foto POD maksimal 5 MB.',
            ]);
        }

        $path = 'shipments/pod/'.Str::uuid().'.'.$extension;
        Storage::disk('public')->put($path, $binary);

        return $path;
    }
}
