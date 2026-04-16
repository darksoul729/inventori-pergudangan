<?php
 
use App\Http\Controllers\Api\DriverApiController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::post('/driver/register', [DriverApiController::class, 'register']);
Route::post('/driver/login', [DriverApiController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/driver/user', function (Request $request) {
        return $request->user();
    });
    Route::get('/driver/profile', [DriverApiController::class, 'profile']);

    Route::get('/driver/shipments', [DriverApiController::class, 'assignedShipments']);
    Route::get('/driver/shipments/history', [DriverApiController::class, 'shipmentHistory']);
    Route::post('/driver/shipments/claim', [DriverApiController::class, 'claimShipment']);
    Route::put('/driver/shipments/{id}/status', [DriverApiController::class, 'updateStatus']);
    Route::post('/driver/location', [DriverApiController::class, 'updateLocation']);
});
