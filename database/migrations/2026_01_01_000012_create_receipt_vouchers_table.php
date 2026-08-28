<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('receipt_vouchers', function (Blueprint $table) {
            $table->id();
            $table->string('voucher_number', 20)->unique(); // رقم السند RCV-000001
            $table->foreignId('customer_id')
                  ->constrained('customers')
                  ->restrictOnDelete();
            $table->foreignId('invoice_id')
                  ->nullable()
                  ->constrained('invoices')
                  ->nullOnDelete();
            $table->foreignId('payment_id')
                  ->nullable()
                  ->constrained('payments')
                  ->nullOnDelete();

            $table->decimal('amount', 15, 2);    // المبلغ المستلم

            $table->enum('payment_method', [
                'cash',   // نقدي
                'bank',   // تحويل بنكي
                'card',   // شبكة
                'other',  // أخرى
            ])->default('cash');

            $table->date('voucher_date');          // تاريخ السند
            $table->string('amount_in_words')->nullable(); // المبلغ كتابةً
            $table->string('reference')->nullable();       // رقم المرجع
            $table->text('description')->nullable();       // الوصف/الملاحظات
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();

            $table->index('customer_id');
            $table->index('voucher_date');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('receipt_vouchers');
    }
};
