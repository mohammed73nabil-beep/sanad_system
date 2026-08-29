<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\Invoice;
use App\Models\Payment;
use App\Models\Product;
use App\Models\Purchase;
use App\Models\ReceiptVoucher;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(\Illuminate\Http\Request $request): Response|\Illuminate\Http\RedirectResponse
    {
        if ($request->user() && $request->user()->isSuperAdmin()) {
            return redirect()->route('admin.dashboard');
        }

        $today = Carbon::today();
        $startOfMonth = Carbon::now()->startOfMonth();
        $endOfMonth = Carbon::now()->endOfMonth();

        // 1. Core KPIs
        $todaySales = (float) Invoice::where('status', '!=', Invoice::STATUS_CANCELLED)
            ->where('status', '!=', Invoice::STATUS_DRAFT)
            ->whereDate('issue_date', $today)
            ->sum('total_amount');

        $monthSales = (float) Invoice::where('status', '!=', Invoice::STATUS_CANCELLED)
            ->where('status', '!=', Invoice::STATUS_DRAFT)
            ->whereBetween('issue_date', [$startOfMonth, $endOfMonth])
            ->sum('total_amount');

        $monthPurchases = (float) Purchase::where('status', 'confirmed')
            ->whereBetween('purchase_date', [$startOfMonth, $endOfMonth])
            ->sum('total_amount');

        $totalCollected = (float) Payment::whereHas('invoice', fn ($q) => $q->whereNotIn('status', [Invoice::STATUS_CANCELLED, Invoice::STATUS_DRAFT]))
            ->whereBetween('payment_date', [$startOfMonth, $endOfMonth])
            ->sum('amount');

        $totalRemaining = (float) Customer::sum('total_remaining');

        $totalInvoicesCount = Invoice::whereNotIn('status', [Invoice::STATUS_CANCELLED, Invoice::STATUS_DRAFT])->count();

        $inventoryValue = (float) Product::select(DB::raw('SUM(stock_quantity * purchase_price) as total_val'))->value('total_val');

        // Estimated Gross Profit (Month Sales - Month Cost of Goods Sold)
        $monthCogs = (float) DB::table('invoice_items')
            ->join('invoices', 'invoice_items.invoice_id', '=', 'invoices.id')
            ->join('products', 'invoice_items.product_id', '=', 'products.id')
            ->whereNotIn('invoices.status', [Invoice::STATUS_CANCELLED, Invoice::STATUS_DRAFT])
            ->whereBetween('invoices.issue_date', [$startOfMonth, $endOfMonth])
            ->select(DB::raw('SUM(invoice_items.quantity * products.purchase_price) as cogs'))
            ->value('cogs');

        $estimatedProfit = round(max(0, $monthSales - $monthCogs), 2);

        // 2. Sales Trend: Last 7 Days
        $last7Days = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = Carbon::today()->subDays($i);
            $dayName = $date->translatedFormat('l');
            $dateStr = $date->toDateString();

            $dayAmount = (float) Invoice::whereNotIn('status', [Invoice::STATUS_CANCELLED, Invoice::STATUS_DRAFT])
                ->whereDate('issue_date', $dateStr)
                ->sum('total_amount');

            $last7Days[] = [
                'date'   => $date->format('m/d'),
                'day'    => $dayName,
                'amount' => $dayAmount,
            ];
        }

        // 3. Recent Invoices
        $recentInvoices = Invoice::with('customer')
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get();

        // 4. Recent Purchases
        $recentPurchases = Purchase::with('supplier')
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get();

        // 5. Customers with highest debt
        $debtCustomers = Customer::where('total_remaining', '>', 0)
            ->orderBy('total_remaining', 'desc')
            ->take(5)
            ->get();

        // 6. Low stock products
        $lowStockProducts = Product::whereColumn('stock_quantity', '<=', 'min_stock_level')
            ->with('unit')
            ->orderBy('stock_quantity', 'asc')
            ->take(5)
            ->get();

        // 7. Recent Receipt Vouchers
        $recentVouchers = ReceiptVoucher::with('customer')
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get();

        return Inertia::render('Dashboard/Index', [
            'metrics' => [
                'today_sales'          => $todaySales,
                'month_sales'          => $monthSales,
                'month_purchases'      => $monthPurchases,
                'total_collected'      => $totalCollected,
                'total_remaining'      => $totalRemaining,
                'total_invoices_count' => $totalInvoicesCount,
                'inventory_value'      => round($inventoryValue, 2),
                'estimated_profit'     => $estimatedProfit,
            ],
            'charts' => [
                'last_7_days' => $last7Days,
            ],
            'recent_invoices'    => $recentInvoices,
            'recent_purchases'   => $recentPurchases,
            'debt_customers'     => $debtCustomers,
            'low_stock_products' => $lowStockProducts,
            'recent_vouchers'    => $recentVouchers,
        ]);
    }
}
