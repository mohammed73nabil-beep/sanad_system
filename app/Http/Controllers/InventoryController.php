<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\InventoryMovement;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class InventoryController extends Controller
{
    public function index(Request $request): Response
    {
        $search = $request->input('search');
        $categoryId = $request->input('category_id');
        $status = $request->input('status');

        $query = Product::with(['category', 'unit']);

        if ($search) {
            $query->search($search);
        }

        if ($categoryId) {
            $query->where('category_id', $categoryId);
        }

        if ($status === 'low') {
            $query->lowStock();
        } elseif ($status === 'empty') {
            $query->outOfStock();
        }

        $products = $query->orderBy('name')->paginate(20)->withQueryString();

        $totalItems = Product::count();
        $totalValuation = (float) Product::select(DB::raw('SUM(stock_quantity * purchase_price) as val'))->value('val');
        $lowStockCount = Product::lowStock()->count();
        $outOfStockCount = Product::outOfStock()->count();

        return Inertia::render('Inventory/Index', [
            'products'   => $products,
            'categories' => Category::active()->orderBy('name')->get(),
            'filters'    => [
                'search'      => $search,
                'category_id' => $categoryId,
                'status'      => $status,
            ],
            'summary' => [
                'total_items'       => $totalItems,
                'total_valuation'   => round($totalValuation, 2),
                'low_stock_count'   => $lowStockCount,
                'out_of_stock_count'=> $outOfStockCount,
            ]
        ]);
    }

    public function movements(Request $request): Response
    {
        $productId = $request->input('product_id');
        $type = $request->input('type');
        $fromDate = $request->input('from_date');
        $toDate = $request->input('to_date');

        $query = InventoryMovement::with(['product.unit', 'creator']);

        if ($productId) {
            $query->where('product_id', $productId);
        }

        if ($type) {
            $query->where('type', $type);
        }

        if ($fromDate) {
            $query->whereDate('created_at', '>=', $fromDate);
        }

        if ($toDate) {
            $query->whereDate('created_at', '<=', $toDate);
        }

        $movements = $query->orderBy('created_at', 'desc')->paginate(25)->withQueryString();

        return Inertia::render('Inventory/Movements', [
            'movements' => $movements,
            'products'  => Product::orderBy('name')->get(['id', 'name', 'sku']),
            'filters'   => [
                'product_id' => $productId,
                'type'       => $type,
                'from_date'  => $fromDate,
                'to_date'    => $toDate,
            ],
        ]);
    }
}
