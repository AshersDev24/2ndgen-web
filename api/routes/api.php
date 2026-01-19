<?php

use App\Http\Controllers\ContactRequestController;
use App\Http\Controllers\ProductController;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Route;

Route::get('/health', function () {
    try {
        DB::select('select 1');
        return response()->json([
            'ok' => true,
            'db' => 'up',
            'timestamp' => now()->toISOString(),
        ]);
    } catch (Throwable $e) {
        return response()->json([
            'ok' => false,
            'db' => 'down',
            'error' => $e->getMessage(),
            'timestamp' => now()->toISOString(),
        ], 500);
    }
});

Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{slug}', [ProductController::class, 'show']);
Route::post('/contact', [ContactRequestController::class, 'store']);
