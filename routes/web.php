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

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

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

Route::get('/transaction', function () {
    return Inertia::render('Transaction');
})->middleware(['auth', 'verified'])->name('transaction');

Route::get('/supplier', function () {
    return Inertia::render('Supplier');
})->middleware(['auth', 'verified'])->name('supplier');

Route::get('/product/detail', function () {
    return Inertia::render('ProductDetail');
})->middleware(['auth', 'verified'])->name('product.detail');

Route::get('/rack-allocation', function () {
    return Inertia::render('RackAllocation');
})->middleware(['auth', 'verified'])->name('rack.allocation');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
