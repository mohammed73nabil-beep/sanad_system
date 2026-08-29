<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Migration: إضافة user_id إلى جميع جداول البيانات التشغيلية
 * لدعم multi-tenant بعزل بيانات تام بين المستخدمين.
 *
 * القاعدة: كل صف من البيانات يُنسب للـ owner (صاحب المنشأة).
 * الـ admin/staff لا يملكون صفوفاً بأنفسهم — يرثون بيانات الـ owner.
 */
return new class extends Migration
{
    public function up(): void
    {
        // نجد أول مستخدم من نوع owner أو أول مستخدم نشط لتعيين البيانات الحالية له
        $firstOwner = DB::table('users')
            ->whereIn('role', ['owner', 'admin'])
            ->where('is_active', true)
            ->orderBy('id')
            ->value('id');

        // إذا لم يوجد owner، نأخذ أول مستخدم غير super_admin
        if (!$firstOwner) {
            $firstOwner = DB::table('users')
                ->where('role', '!=', 'super_admin')
                ->orderBy('id')
                ->value('id');
        }

        // fallback: أول مستخدم
        if (!$firstOwner) {
            $firstOwner = DB::table('users')->orderBy('id')->value('id');
        }

        $tables = [
            'customers'            => true,
            'suppliers'            => true,
            'categories'           => true,
            'units'                => true,
            'products'             => true,
            'purchases'            => true,
            'receipt_vouchers'     => true,
            'inventory_movements'  => true,
        ];

        foreach ($tables as $table => $addIndex) {
            if (!Schema::hasColumn($table, 'user_id')) {
                Schema::table($table, function (Blueprint $t) use ($table) {
                    $t->foreignId('user_id')
                      ->nullable()
                      ->after('id')
                      ->constrained('users')
                      ->nullOnDelete();

                    $t->index('user_id', "idx_{$table}_user_id");
                });

                // تعيين البيانات الحالية للمستخدم الأول
                if ($firstOwner) {
                    DB::table($table)->whereNull('user_id')->update(['user_id' => $firstOwner]);
                }
            }
        }

        // للفواتير: نستخدم created_by كـ tenant key — لا نضيف عمود جديد
        // لكن نتأكد أن البيانات القديمة مُعيَّنة
        if ($firstOwner) {
            DB::table('invoices')->whereNull('created_by')->update(['created_by' => $firstOwner]);
        }
    }

    public function down(): void
    {
        $tables = [
            'customers',
            'suppliers',
            'categories',
            'units',
            'products',
            'purchases',
            'receipt_vouchers',
            'inventory_movements',
        ];

        foreach ($tables as $table) {
            if (Schema::hasColumn($table, 'user_id')) {
                Schema::table($table, function (Blueprint $t) use ($table) {
                    $t->dropForeign(['user_id']);
                    $t->dropIndex("idx_{$table}_user_id");
                    $t->dropColumn('user_id');
                });
            }
        }
    }
};
