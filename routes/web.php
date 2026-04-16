<?php

use App\Http\Controllers\WarehouseController;
use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

use App\Http\Controllers\DashboardController;

Route::get('/dashboard', [DashboardController::class, 'index'])->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/warehouse', [WarehouseController::class, 'index'])->name('warehouse');
    Route::post('/warehouse/zones', [WarehouseController::class, 'storeZone'])->name('warehouse.zones.store');
    Route::put('/warehouse/zones/{zone}', [WarehouseController::class, 'updateZone'])->name('warehouse.zones.update');
    Route::delete('/warehouse/zones/{zone}', [WarehouseController::class, 'destroyZone'])->name('warehouse.zones.destroy');
    Route::post('/warehouse/racks', [WarehouseController::class, 'storeRack'])->name('warehouse.racks.store');
    Route::put('/warehouse/racks/{rack}', [WarehouseController::class, 'updateRack'])->name('warehouse.racks.update');
    Route::delete('/warehouse/racks/{rack}', [WarehouseController::class, 'destroyRack'])->name('warehouse.racks.destroy');
    Route::post('/warehouse/rack-stocks', [WarehouseController::class, 'storeRackStock'])->name('warehouse.rack-stocks.store');
    Route::put('/warehouse/rack-stocks/{rackStock}', [WarehouseController::class, 'updateRackStock'])->name('warehouse.rack-stocks.update');
    Route::delete('/warehouse/rack-stocks/{rackStock}', [WarehouseController::class, 'destroyRackStock'])->name('warehouse.rack-stocks.destroy');
});

use App\Http\Controllers\InventoryController;

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/inventory', [InventoryController::class, 'index'])->name('inventory');
    Route::get('/inventory/create', [InventoryController::class, 'create'])->name('inventory.create');
    Route::post('/inventory/products', [InventoryController::class, 'store'])->name('inventory.store');
    Route::get('/inventory/outbound', [InventoryController::class, 'outbound'])->name('inventory.outbound.view');
    Route::post('/inventory/movements/outbound', [InventoryController::class, 'recordOutbound'])->name('inventory.outbound');
    Route::get('/inventory/{product}', [InventoryController::class, 'show'])->name('inventory.show');
});

use App\Http\Controllers\TransactionController;

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/transaction', [TransactionController::class, 'index'])->name('transaction');
    Route::get('/transaction/{transaction}', [TransactionController::class, 'show'])->name('transaction.show');
    Route::get('/transaction/export', [TransactionController::class, 'export'])->name('transaction.export');
});

use App\Http\Controllers\SupplierController;
use App\Http\Controllers\PurchaseOrderController;

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/supplier', [SupplierController::class, 'index'])->name('supplier');
    Route::post('/supplier', [SupplierController::class, 'store'])->name('supplier.store');
    Route::get('/supplier/{supplier}', [SupplierController::class, 'show'])->name('supplier.show');
    Route::post('/supplier/{supplier}/performance', [SupplierController::class, 'storePerformance'])->name('supplier.performance.store');

    // Purchase Orders
    Route::get('/purchase-orders', [PurchaseOrderController::class, 'index'])->name('purchase-orders.index');
    Route::get('/purchase-orders/create', [PurchaseOrderController::class, 'create'])->name('purchase-orders.create');
    Route::post('/purchase-orders', [PurchaseOrderController::class, 'store'])->name('purchase-orders.store');
    Route::get('/purchase-orders/{purchaseOrder}', [PurchaseOrderController::class, 'show'])->name('purchase-orders.show');
    Route::put('/purchase-orders/{purchaseOrder}/status', [PurchaseOrderController::class, 'updateStatus'])->name('purchase-orders.update-status');
});

use App\Http\Controllers\ShipmentsController;

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/shipments', [ShipmentsController::class, 'index'])->name('shipments.index');
    Route::get('/shipments/create', [ShipmentsController::class, 'create'])->name('shipments.create');
    Route::post('/shipments', [ShipmentsController::class, 'store'])->name('shipments.store');
    Route::get('/shipments/{shipment}/edit', [ShipmentsController::class, 'edit'])->name('shipments.edit');
    Route::put('/shipments/{shipment}', [ShipmentsController::class, 'update'])->name('shipments.update');
    Route::delete('/shipments/{shipment}', [ShipmentsController::class, 'destroy'])->name('shipments.destroy');
    Route::get('/shipments/{shipment}', [ShipmentsController::class, 'show'])->name('shipments.show');
    Route::get('/shipments/{shipment}/proof-pdf', [ShipmentsController::class, 'downloadProofPdf'])->name('shipments.proof-pdf');
    Route::put('/shipments/{shipment}/status', [ShipmentsController::class, 'updateStatus'])->name('shipments.update-status');
    Route::put('/shipments/{shipment}/verify-proof', [ShipmentsController::class, 'verifyProof'])->name('shipments.verify-proof');
});

use App\Http\Controllers\DriverController;

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/drivers', [DriverController::class, 'index'])->name('drivers.index');
    Route::get('/api/drivers/locations', [DriverController::class, 'getLocations'])->name('drivers.locations');
    Route::put('/drivers/{driver}/status', [DriverController::class, 'updateStatus'])->name('drivers.status.update');
});

Route::get('/rack-allocation', function () {
    return Inertia::render('RackAllocation');
})->middleware(['auth', 'verified'])->name('rack.allocation');

use App\Http\Controllers\ReportController;

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/reports', [ReportController::class, 'index'])->name('reports');
    Route::post('/reports/generate', [ReportController::class, 'generatePdf'])->name('reports.generate');
    Route::get('/reports/download/{report}', [ReportController::class, 'download'])->name('reports.download');
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
}
);

use App\Http\Controllers\SettingsController;

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/settings', [SettingsController::class, 'index'])->name('settings');
    Route::put('/settings/warehouse/{id}', [SettingsController::class, 'updateWarehouse'])->name('settings.warehouse.update');
    
    Route::post('/settings/categories', [SettingsController::class, 'storeCategory'])->name('settings.categories.store');
    Route::put('/settings/categories/{id}', [SettingsController::class, 'updateCategory'])->name('settings.categories.update');
    Route::delete('/settings/categories/{id}', [SettingsController::class, 'destroyCategory'])->name('settings.categories.destroy');
    
    Route::post('/settings/units', [SettingsController::class, 'storeUnit'])->name('settings.units.store');
    Route::put('/settings/units/{id}', [SettingsController::class, 'updateUnit'])->name('settings.units.update');
    Route::delete('/settings/units/{id}', [SettingsController::class, 'destroyUnit'])->name('settings.units.destroy');
});

require __DIR__.'/auth.php';
