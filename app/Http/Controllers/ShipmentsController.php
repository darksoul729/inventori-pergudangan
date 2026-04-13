<?php

namespace App\Http\Controllers;

use App\Models\Shipment;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ShipmentsController extends Controller
{
    public function index()
    {
        $shipments = Shipment::latest()->get()->map(function ($shipment) {
            return [
                'id' => $shipment->shipment_id,
                'origin' => $shipment->origin,
                'origin_name' => $shipment->origin_name,
                'destination' => $shipment->destination,
                'destination_name' => $shipment->destination_name,
                'status' => $shipment->status,
                'estimated_arrival' => $shipment->estimated_arrival?->format('M d, H:i'),
                'load_type' => $shipment->load_type,
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
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'shipment_id' => 'required|unique:shipments',
            'origin' => 'required|string',
            'origin_name' => 'required|string',
            'destination' => 'required|string',
            'destination_name' => 'required|string',
            'status' => 'required|in:on-time,delayed,in-transit,delivered',
            'estimated_arrival' => 'required|date',
            'load_type' => 'required|in:sea,air,ground',
        ]);

        Shipment::create($validated);

        return redirect()->route('shipments.index')->with('success', 'Shipment created successfully.');
    }

    public function show(Shipment $shipment)
    {
        return Inertia::render('ShipmentDetail', [
            'shipment' => [
                'id' => $shipment->shipment_id,
                'origin' => $shipment->origin,
                'origin_name' => $shipment->origin_name,
                'destination' => $shipment->destination,
                'destination_name' => $shipment->destination_name,
                'status' => $shipment->status,
                'estimated_arrival' => $shipment->estimated_arrival?->format('M d, H:i'),
                'load_type' => $shipment->load_type,
                'created_at' => $shipment->created_at?->format('M d, Y'),
            ],
        ]);
    }

    public function updateStatus(Request $request, Shipment $shipment)
    {
        $validated = $request->validate([
            'status' => 'required|in:on-time,delayed,in-transit,delivered',
        ]);

        $shipment->update($validated);

        return redirect()->back()->with('success', 'Shipment status updated.');
    }
}
