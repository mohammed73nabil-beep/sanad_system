<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        /**
         * جدول حركات المخزون
         *
         * يُسجَّل فيه كل تغيير في المخزون:
         * - عند الشراء: نوع = purchase (زيادة)
         * - عند البيع:  نوع = sale (نقص)
         * - تعديل يدوي: نوع = adjustment
         * - مرتجع:      نوع = return (مستقبلاً)
         */
        Schema::create('inventory_movements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')
                  ->constrained('products')
                  ->restrictOnDelete();

            $table->enum('type', [
                'purchase',    // شراء → زيادة مخزون
                'sale',        // بيع → نقص مخزون
                'adjustment',  // تعديل يدوي
                'return',      // مرتجع (مستقبلاً)
            ]);

            $table->decimal('quantity', 15, 2);               // الكمية المتغيرة (موجب أو سالب)
            $table->decimal('quantity_before', 15, 2);        // المخزون قبل الحركة
            $table->decimal('quantity_after', 15, 2);         // المخزون بعد الحركة
            $table->decimal('unit_cost', 15, 2)->default(0.00); // تكلفة الوحدة وقت الحركة

            // المرجع (رقم الفاتورة أو رقم الشراء)
            $table->string('reference_type')->nullable(); // 'invoice' أو 'purchase'
            $table->unsignedBigInteger('reference_id')->nullable();

            $table->text('notes')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index('product_id');
            $table->index('type');
            $table->index(['reference_type', 'reference_id']);
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('inventory_movements');
    }
};
