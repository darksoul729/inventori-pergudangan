<?php

use App\Http\Controllers\WarehouseController;
use App\Http\Controllers\WarehouseLayoutController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\StockTransferController;
use App\Http\Controllers\StockOpnameController;
use App\Http\Controllers\GoodsReceiptController;
use App\Http\Controllers\StockOutController;
use App\Http\Controllers\StockAdjustmentController;
use App\Http\Controllers\WmsDocumentController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
        'stats' => [
            'transactions' => \App\Models\StockMovement::count() + \App\Models\Shipment::count(),
            'products' => \App\Models\Product::count(),
            'accuracy' => 99,
        ],
    ]);
});

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\HelpCenterController;
use App\Http\Controllers\NotificationCenterController;

Route::get('/dashboard', [DashboardController::class, 'index'])
    ->middleware(['auth', 'verified', 'role:manager,supervisor,staff'])
    ->name('dashboard');

Route::middleware(['auth', 'verified', 'role:manager,supervisor,staff'])->prefix('help')->name('help.')->group(function () {
    Route::redirect('/', '/help/documentation')->name('index');
    Route::get('/live-support', [HelpCenterController::class, 'liveSupport'])->name('live-support');
    Route::get('/documentation', [HelpCenterController::class, 'documentation'])->name('documentation');
});

Route::get('/notifications', [NotificationCenterController::class, 'index'])
    ->middleware(['auth', 'verified', 'role:manager,supervisor,staff'])
    ->name('notifications.index');

Route::get('/notifications/{notificationId}', [NotificationCenterController::class, 'show'])
    ->middleware(['auth', 'verified', 'role:manager,supervisor,staff'])
    ->name('notifications.show');

Route::middleware(['auth', 'verified', 'role:manager,supervisor,staff'])->group(function () {
    Route::get('/warehouse', [WarehouseController::class, 'index'])->name('warehouse');
    Route::post('/warehouse/zones', [WarehouseController::class, 'storeZone'])->middleware('role:manager')->name('warehouse.zones.store');
    Route::put('/warehouse/zones/{zone}', [WarehouseController::class, 'updateZone'])->middleware('role:manager')->name('warehouse.zones.update');
    Route::delete('/warehouse/zones/{zone}', [WarehouseController::class, 'destroyZone'])->middleware('role:manager')->name('warehouse.zones.destroy');
    Route::post('/warehouse/racks', [WarehouseController::class, 'storeRack'])->middleware('role:manager')->name('warehouse.racks.store');
    Route::put('/warehouse/racks/{rack}', [WarehouseController::class, 'updateRack'])->middleware('role:manager')->name('warehouse.racks.update');
    Route::delete('/warehouse/racks/{rack}', [WarehouseController::class, 'destroyRack'])->middleware('role:manager')->name('warehouse.racks.destroy');
    Route::post('/warehouse/rack-stocks', [WarehouseController::class, 'storeRackStock'])->middleware('role:manager,supervisor')->name('warehouse.rack-stocks.store');
    Route::put('/warehouse/rack-stocks/{rackStock}', [WarehouseController::class, 'updateRackStock'])->middleware('role:manager,supervisor')->name('warehouse.rack-stocks.update');
    Route::delete('/warehouse/rack-stocks/{rackStock}', [WarehouseController::class, 'destroyRackStock'])->middleware('role:manager,supervisor')->name('warehouse.rack-stocks.destroy');

    Route::get('/warehouse/layout', [WarehouseLayoutController::class, 'show'])->name('warehouse.layout.show');
    Route::post('/warehouse/layout', [WarehouseLayoutController::class, 'store'])->middleware('role:manager')->name('warehouse.layout.store');
    Route::get('/warehouse/layout/snapshots', [WarehouseLayoutController::class, 'snapshots'])->name('warehouse.layout.snapshots');
});

use App\Http\Controllers\InventoryController;

Route::middleware(['auth', 'verified', 'role:manager,supervisor,staff'])->group(function () {
    Route::get('/inventory', [InventoryController::class, 'index'])->name('inventory');
    Route::get('/inventory/outbound', [InventoryController::class, 'outbound'])->name('inventory.outbound.view');
    Route::post('/inventory/movements/outbound', [InventoryController::class, 'recordOutbound'])->name('inventory.outbound');
});

