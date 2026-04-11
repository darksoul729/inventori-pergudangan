<?php

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

Route::get('/warehouse', function () {
    return Inertia::render('Warehouse');
})->middleware(['auth', 'verified'])->name('warehouse');

Route::get('/inventory', function () {
    return Inertia::render('Inventory');
})->middleware(['auth', 'verified'])->name('inventory');

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
