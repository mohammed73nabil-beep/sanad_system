<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes — جاهزة للتوسع المستقبلي (Mobile App)
|--------------------------------------------------------------------------
|
| هذه المسارات محجوزة للاستخدام المستقبلي مع تطبيق الجوال.
| في الإصدار الأول، النظام يعمل عبر Inertia.js فقط.
|
*/

Route::middleware('auth:sanctum')->prefix('v1')->name('api.v1.')->group(function () {
    // مستقبلاً:
    // Route::apiResource('customers', Api\V1\CustomerController::class);
    // Route::apiResource('suppliers', Api\V1\SupplierController::class);
    // Route::apiResource('products', Api\V1\ProductController::class);
    // Route::apiResource('invoices', Api\V1\InvoiceController::class);
    // Route::apiResource('purchases', Api\V1\PurchaseController::class);
    // Route::apiResource('payments', Api\V1\PaymentController::class);
    // Route::apiResource('receipts', Api\V1\ReceiptVoucherController::class);
    // Route::get('reports/summary', Api\V1\ReportController::class);
});

// Health check
Route::get('/health', fn () => response()->json(['status' => 'ok', 'system' => 'SANAD']));
