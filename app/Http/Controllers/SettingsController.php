<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Role;
use App\Models\Unit;
use App\Models\User;
use App\Models\Warehouse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Illuminate\Validation\Rules;

class SettingsController extends Controller
{
    public function index()
    {
        $categories = Category::withCount('products')->orderBy('name')->get();
        $units = Unit::withCount('products')->orderBy('name')->get();
        $warehouse = Warehouse::first();
        $staffUsers = User::query()
            ->with('role:id,name')
            ->whereHas('role', fn ($query) => $query->whereIn('name', ['Supervisor', 'Staff']))
            ->orderBy('name')
            ->get(['id', 'role_id', 'name', 'email', 'phone', 'status', 'created_at'])
            ->map(fn (User $user) => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'status' => $user->status,
                'role' => $user->role?->name,
                'created_at' => $user->created_at?->format('d M Y'),
            ]);

        return Inertia::render('Settings', [
            'categories' => $categories,
            'units' => $units,
            'warehouse' => $warehouse,
            'staffUsers' => $staffUsers,
        ]);
    }

    public function storeStaff(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'email' => ['required', 'string', 'lowercase', 'email', 'max:100', 'unique:users,email'],
            'phone' => ['nullable', 'string', 'max:20'],
            'role' => ['required', 'in:Supervisor,Staff'],
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        $staffRole = Role::where('name', $validated['role'])->firstOrFail();

        User::create([
            'role_id' => $staffRole->id,
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'] ?? null,
            'password' => Hash::make($validated['password']),
            'email_verified_at' => now(),
            'status' => 'active',
        ]);

        return redirect()
            ->route('settings', ['active' => 'staff'])
            ->with('success', 'Akun operasional berhasil dibuat.');
    }

    public function updateStaffStatus(Request $request, User $user)
    {
        abort_unless(in_array($user->role?->name, ['Supervisor', 'Staff'], true), 404);

        $validated = $request->validate([
            'status' => ['required', 'in:active,inactive'],
        ]);

        $user->update([
            'status' => $validated['status'],
        ]);

        return redirect()
            ->route('settings', ['active' => 'staff'])
            ->with('success', 'Status akun operasional berhasil diperbarui.');
    }

    public function updateWarehouse(Request $request, $id)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'location' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        $warehouse = Warehouse::findOrFail($id);
        $warehouse->update($validated);

        return redirect()->back()->with('success', 'Profil gudang berhasil diperbarui.');
    }

    // Category Methods
    public function storeCategory(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:categories,name',
            'description' => 'nullable|string',
        ]);

        Category::create($validated);

        return redirect()->back()->with('success', 'Kategori baru berhasil ditambahkan.');
    }

    public function updateCategory(Request $request, $id)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:categories,name,' . $id,
            'description' => 'nullable|string',
        ]);

        $category = Category::findOrFail($id);
        $category->update($validated);

        return redirect()->back()->with('success', 'Kategori berhasil diperbarui.');
    }

    public function destroyCategory($id)
    {
        $category = Category::findOrFail($id);

        if ($category->products()->count() > 0) {
            return redirect()->back()->with('error', 'Kategori tidak dapat dihapus karena sedang digunakan oleh produk aktif.');
        }

        $category->delete();

        return redirect()->back()->with('success', 'Kategori berhasil dihapus.');
    }

    // Unit Methods
    public function storeUnit(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:units,name',
            'symbol' => 'required|string|max:50',
        ]);

        Unit::create($validated);

        return redirect()->back()->with('success', 'Satuan / Unit baru berhasil ditambahkan.');
    }

    public function updateUnit(Request $request, $id)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:units,name,' . $id,
            'symbol' => 'required|string|max:50',
        ]);

        $unit = Unit::findOrFail($id);
        $unit->update($validated);

        return redirect()->back()->with('success', 'Satuan / Unit berhasil diperbarui.');
    }

    public function destroyUnit($id)
    {
        $unit = Unit::findOrFail($id);

        if ($unit->products()->count() > 0) {
            return redirect()->back()->with('error', 'Satuan tidak dapat dihapus karena sedang digunakan oleh produk aktif.');
        }

        $unit->delete();

        return redirect()->back()->with('success', 'Satuan / Unit berhasil dihapus.');
    }
}
