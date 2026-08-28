<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('purchases', function (Blueprint $table) {
            $table->id();
            $table->string('purchase_number', 20)->unique(); // رقم فاتورة الشراء PUR-000001
            $table->foreignId('supplier_id')
                  ->constrained('suppliers')
                  ->restrictOnDelete();
            $table->enum('status', ['draft', 'confirmed', 'cancelled'])->default('draft');
            $table->date('purchase_date');                    // تاريخ الشراء
            $table->date('due_date')->nullable();             // تاريخ الاستحقاق

            // المبالغ المالية — جميعها DECIMAL(15,2)
            $table->decimal('subtotal', 15, 2)->default(0.00);         // المجموع قبل الضريبة
            $table->decimal('discount_amount', 15, 2)->default(0.00);  // مبلغ الخصم
            $table->decimal('tax_amount', 15, 2)->default(0.00);       // مبلغ الضريبة
            $table->decimal('total_amount', 15, 2)->default(0.00);     // الإجمالي النهائي
            $table->decimal('paid_amount', 15, 2)->default(0.00);      // المدفوع
            $table->decimal('remaining_amount', 15, 2)->default(0.00); // المتبقي (يُحسب عبر PaymentService)

            $table->string('supplier_invoice_number')->nullable(); // رقم فاتورة المورد الأصلية
            $table->string('attachment_path')->nullable();         // مسار مرفق فاتورة المورد
            $table->text('notes')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();

            $table->timestamps();
            $table->softDeletes();

            $table->index('purchase_date');
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('purchases');
    }
};
