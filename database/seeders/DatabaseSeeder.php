<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\CompanySetting;
use App\Models\Customer;
use App\Models\Invoice;
use App\Models\InvoiceItem;
use App\Models\Payment;
use App\Models\Product;
use App\Models\Purchase;
use App\Models\PurchaseItem;
use App\Models\ReceiptVoucher;
use App\Models\Supplier;
use App\Models\Unit;
use App\Models\User;
use App\Services\InvoiceService;
use App\Services\PurchaseService;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database with complete realistic operational data.
     */
    public function run(): void
    {
        // 0. Create Super Admin User (مالك النظام)
        $superAdmin = User::firstOrCreate(
            ['email' => 'superadmin@sanad.sa'],
            [
                'name'      => 'مالك النظام (Super Admin)',
                'password'  => Hash::make('password'),
                'role'      => 'super_admin',
                'is_active' => true,
            ]
        );

        // 1. Create Default Plans (الباقات)
        $basicPlan = \App\Models\Plan::firstOrCreate(['name' => 'الباقة الأساسية'], [
            'description'   => 'مناسبة للمنشآت والمحلات الصغيرة لتجربة النظام وإصدار الفواتير',
            'price'         => 49.00,
            'duration_days' => 30,
            'invoice_limit' => 100,
            'is_active'     => true,
        ]);

        $advancedPlan = \App\Models\Plan::firstOrCreate(['name' => 'الباقة المتقدمة'], [
            'description'   => 'للمنشآت المتوسطة ذات حركة المبيعات النشطة والتقارير المتقدمة',
            'price'         => 79.00,
            'duration_days' => 30,
            'invoice_limit' => 300,
            'is_active'     => true,
        ]);

        $enterprisePlan = \App\Models\Plan::firstOrCreate(['name' => 'باقة الشركات'], [
            'description'   => 'حجم فواتير غير محدود ودعم فني على مدار الساعة',
            'price'         => 149.00,
            'duration_days' => 30,
            'invoice_limit' => 1000,
            'is_active'     => true,
        ]);

        // 2. Create Owner/Admin User (العميل)
        $user = User::firstOrCreate(
            ['email' => 'admin@sanad.sa'],
            [
                'name'      => 'مؤسسة سَنَد للتجارة',
                'phone'     => '0555123456',
                'password'  => Hash::make('password'),
                'role'      => 'owner',
                'is_active' => true,
            ]
        );

        // إنشاء اشتراك نشط للعميل
        if ($user->subscriptions()->count() === 0) {
            \App\Models\Subscription::create([
                'user_id'        => $user->id,
                'plan_id'        => $basicPlan->id,
                'start_date'     => now()->subDays(5)->toDateString(),
                'end_date'       => now()->addDays(25)->toDateString(),
                'status'         => 'active',
                'invoice_limit'  => 100,
                'invoices_used'  => 2,
                'price'          => 49.00,
                'payment_status' => 'paid',
                'activated_at'   => now()->subDays(5),
                'notes'          => 'اشتراك تجريبي نشط',
            ]);
        }

        auth()->login($user);

        // 3. Company Settings
        CompanySetting::firstOrCreate([], [
            'user_id'             => $user->id,
            'name'                => 'مؤسسة سَنَد للتجارة العامة',
            'commercial_register' => '1010894523',
            'tax_number'          => '310245897600003',
            'phone'               => '0555123456',
            'email'               => 'info@sanad-trading.sa',
            'address'             => 'طريق الملك فهد، حي الصحافة',
            'city'                => 'الرياض',
            'region'              => 'منطقة الرياض',
            'postal_code'         => '13315',
            'additional_number'   => '4231',
            'currency'            => 'SAR',
            'currency_symbol'     => 'ر.س',
            'default_tax_rate'    => 15.00,
            'invoice_notes'       => 'شكراً لتعاملكم معنا. البضاعة المباعة تستبدل خلال 3 أيام بحالتها الأصلية.',
            'invoice_prefix'      => 'INV',
            'purchase_prefix'     => 'PUR',
            'receipt_prefix'      => 'RCV',
        ]);

        // 3. Units
        $unitPiece = Unit::firstOrCreate(['name' => 'حبة', 'short_name' => 'حبة']);
        $unitBox   = Unit::firstOrCreate(['name' => 'كرتون', 'short_name' => 'كرتون']);
        $unitKg    = Unit::firstOrCreate(['name' => 'كيلوجرام', 'short_name' => 'كجم']);
        $unitMeter = Unit::firstOrCreate(['name' => 'متر', 'short_name' => 'م']);

        // 4. Categories
        $catFood = Category::firstOrCreate(['slug' => 'food'], ['name' => 'مواد غذائية', 'color' => '#16a34a']);
        $catElec = Category::firstOrCreate(['slug' => 'electrical'], ['name' => 'أدوات كهربائية', 'color' => '#0284c7']);
        $catPack = Category::firstOrCreate(['slug' => 'packaging'], ['name' => 'مواد تعبئة وتغليف', 'color' => '#d97706']);

        // 5. Products
        $p1 = Product::firstOrCreate(['sku' => 'PRD-1001'], [
            'name'            => 'زيت زيتون بكر ممتاز 1 لتر',
            'barcode'         => '628100100001',
            'category_id'     => $catFood->id,
            'unit_id'         => $unitPiece->id,
            'purchase_price'  => 28.00,
            'sale_price'      => 38.00,
            'tax_rate'        => 15.00,
            'stock_quantity'  => 120.00,
            'min_stock_level' => 20.00,
            'status'          => 'active',
        ]);

        $p2 = Product::firstOrCreate(['sku' => 'PRD-1002'], [
            'name'            => 'أرز بسمتي فاخر 10 كجم',
            'barcode'         => '628100100002',
            'category_id'     => $catFood->id,
            'unit_id'         => $unitBox->id,
            'purchase_price'  => 65.00,
            'sale_price'      => 85.00,
            'tax_rate'        => 15.00,
            'stock_quantity'  => 50.00,
            'min_stock_level' => 15.00,
            'status'          => 'active',
        ]);

        $p3 = Product::firstOrCreate(['sku' => 'PRD-1003'], [
            'name'            => 'توصيلة كهربائية 5 مخارج 3 متر',
            'barcode'         => '628100100003',
            'category_id'     => $catElec->id,
            'unit_id'         => $unitPiece->id,
            'purchase_price'  => 35.00,
            'sale_price'      => 55.00,
            'tax_rate'        => 15.00,
            'stock_quantity'  => 8.00, // Low stock on purpose
            'min_stock_level' => 10.00,
            'status'          => 'active',
        ]);

        $p4 = Product::firstOrCreate(['sku' => 'PRD-1004'], [
            'name'            => 'كرتون شحن مقوى مقاس 40x30x20',
            'barcode'         => '628100100004',
            'category_id'     => $catPack->id,
            'unit_id'         => $unitPiece->id,
            'purchase_price'  => 3.20,
            'sale_price'      => 5.50,
            'tax_rate'        => 15.00,
            'stock_quantity'  => 400.00,
            'min_stock_level' => 50.00,
            'status'          => 'active',
        ]);

        // 6. Customers
        $c1 = Customer::firstOrCreate(['name' => 'تموينات الأمل المركزية'], [
            'type'                => 'business',
            'phone'               => '0551112233',
            'city'                => 'الرياض',
            'address'             => 'حي النرجس',
            'tax_number'          => '300112233400003',
            'commercial_register' => '1010554433',
            'total_sales'         => 0,
            'total_paid'          => 0,
            'total_remaining'     => 0,
        ]);

        $c2 = Customer::firstOrCreate(['name' => 'مؤسسة أفق التقنية للتجارة'], [
            'type'                => 'business',
            'phone'               => '0559998877',
            'city'                => 'الرياض',
            'address'             => 'حي الياسمين',
            'tax_number'          => '300998877600003',
            'total_sales'         => 0,
            'total_paid'          => 0,
            'total_remaining'     => 0,
        ]);

        $c3 = Customer::firstOrCreate(['name' => 'عبدالله صالح الشمري'], [
            'type'                => 'individual',
            'phone'               => '0507776655',
            'city'                => 'الخرج',
            'total_sales'         => 0,
            'total_paid'          => 0,
            'total_remaining'     => 0,
        ]);

        // 7. Suppliers
        $s1 = Supplier::firstOrCreate(['name' => 'شركة الخليج للتوريدات الغذائية'], [
            'phone'               => '0112345678',
            'city'                => 'الرياض',
            'tax_number'          => '300445566700003',
            'commercial_register' => '1010332211',
            'total_purchases'     => 0,
            'total_paid'          => 0,
            'total_remaining'     => 0,
        ]);

        $s2 = Supplier::firstOrCreate(['name' => 'مصنع الرياض للتغليف'], [
            'phone'               => '0118765432',
            'city'                => 'الرياض',
            'tax_number'          => '300887766500003',
            'total_purchases'     => 0,
            'total_paid'          => 0,
            'total_remaining'     => 0,
        ]);

        // 8. Seed a sample purchase using PurchaseService
        $purchaseService = app(PurchaseService::class);
        if (Purchase::count() === 0) {
            $purchaseService->createPurchase([
                'supplier_id'             => $s1->id,
                'purchase_date'           => now()->subDays(5)->toDateString(),
                'supplier_invoice_number' => 'SUP-99120',
                'paid_amount'             => 2000.00,
                'notes'                   => 'شحنة بداية الشهر',
            ], [
                [
                    'product_id'       => $p1->id,
                    'quantity'         => 50,
                    'unit_price'       => 28.00,
                    'discount_percent' => 0,
                    'tax_rate'         => 15.00,
                ],
                [
                    'product_id'       => $p2->id,
                    'quantity'         => 30,
                    'unit_price'       => 65.00,
                    'discount_percent' => 5,
                    'tax_rate'         => 15.00,
                ],
            ], true);
        }

        // 9. Seed sample sales invoices using InvoiceService
        $invoiceService = app(InvoiceService::class);
        if (Invoice::count() === 0) {
            // Invoice 1: Fully Paid
            $invoiceService->createInvoice([
                'customer_id'    => $c1->id,
                'issue_date'     => now()->subDays(2)->toDateString(),
                'payment_method' => 'card',
                'notes'          => 'تسليم فوري للمحل',
            ], [
                [
                    'product_id'       => $p1->id,
                    'quantity'         => 10,
                    'unit_price'       => 38.00,
                    'discount_percent' => 0,
                    'tax_rate'         => 15.00,
                ],
                [
                    'product_id'       => $p2->id,
                    'quantity'         => 5,
                    'unit_price'       => 85.00,
                    'discount_percent' => 0,
                    'tax_rate'         => 15.00,
                ],
            ], [
                'amount'                 => 925.75,
                'payment_method'         => 'card',
                'create_receipt_voucher' => true,
            ]);

            // Invoice 2: Partially Paid with remaining debt
            $invoiceService->createInvoice([
                'customer_id'    => $c2->id,
                'issue_date'     => now()->toDateString(),
                'due_date'       => now()->addDays(15)->toDateString(),
                'payment_method' => 'bank',
                'notes'          => 'دفعة أولى مع اتفاق سداد الباقي بعد أسبوعين',
            ], [
                [
                    'product_id'       => $p3->id,
                    'quantity'         => 4,
                    'unit_price'       => 55.00,
                    'discount_percent' => 0,
                    'tax_rate'         => 15.00,
                ],
                [
                    'product_id'       => $p4->id,
                    'quantity'         => 100,
                    'unit_price'       => 5.50,
                    'discount_percent' => 10,
                    'tax_rate'         => 15.00,
                ],
            ], [
                'amount'                 => 400.00,
                'payment_method'         => 'bank',
                'create_receipt_voucher' => true,
            ]);
        }
    }
}
