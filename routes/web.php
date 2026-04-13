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
    Route::post('/inventory/products', [InventoryController::class, 'store'])->name('inventory.store');
    Route::post('/inventory/movements/outbound', [InventoryController::class, 'recordOutbound'])->name('inventory.outbound');
});

use App\Http\Controllers\TransactionController;

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/transaction', [TransactionController::class, 'index'])->name('transaction');
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
    Route::post('/shipments', [ShipmentsController::class, 'store'])->name('shipments.store');
    Route::get('/shipments/{shipment}', [ShipmentsController::class, 'show'])->name('shipments.show');
    Route::put('/shipments/{shipment}/status', [ShipmentsController::class, 'updateStatus'])->name('shipments.update-status');
});

Route::get('/product/detail', function () {
    return Inertia::render('ProductDetail');
})->middleware(['auth', 'verified'])->name('product.detail');

Route::get('/rack-allocation', function () {
    return Inertia::render('RackAllocation');
})->middleware(['auth', 'verified'])->name('rack.allocation');

Route::get('/reports', function () {
    return Inertia::render('Reports');
})->middleware(['auth', 'verified'])->name('reports');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
