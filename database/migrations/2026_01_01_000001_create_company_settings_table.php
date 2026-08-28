<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('company_settings', function (Blueprint $table) {
            $table->id();
            $table->string('name');                            // اسم المنشأة
            $table->string('logo_path')->nullable();           // مسار الشعار
            $table->string('commercial_register')->nullable(); // السجل التجاري
            $table->string('tax_number')->nullable();          // الرقم الضريبي
            $table->string('phone')->nullable();               // رقم الجوال
            $table->string('email')->nullable();               // البريد الإلكتروني
            $table->text('address')->nullable();               // العنوان
            $table->string('city')->nullable();                // المدينة
            $table->string('region')->nullable();              // المنطقة
            $table->string('postal_code')->nullable();         // الرمز البريدي
            $table->string('additional_number')->nullable();   // الرقم الإضافي
            $table->string('currency', 10)->default('SAR');    // العملة
            $table->string('currency_symbol', 10)->default('ر.س'); // رمز العملة
            $table->decimal('default_tax_rate', 5, 2)->default(15.00); // نسبة الضريبة الافتراضية
            $table->text('invoice_notes')->nullable();         // ملاحظات الفاتورة الافتراضية
            $table->string('invoice_prefix', 10)->default('INV'); // بادئة رقم الفاتورة
            $table->string('purchase_prefix', 10)->default('PUR'); // بادئة رقم الشراء
            $table->string('receipt_prefix', 10)->default('RCV');  // بادئة رقم السند
            $table->unsignedInteger('invoice_counter')->default(0); // عداد الفواتير
            $table->unsignedInteger('purchase_counter')->default(0);// عداد المشتريات
            $table->unsignedInteger('receipt_counter')->default(0); // عداد السندات
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('company_settings');
    }
};
