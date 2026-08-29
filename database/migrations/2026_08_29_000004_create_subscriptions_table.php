<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('subscriptions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('plan_id')->nullable()->constrained('plans')->nullOnDelete();
            $table->date('start_date');
            $table->date('end_date');
            $table->enum('status', ['trial', 'active', 'expired', 'suspended', 'cancelled'])
                  ->default('active');
            $table->unsignedInteger('invoice_limit')->default(100); // حد الفواتير (يُرث من الباقة وقابل للتخصيص)
            $table->unsignedInteger('invoices_used')->default(0);    // عداد الأداء (ليس مصدر الحقيقة)
            $table->decimal('price', 10, 2)->default(0);             // السعر الفعلي عند الإنشاء
            $table->enum('payment_status', ['paid', 'unpaid', 'refunded'])->default('unpaid');
            $table->text('notes')->nullable();
            $table->timestamp('activated_at')->nullable();           // تاريخ التفعيل
            $table->foreignId('created_by')
                  ->nullable()
                  ->constrained('users')
                  ->nullOnDelete();
            $table->timestamps();

            $table->index('user_id');
            $table->index('status');
            $table->index('end_date');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('subscriptions');
    }
};
