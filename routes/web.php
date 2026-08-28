<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\SupplierController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\PurchaseController;
use App\Http\Controllers\InvoiceController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\ReceiptVoucherController;
use App\Http\Controllers\InventoryController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\Settings\CompanySettingController;

/*
|--------------------------------------------------------------------------
| مسارات المصادقة (Auth)
|--------------------------------------------------------------------------
*/
Route::middleware('guest')->group(function () {
    Route::get('/login', [AuthenticatedSessionController::class, 'create'])->name('login');
    Route::post('/login', [AuthenticatedSessionController::class, 'store']);
});

Route::post('/logout', [AuthenticatedSessionController::class, 'destroy'])
    ->middleware('auth')
    ->name('logout');

/*
|--------------------------------------------------------------------------
| مسارات النظام الرئيسية (تتطلب تسجيل الدخول)
|--------------------------------------------------------------------------
*/
Route::middleware('auth')->group(function () {

    // لوحة التحكم
    Route::get('/', [DashboardController::class, 'index'])->name('dashboard');

    // العملاء
    Route::resource('customers', CustomerController::class);
    Route::get('customers/{customer}/statement', [CustomerController::class, 'statement'])->name('customers.statement');
    Route::get('customers/{customer}/statement/pdf', [CustomerController::class, 'statementPdf'])->name('customers.statement.pdf');

    // الموردون
    Route::resource('suppliers', SupplierController::class);

    // التصنيفات
    Route::resource('categories', CategoryController::class);

    // المنتجات
    Route::resource('products', ProductController::class);
    Route::get('products/search', [ProductController::class, 'search'])->name('products.search');

    // المشتريات
    Route::resource('purchases', PurchaseController::class);
    Route::patch('purchases/{purchase}/confirm', [PurchaseController::class, 'confirm'])->name('purchases.confirm');
    Route::patch('purchases/{purchase}/cancel', [PurchaseController::class, 'cancel'])->name('purchases.cancel');
    Route::post('purchases/{purchase}/attachment', [PurchaseController::class, 'uploadAttachment'])->name('purchases.attachment');

    // الفواتير
    Route::resource('invoices', InvoiceController::class);
    Route::patch('invoices/{invoice}/issue', [InvoiceController::class, 'issue'])->name('invoices.issue');
    Route::patch('invoices/{invoice}/cancel', [InvoiceController::class, 'cancel'])->name('invoices.cancel');
    Route::get('invoices/{invoice}/pdf', [InvoiceController::class, 'pdf'])->name('invoices.pdf');
    Route::get('invoices/{invoice}/print', [InvoiceController::class, 'print'])->name('invoices.print');

    // الدفعات
    Route::resource('payments', PaymentController::class)->only(['store', 'destroy']);
    Route::post('invoices/{invoice}/payments', [PaymentController::class, 'storeForInvoice'])->name('invoices.payments.store');

    // سندات القبض
    Route::resource('receipt-vouchers', ReceiptVoucherController::class);
    Route::get('receipt-vouchers/{receiptVoucher}/pdf', [ReceiptVoucherController::class, 'pdf'])->name('receipt-vouchers.pdf');

    // المخزون
    Route::get('inventory', [InventoryController::class, 'index'])->name('inventory.index');
    Route::get('inventory/movements', [InventoryController::class, 'movements'])->name('inventory.movements');

    // التقارير
    Route::prefix('reports')->name('reports.')->group(function () {
        Route::get('sales', [ReportController::class, 'sales'])->name('sales');
        Route::get('purchases', [ReportController::class, 'purchases'])->name('purchases');
        Route::get('tax', [ReportController::class, 'tax'])->name('tax');
        Route::get('customers', [ReportController::class, 'customers'])->name('customers');
        Route::get('suppliers', [ReportController::class, 'suppliers'])->name('suppliers');
        Route::get('inventory', [ReportController::class, 'inventory'])->name('inventory');
        Route::get('profits', [ReportController::class, 'profits'])->name('profits');
        Route::get('receipts', [ReportController::class, 'receipts'])->name('receipts');
        Route::get('accountant', [ReportController::class, 'accountant'])->name('accountant');
        Route::get('accountant/pdf', [ReportController::class, 'accountantPdf'])->name('accountant.pdf');
        Route::get('accountant/excel', [ReportController::class, 'accountantExcel'])->name('accountant.excel');
    });

    // الإعدادات
    Route::prefix('settings')->name('settings.')->group(function () {
        Route::get('company', [CompanySettingController::class, 'edit'])->name('company');
        Route::put('company', [CompanySettingController::class, 'update'])->name('company.update');
        Route::post('company/logo', [CompanySettingController::class, 'uploadLogo'])->name('company.logo');
    });
});