Route::middleware(['auth', 'verified', 'role:manager'])->group(function () {
    Route::get('/inventory/create', [InventoryController::class, 'create'])->name('inventory.create');
    Route::post('/inventory/products', [InventoryController::class, 'store'])->name('inventory.store');
    Route::get('/inventory/{product}/edit', [InventoryController::class, 'edit'])->name('inventory.edit');
    Route::put('/inventory/{product}', [InventoryController::class, 'update'])->name('inventory.update');
});

Route::get('/inventory/{product}', [InventoryController::class, 'show'])
    ->middleware(['auth', 'verified', 'role:manager,supervisor,staff'])
    ->name('inventory.show');

use App\Http\Controllers\TransactionController;

Route::middleware(['auth', 'verified', 'role:manager,supervisor,staff'])->group(function () {
    Route::get('/transaction', [TransactionController::class, 'index'])->name('transaction');
    Route::get('/transaction/export', [TransactionController::class, 'export'])
        ->middleware('role:manager,supervisor')
        ->name('transaction.export');
    Route::get('/transaction/{transaction}/pdf', [TransactionController::class, 'downloadPdf'])->name('transaction.pdf');
    Route::post('/transaction/{transaction}/verify', [TransactionController::class, 'verify'])
        ->middleware('role:manager,supervisor')
        ->name('transaction.verify');
    Route::get('/transaction/{transaction}', [TransactionController::class, 'show'])->name('transaction.show');
});

use App\Http\Controllers\SupplierController;
use App\Http\Controllers\PurchaseOrderController;

Route::middleware(['auth', 'verified', 'role:manager,supervisor,staff'])->group(function () {
    Route::get('/supplier', [SupplierController::class, 'index'])->name('supplier');
    Route::post('/supplier', [SupplierController::class, 'store'])->middleware('role:manager')->name('supplier.store');
    Route::get('/supplier/{supplier}', [SupplierController::class, 'show'])->name('supplier.show');
    Route::post('/supplier/{supplier}/performance', [SupplierController::class, 'storePerformance'])
        ->middleware('role:manager,supervisor')
        ->name('supplier.performance.store');

    // Purchase Orders
    Route::get('/purchase-orders', [PurchaseOrderController::class, 'index'])->name('purchase-orders.index');
});

Route::middleware(['auth', 'verified', 'role:manager,supervisor'])->group(function () {
    Route::get('/purchase-orders/create', [PurchaseOrderController::class, 'create'])->name('purchase-orders.create');
    Route::post('/purchase-orders', [PurchaseOrderController::class, 'store'])->name('purchase-orders.store');
    Route::put('/purchase-orders/{purchaseOrder}/status', [PurchaseOrderController::class, 'updateStatus'])
        ->name('purchase-orders.update-status');
});

Route::get('/purchase-orders/{purchaseOrder}', [PurchaseOrderController::class, 'show'])
    ->middleware(['auth', 'verified', 'role:manager,supervisor,staff'])
    ->name('purchase-orders.show');
Route::get('/purchase-orders/{purchaseOrder}/pdf', [PurchaseOrderController::class, 'downloadPdf'])
    ->middleware(['auth', 'verified', 'role:manager,supervisor,staff'])
    ->name('purchase-orders.pdf');

Route::middleware(['auth', 'verified', 'role:manager,supervisor'])->group(function () {
    Route::get('/wms-documents', [WmsDocumentController::class, 'index'])->name('wms-documents.index');
    Route::get('/wms-documents/export', [WmsDocumentController::class, 'export'])->name('wms-documents.export');
    Route::get('/wms-documents/pdf', [WmsDocumentController::class, 'downloadPdf'])->name('wms-documents.pdf');
});

Route::middleware(['auth', 'verified', 'role:manager,supervisor,staff'])->group(function () {
    Route::get('/goods-receipts/{goodsReceipt}/pdf', [GoodsReceiptController::class, 'downloadPdf'])->name('goods-receipts.pdf');
    Route::get('/goods-receipts/{goodsReceipt}', [GoodsReceiptController::class, 'show'])->name('goods-receipts.show');
    Route::get('/stock-outs/{stockOut}/pdf', [StockOutController::class, 'downloadPdf'])->name('stock-outs.pdf');
    Route::get('/stock-outs/{stockOut}', [StockOutController::class, 'show'])->name('stock-outs.show');
});

use App\Http\Controllers\ShipmentsController;

