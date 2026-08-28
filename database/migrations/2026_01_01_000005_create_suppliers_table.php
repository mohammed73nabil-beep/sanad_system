<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('suppliers', function (Blueprint $table) {
            $table->id();
            $table->string('name');                          // اسم المورد
            $table->string('phone')->nullable();             // رقم الجوال
            $table->string('email')->nullable();             // البريد الإلكتروني
            $table->string('tax_number')->nullable();        // الرقم الضريبي
            $table->string('commercial_register')->nullable(); // السجل التجاري
            $table->text('address')->nullable();             // العنوان
            $table->string('city')->nullable();              // المدينة
            $table->text('notes')->nullable();               // ملاحظات

            // إحصائيات مجمّعة
            $table->decimal('total_purchases', 15, 2)->default(0.00);  // إجمالي المشتريات
            $table->decimal('total_paid', 15, 2)->default(0.00);       // المدفوع
            $table->decimal('total_remaining', 15, 2)->default(0.00);  // المتبقي

            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();

            $table->index('phone');
            $table->index('tax_number');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('suppliers');
    }
};
