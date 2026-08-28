<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('invoice_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('invoice_id')
                  ->constrained('invoices')
                  ->cascadeOnDelete();
            $table->foreignId('product_id')
                  ->constrained('products')
                  ->restrictOnDelete();

            // بيانات snapshot للمنتج وقت إصدار الفاتورة
            $table->string('product_name');         // اسم المنتج
            $table->string('product_sku');          // رمز المنتج
            $table->string('barcode')->nullable();  // الباركود

            // الكميات والأسعار — جميعها DECIMAL(15,2)
            $table->decimal('quantity', 15, 2);                        // الكمية
            $table->decimal('unit_price', 15, 2);                      // سعر الوحدة
            $table->decimal('discount_percent', 5, 2)->default(0.00);  // نسبة الخصم
            $table->decimal('discount_amount', 15, 2)->default(0.00);  // مبلغ الخصم
            $table->decimal('tax_rate', 5, 2)->default(0.00);          // نسبة الضريبة
            $table->decimal('tax_amount', 15, 2)->default(0.00);       // مبلغ الضريبة
            $table->decimal('subtotal', 15, 2);                        // المجموع قبل الضريبة
            $table->decimal('total', 15, 2);                           // الإجمالي شامل الضريبة

            $table->timestamps();

            $table->index('invoice_id');
            $table->index('product_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('invoice_items');
    }
};