Route::middleware(['auth', 'verified', 'role:manager,supervisor,staff'])->group(function () {
    Route::get('/shipments', [ShipmentsController::class, 'index'])->name('shipments.index');
});

Route::middleware(['auth', 'verified', 'role:manager,supervisor'])->group(function () {
    Route::get('/shipments/create', [ShipmentsController::class, 'create'])->name('shipments.create');
    Route::post('/shipments', [ShipmentsController::class, 'store'])->name('shipments.store');
    Route::get('/shipments/{shipment}/edit', [ShipmentsController::class, 'edit'])->name('shipments.edit');
    Route::put('/shipments/{shipment}', [ShipmentsController::class, 'update'])->name('shipments.update');
    Route::delete('/shipments/{shipment}', [ShipmentsController::class, 'destroy'])->middleware('role:manager')->name('shipments.destroy');
    Route::put('/shipments/{shipment}/status', [ShipmentsController::class, 'updateStatus'])
        ->name('shipments.update-status');
    Route::put('/shipments/{shipment}/verify-proof', [ShipmentsController::class, 'verifyProof'])
        ->name('shipments.verify-proof');
});

Route::middleware(['auth', 'verified', 'role:manager,supervisor,staff'])->group(function () {
    Route::get('/shipments/{shipment}/proof-pdf', [ShipmentsController::class, 'downloadProofPdf'])->name('shipments.proof-pdf');
    Route::get('/shipments/{shipment}', [ShipmentsController::class, 'show'])->name('shipments.show');
});

use App\Http\Controllers\DriverController;

Route::middleware(['auth', 'verified', 'role:manager'])->group(function () {
    Route::get('/drivers', [DriverController::class, 'index'])->name('drivers.index');
    Route::get('/drivers/create', [DriverController::class, 'create'])->name('drivers.create');
    Route::post('/drivers', [DriverController::class, 'store'])->name('drivers.store');
    Route::get('/drivers/{driver}', [DriverController::class, 'show'])->name('drivers.show');
    Route::get('/api/drivers/locations', [DriverController::class, 'getLocations'])->name('drivers.locations');
    Route::put('/drivers/{driver}/status', [DriverController::class, 'updateStatus'])->name('drivers.status.update');
});

Route::middleware(['auth', 'verified', 'role:manager,supervisor,staff'])->group(function () {
    // Staff can view rack allocation & stock opname (read-only)
    Route::get('/rack-allocation', [StockTransferController::class, 'index'])->name('rack.allocation');
    Route::get('/rack-allocation/transfers/{stockTransfer}/pdf', [StockTransferController::class, 'downloadPdf'])->name('rack.allocation.transfers.pdf');
    Route::get('/rack-allocation/transfers/{stockTransfer}', [StockTransferController::class, 'show'])->name('rack.allocation.transfers.show');
    Route::get('/stock-opname', [StockOpnameController::class, 'index'])->name('stock-opname.index');
    Route::get('/stock-opname/{stockOpname}/pdf', [StockOpnameController::class, 'downloadPdf'])->name('stock-opname.pdf');
    Route::get('/stock-opname/{stockOpname}', [StockOpnameController::class, 'show'])->name('stock-opname.show');
    Route::get('/stock-adjustments/{stockAdjustment}/pdf', [StockAdjustmentController::class, 'downloadPdf'])->name('stock-adjustments.pdf');
    Route::get('/stock-adjustments/{stockAdjustment}', [StockAdjustmentController::class, 'show'])->name('stock-adjustments.show');
});

// Supervisor+ can create, approve, reject
Route::middleware(['auth', 'verified', 'role:manager,supervisor'])->group(function () {
    Route::post('/rack-allocation/transfers', [StockTransferController::class, 'store'])->name('rack.allocation.transfers.store');
    Route::post('/rack-allocation/transfers/{stockTransfer}/approve', [StockTransferController::class, 'approve'])->name('rack.allocation.transfers.approve');
    Route::post('/rack-allocation/transfers/{stockTransfer}/reject', [StockTransferController::class, 'reject'])->name('rack.allocation.transfers.reject');
    Route::post('/stock-opname', [StockOpnameController::class, 'store'])->name('stock-opname.store');
    Route::post('/stock-opname/{stockOpname}/approve', [StockOpnameController::class, 'approve'])->name('stock-opname.approve');
    Route::post('/stock-opname/{stockOpname}/reject', [StockOpnameController::class, 'reject'])->name('stock-opname.reject');
    Route::post('/stock-adjustments/{stockAdjustment}/approve', [StockAdjustmentController::class, 'approve'])->name('stock-adjustments.approve');
    Route::post('/stock-adjustments/{stockAdjustment}/reject', [StockAdjustmentController::class, 'reject'])->name('stock-adjustments.reject');
});

