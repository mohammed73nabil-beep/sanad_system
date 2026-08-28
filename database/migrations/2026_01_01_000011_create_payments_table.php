<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        /**
         * جدول الدفعات
         *
         * كل دفعة مرتبطة بفاتورة.
         * بعد تسجيل كل دفعة، يقوم PaymentService بإعادة حساب:
         *   - invoice.paid_amount
         *   - invoice.remaining_amount
         *   - invoice.status
         *   - customer.total_paid
         *   - customer.total_remaining
         */
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('invoice_id')
                  ->constrained('invoices')
                  ->cascadeOnDelete();
            $table->foreignId('customer_id')
                  ->constrained('customers')
                  ->restrictOnDelete();

            $table->decimal('amount', 15, 2);    // مبلغ الدفعة

            $table->enum('payment_method', [
                'cash',   // نقدي
                'bank',   // تحويل بنكي
                'card',   // شبكة
                'other',  // أخرى
            ])->default('cash');

            $table->date('payment_date');          // تاريخ الدفع
            $table->string('reference')->nullable(); // رقم المرجع / رقم التحويل
            $table->text('notes')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index('invoice_id');
            $table->index('customer_id');
            $table->index('payment_date');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
