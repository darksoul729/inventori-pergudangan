<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Role;
use App\Models\Tenant;
use App\Models\Unit;
use App\Models\User;
use App\Models\Warehouse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules;

class SettingsController extends Controller
{
    public function index()
    {
        $tenantId = (int) (auth()->user()?->tenant_id ?? 0);
        $categories = Category::query()
            ->when($tenantId > 0, fn ($q) => $q->where('tenant_id', $tenantId))
            ->withCount('products')
            ->orderBy('name')
            ->get();
        $units = Unit::query()
            ->when($tenantId > 0, fn ($q) => $q->where('tenant_id', $tenantId))
            ->withCount('products')
            ->orderBy('name')
            ->get();
        $warehouse = Warehouse::query()
            ->when($tenantId > 0, fn ($q) => $q->where('tenant_id', $tenantId))
            ->first();
        $staffUsers = User::query()
            ->with('role:id,name')
            ->when($tenantId > 0, fn ($q) => $q->where('tenant_id', $tenantId))
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

        $tenant = Tenant::query()->find($tenantId);

        return Inertia::render('Settings', [
            'categories' => $categories,
            'units' => $units,
            'warehouse' => $warehouse,
            'staffUsers' => $staffUsers,
            'invoiceNotificationSettings' => [
                'notify_partial' => (bool) ($tenant?->invoice_email_on_partial ?? true),
                'notify_paid' => (bool) ($tenant?->invoice_email_on_paid ?? true),
            ],
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
            'tenant_id' => $request->user()?->tenant_id,
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
        abort_unless((int) $user->tenant_id === (int) ($request->user()?->tenant_id ?? 0), 403);

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

    public function updateStaff(Request $request, User $user)
    {
        abort_unless(in_array($user->role?->name, ['Supervisor', 'Staff'], true), 404);
        abort_unless((int) $user->tenant_id === (int) ($request->user()?->tenant_id ?? 0), 403);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'email' => ['required', 'string', 'lowercase', 'email', 'max:100', Rule::unique('users', 'email')->ignore($user->id)],
            'phone' => ['nullable', 'string', 'max:20'],
            'role' => ['required', 'in:Supervisor,Staff'],
        ]);

        $staffRole = Role::where('name', $validated['role'])->firstOrFail();

        $user->update([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'] ?? null,
            'role_id' => $staffRole->id,
        ]);

        return redirect()
            ->route('settings', ['active' => 'staff'])
            ->with('success', 'Akun operasional berhasil diperbarui.');
    }

    public function destroyStaff(Request $request, User $user)
    {
        abort_unless(in_array($user->role?->name, ['Supervisor', 'Staff'], true), 404);
        abort_unless((int) $user->tenant_id === (int) ($request->user()?->tenant_id ?? 0), 403);
        abort_if($user->id === $request->user()->id, 403);

        $user->delete();

        return redirect()
            ->route('settings', ['active' => 'staff'])
            ->with('success', 'Akun operasional berhasil dihapus.');
    }

    public function updateWarehouse(Request $request, $id)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'location' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        $warehouse = Warehouse::findOrFail($id);
        abort_unless((int) $warehouse->tenant_id === (int) ($request->user()?->tenant_id ?? 0), 403);
        $warehouse->update($validated);

        return redirect()->back()->with('success', 'Profil gudang berhasil diperbarui.');
    }

    public function updateInvoiceNotificationSettings(Request $request)
    {
        $tenantId = (int) ($request->user()?->tenant_id ?? 0);
        abort_unless($tenantId > 0, 403);

        $validated = $request->validate([
            'notify_partial' => ['required', 'boolean'],
            'notify_paid' => ['required', 'boolean'],
        ]);

        $tenant = Tenant::query()->findOrFail($tenantId);
        $tenant->update([
            'invoice_email_on_partial' => (bool) $validated['notify_partial'],
            'invoice_email_on_paid' => (bool) $validated['notify_paid'],
        ]);

        return redirect()->back()->with('success', 'Pengaturan email invoice berhasil diperbarui.');
    }

    // Category Methods
    public function storeCategory(Request $request)
    {
        $tenantId = (int) ($request->user()?->tenant_id ?? 0);
        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('categories', 'name')->where(fn ($q) => $q->where('tenant_id', $tenantId)),
            ],
            'description' => 'nullable|string',
        ]);

        Category::create([
            'tenant_id' => $tenantId,
            ...$validated,
        ]);

        return redirect()->back()->with('success', 'Kategori baru berhasil ditambahkan.');
    }

    public function updateCategory(Request $request, $id)
    {
        $tenantId = (int) ($request->user()?->tenant_id ?? 0);
        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('categories', 'name')
                    ->where(fn ($q) => $q->where('tenant_id', $tenantId))
                    ->ignore($id),
            ],
            'description' => 'nullable|string',
        ]);

        $category = Category::query()->findOrFail($id);
        abort_unless((int) $category->tenant_id === $tenantId, 403);
        $category->update($validated);

        return redirect()->back()->with('success', 'Kategori berhasil diperbarui.');
    }

    public function destroyCategory(Request $request, $id)
    {
        $tenantId = (int) ($request->user()?->tenant_id ?? 0);
        $category = Category::query()->findOrFail($id);
        abort_unless((int) $category->tenant_id === $tenantId, 403);

        if ($category->products()->count() > 0) {
            return redirect()->back()->with('error', 'Kategori tidak dapat dihapus karena sedang digunakan oleh produk aktif.');
        }

        $category->delete();

        return redirect()->back()->with('success', 'Kategori berhasil dihapus.');
    }

    // Unit Methods
    public function storeUnit(Request $request)
    {
        $tenantId = (int) ($request->user()?->tenant_id ?? 0);
        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('units', 'name')->where(fn ($q) => $q->where('tenant_id', $tenantId)),
            ],
            'symbol' => 'required|string|max:50',
        ]);

        Unit::create([
            'tenant_id' => $tenantId,
            ...$validated,
        ]);

        return redirect()->back()->with('success', 'Satuan / Unit baru berhasil ditambahkan.');
    }

    public function updateUnit(Request $request, $id)
    {
        $tenantId = (int) ($request->user()?->tenant_id ?? 0);
        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('units', 'name')
                    ->where(fn ($q) => $q->where('tenant_id', $tenantId))
                    ->ignore($id),
            ],
            'symbol' => 'required|string|max:50',
        ]);

        $unit = Unit::query()->findOrFail($id);
        abort_unless((int) $unit->tenant_id === $tenantId, 403);
        $unit->update($validated);

        return redirect()->back()->with('success', 'Satuan / Unit berhasil diperbarui.');
    }

    public function destroyUnit(Request $request, $id)
    {
        $tenantId = (int) ($request->user()?->tenant_id ?? 0);
        $unit = Unit::query()->findOrFail($id);
        abort_unless((int) $unit->tenant_id === $tenantId, 403);

        if ($unit->products()->count() > 0) {
            return redirect()->back()->with('error', 'Satuan tidak dapat dihapus karena sedang digunakan oleh produk aktif.');
        }

        $unit->delete();

        return redirect()->back()->with('success', 'Satuan / Unit berhasil dihapus.');
    }
}
