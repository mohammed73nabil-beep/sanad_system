<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('customers', function (Blueprint $table) {
            $table->id();
            $table->string('name');                          // اسم العميل/المحل
            $table->enum('type', ['individual', 'business'])->default('business'); // نوع العميل
            $table->string('phone')->nullable();             // رقم الجوال
            $table->string('email')->nullable();             // البريد الإلكتروني
            $table->text('address')->nullable();             // العنوان
            $table->string('city')->nullable();              // المدينة
            $table->string('tax_number')->nullable();        // الرقم الضريبي
            $table->string('commercial_register')->nullable(); // السجل التجاري
            $table->text('notes')->nullable();               // ملاحظات

            // إحصائيات مجمّعة (تُحسب عبر العلاقات، محفوظة هنا لأداء أفضل)
            $table->decimal('total_sales', 15, 2)->default(0.00);     // إجمالي المبيعات
            $table->decimal('total_paid', 15, 2)->default(0.00);      // المدفوع
            $table->decimal('total_remaining', 15, 2)->default(0.00); // المتبقي

            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();

            $table->index('phone');
            $table->index('tax_number');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('customers');
    }
};
