<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // تعديل آمن لـ enum بإضافة super_admin مع الحفاظ على القيم الحالية
        DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('owner','admin','staff','super_admin') NOT NULL DEFAULT 'owner'");
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('owner','admin','staff') NOT NULL DEFAULT 'owner'");
    }
};
