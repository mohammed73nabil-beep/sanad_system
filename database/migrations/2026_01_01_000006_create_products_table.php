<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->string('name');                          // اسم المنتج
            $table->string('sku')->unique();                 // رمز المنتج
            $table->string('barcode')->nullable()->index();  // الباركود
            $table->foreignId('category_id')
                  ->nullable()
                  ->constrained('categories')
                  ->nullOnDelete();
            $table->foreignId('unit_id')
                  ->nullable()
                  ->constrained('units')
                  ->nullOnDelete();
            $table->decimal('purchase_price', 15, 2)->default(0.00); // سعر الشراء
            $table->decimal('sale_price', 15, 2)->default(0.00);     // سعر البيع
            $table->decimal('tax_rate', 5, 2)->default(15.00);       // نسبة الضريبة
            $table->decimal('stock_quantity', 15, 2)->default(0.00); // الكمية الحالية
            $table->decimal('min_stock_level', 15, 2)->default(0.00);// الحد الأدنى للمخزون
            $table->string('image_path')->nullable();        // صورة المنتج
            $table->text('description')->nullable();         // الوصف
            $table->enum('status', ['active', 'inactive'])->default('active'); // الحالة

            $table->timestamps();
            $table->softDeletes();

            $table->index('name');
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