use App\Http\Controllers\ReportController;

Route::middleware(['auth', 'verified', 'role:manager,supervisor'])->group(function () {
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

Route::middleware(['auth', 'verified', 'role:manager'])->group(function () {
    Route::get('/settings', [SettingsController::class, 'index'])->name('settings');
    Route::put('/settings/warehouse/{id}', [SettingsController::class, 'updateWarehouse'])->name('settings.warehouse.update');
    Route::post('/settings/staff', [SettingsController::class, 'storeStaff'])->name('settings.staff.store');
    Route::put('/settings/staff/{user}/status', [SettingsController::class, 'updateStaffStatus'])->name('settings.staff.status');
    
    Route::post('/settings/categories', [SettingsController::class, 'storeCategory'])->name('settings.categories.store');
    Route::put('/settings/categories/{id}', [SettingsController::class, 'updateCategory'])->name('settings.categories.update');
    Route::delete('/settings/categories/{id}', [SettingsController::class, 'destroyCategory'])->name('settings.categories.destroy');
    
    Route::post('/settings/units', [SettingsController::class, 'storeUnit'])->name('settings.units.store');
    Route::put('/settings/units/{id}', [SettingsController::class, 'updateUnit'])->name('settings.units.update');
    Route::delete('/settings/units/{id}', [SettingsController::class, 'destroyUnit'])->name('settings.units.destroy');
});


use App\Http\Controllers\PetayuAIController;

// ─── PETAYU AI Assistant ───────────────────────────────────────────────────────
Route::middleware(['auth', 'verified', 'role:manager,supervisor,staff'])->prefix('petayu-ai')->name('petayu.')->group(function () {
    Route::get('/',                                    [PetayuAIController::class, 'index'])->name('index');
    Route::get('/dashboard-insight',                   [PetayuAIController::class, 'dashboardInsight'])->name('dashboard-insight');
    Route::get('/conversations',                       [PetayuAIController::class, 'conversations'])->name('conversations');
    Route::post('/conversations',                      [PetayuAIController::class, 'newConversation'])->name('conversations.new');
    Route::delete('/conversations-empty',              [PetayuAIController::class, 'deleteUntitledConversations'])->name('conversations.delete-empty');
    Route::get('/conversations/{id}/messages',         [PetayuAIController::class, 'messages'])->name('conversations.messages');
    Route::delete('/conversations/{id}',              [PetayuAIController::class, 'deleteConversation'])->name('conversations.delete');
    Route::post('/chat',                               [PetayuAIController::class, 'chat'])->name('chat');
    Route::post('/local-tts',                          [PetayuAIController::class, 'localTextToSpeech'])->name('local-tts');
    Route::post('/transcribe',                         [PetayuAIController::class, 'transcribeAudio'])->name('transcribe');
    Route::post('/live-transcript',                    [PetayuAIController::class, 'saveLiveTranscript'])->name('live-transcript');
});

// Legacy compatibility for old /petayu endpoints.
Route::middleware(['auth', 'verified', 'role:manager,supervisor,staff'])->prefix('petayu')->group(function () {
    Route::get('/',                                    [PetayuAIController::class, 'index']);
    Route::get('/dashboard-insight',                   [PetayuAIController::class, 'dashboardInsight']);
    Route::get('/conversations',                       [PetayuAIController::class, 'conversations']);
    Route::post('/conversations',                      [PetayuAIController::class, 'newConversation']);
    Route::delete('/conversations-empty',              [PetayuAIController::class, 'deleteUntitledConversations']);
    Route::get('/conversations/{id}/messages',         [PetayuAIController::class, 'messages']);
    Route::delete('/conversations/{id}',               [PetayuAIController::class, 'deleteConversation']);
    Route::post('/chat',                               [PetayuAIController::class, 'chat']);
    Route::post('/local-tts',                          [PetayuAIController::class, 'localTextToSpeech']);
    Route::post('/transcribe',                         [PetayuAIController::class, 'transcribeAudio']);
    Route::post('/live-transcript',                    [PetayuAIController::class, 'saveLiveTranscript']);
});

require __DIR__.'/auth.php';
