<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('attachments', function (Blueprint $table) {
            $table->id();

            // Polymorphic: مرفقات للفواتير أو المشتريات أو السندات
            $table->string('attachable_type');
            $table->unsignedBigInteger('attachable_id');

            $table->string('file_name');             // اسم الملف الأصلي
            $table->string('file_path');             // مسار الملف في Storage
            $table->string('file_type', 50);         // نوع الملف (image/pdf/...)
            $table->unsignedBigInteger('file_size'); // حجم الملف بالـ bytes
            $table->string('disk', 20)->default('local'); // القرص (local/s3)
            $table->foreignId('uploaded_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['attachable_type', 'attachable_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('attachments');
    }
};
