<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        /**
         * جدول سجل العمليات (Audit Log)
         *
         * يُسجَّل فيه كل حدث مهم في النظام.
         * البنية قابلة للتوسع لإضافة مستخدمين مستقبلاً.
         */
        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('action');                // create, update, delete, login...
            $table->string('model_type')->nullable(); // App\Models\Invoice
            $table->unsignedBigInteger('model_id')->nullable();
            $table->string('description');            // وصف العملية بالعربية
            $table->json('old_values')->nullable();   // القيم القديمة
            $table->json('new_values')->nullable();   // القيم الجديدة
            $table->string('ip_address', 45)->nullable();
            $table->string('user_agent')->nullable();
            $table->timestamp('created_at')->useCurrent();

            $table->index('user_id');
            $table->index(['model_type', 'model_id']);
            $table->index('action');
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('audit_logs');
    }
};
