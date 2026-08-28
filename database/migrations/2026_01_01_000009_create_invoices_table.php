<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        /**
         * جدول الفواتير (فواتير البيع فقط)
         *
         * ملاحظة: فواتير الشراء في جدول purchases منفصل.
         * invoice.type = 'sale' دائماً في الإصدار الأول.
         * الحالات (status) تعبّر عن وضع الدفع والتشغيل.
         *
         * remaining_amount: يُحسب ويُحدَّث من PaymentService
         * عند كل عملية دفع — ليس generated column.
         */
        Schema::create('invoices', function (Blueprint $table) {
            $table->id();
            $table->string('invoice_number', 20)->unique(); // رقم الفاتورة INV-000001
            $table->enum('type', ['sale'])->default('sale'); // نوع الفاتورة (بيع فقط)
            $table->enum('status', [
                'draft',           // مسودة
                'issued',          // صادرة
                'partially_paid',  // مدفوعة جزئياً
                'paid',            // مدفوعة
                'overdue',         // متأخرة
                'cancelled',       // ملغاة
            ])->default('draft');

            $table->foreignId('customer_id')
                  ->constrained('customers')
                  ->restrictOnDelete();

            $table->date('issue_date');              // تاريخ الإصدار
            $table->date('due_date')->nullable();    // تاريخ الاستحقاق

            // المبالغ المالية — جميعها DECIMAL(15,2)
            $table->decimal('subtotal', 15, 2)->default(0.00);         // المجموع قبل الخصم والضريبة
            $table->decimal('discount_amount', 15, 2)->default(0.00);  // مبلغ الخصم الإجمالي
            $table->decimal('tax_amount', 15, 2)->default(0.00);       // مبلغ الضريبة الإجمالي
            $table->decimal('total_amount', 15, 2)->default(0.00);     // الإجمالي النهائي
            $table->decimal('paid_amount', 15, 2)->default(0.00);      // المدفوع (يُحدَّث من PaymentService)
            $table->decimal('remaining_amount', 15, 2)->default(0.00); // المتبقي (يُحدَّث من PaymentService)

            $table->enum('payment_method', [
                'cash',     // نقدي
                'bank',     // تحويل بنكي
                'card',     // شبكة
                'other',    // أخرى
            ])->nullable();

            $table->text('notes')->nullable();
            $table->boolean('is_tax_inclusive')->default(false); // هل الضريبة مضمّنة في السعر؟
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();

            // بيانات QR (تُملأ عند الإصدار — جاهزة للتكامل مع ZATCA مستقبلاً)
            $table->text('qr_data')->nullable();

            $table->timestamps();
            $table->softDeletes();

            $table->index('issue_date');
            $table->index('due_date');
            $table->index('status');
            $table->index('customer_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('invoices');
    }
};
