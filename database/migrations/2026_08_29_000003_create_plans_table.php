<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('plans', function (Blueprint $table) {
            $table->id();
            $table->string('name');                               // اسم الباقة
            $table->text('description')->nullable();              // وصف الباقة
            $table->decimal('price', 10, 2)->default(0);         // السعر
            $table->unsignedInteger('duration_days')->default(30);// المدة بالأيام
            $table->unsignedInteger('invoice_limit')->default(100);// حد الفواتير
            $table->boolean('is_active')->default(true);          // هل الباقة نشطة
            $table->json('features')->nullable();                  // مميزات إضافية مستقبلاً
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('plans');
    }
};
