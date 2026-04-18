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
        $drivers = Driver::with('user:id,name')
            ->where('status', 'approved')
            ->select('id', 'user_id', 'latitude', 'longitude', 'status', 'updated_at', 'last_location_mock')
            ->get();

        return response()->json($drivers);
    }
}
