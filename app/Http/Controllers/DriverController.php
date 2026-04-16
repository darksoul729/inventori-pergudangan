<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Models\Driver;
use Inertia\Inertia;

class DriverController extends Controller
{
    public function index()
    {
        return Inertia::render('Drivers', [
            'drivers' => Driver::with('user:id,name,email,role_id,status')->get(),
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

    public function getLocations()
    {
        $drivers = Driver::with('user:id,name')
            ->where('status', 'approved')
            ->select('id', 'user_id', 'latitude', 'longitude', 'status', 'updated_at', 'last_location_mock')
            ->get();

        return response()->json($drivers);
    }
}
