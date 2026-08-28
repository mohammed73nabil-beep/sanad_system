<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\Category;
use App\Models\Product;
use App\Models\Unit;
use App\Services\TaxService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    protected TaxService $taxService;

    public function __construct(TaxService $taxService)
    {
        $this->taxService = $taxService;
    }

    public function index(Request $request): Response
    {
        $search = $request->input('search');
        $categoryId = $request->input('category_id');
        $stockFilter = $request->input('stock_status');

        $query = Product::with(['category', 'unit']);

        if ($search) {
            $query->search($search);
        }

        if ($categoryId) {
            $query->where('category_id', $categoryId);
        }

        if ($stockFilter === 'low') {
            $query->lowStock();
        } elseif ($stockFilter === 'empty') {
            $query->outOfStock();
        }

        $products = $query->orderBy('name')->paginate(20)->withQueryString();

        return Inertia::render('Products/Index', [
            'products'   => $products,
            'categories' => Category::active()->orderBy('name')->get(),
            'units'      => Unit::active()->orderBy('name')->get(),
            'filters'    => [
                'search'       => $search,
                'category_id'  => $categoryId,
                'stock_status' => $stockFilter,
            ],
            'default_tax_rate' => $this->taxService->getDefaultTaxRate(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'            => 'required|string|max:255',
            'sku'             => 'required|string|max:100|unique:products,sku',
            'barcode'         => 'nullable|string|max:100',
            'category_id'     => 'nullable|exists:categories,id',
            'unit_id'         => 'nullable|exists:units,id',
            'purchase_price'  => 'required|numeric|min:0',
            'sale_price'      => 'required|numeric|min:0',
            'tax_rate'        => 'nullable|numeric|min:0|max:100',
            'stock_quantity'  => 'nullable|numeric|min:0',
            'min_stock_level' => 'nullable|numeric|min:0',
            'description'     => 'nullable|string',
            'status'          => 'required|in:active,inactive',
        ], [
            'name.required'           => 'يرجى إدخال اسم المنتج.',
            'sku.required'            => 'يرجى إدخال رمز المنتج (SKU).',
            'sku.unique'              => 'رمز المنتج (SKU) مستخدم مسبقاً.',
            'purchase_price.required' => 'يرجى إدخال سعر الشراء.',
            'sale_price.required'     => 'يرجى إدخال سعر البيع.',
        ]);

        if (!isset($validated['tax_rate'])) {
            $validated['tax_rate'] = $this->taxService->getDefaultTaxRate();
        }

        $product = Product::create($validated);
        AuditLog::record('create', "تمت إضافة المنتج الجديد: {$product->name} (SKU: {$product->sku})", $product);

        return redirect()->back()->with('success', 'تمت إضافة المنتج بنجاح.');
    }

    public function update(Request $request, Product $product)
    {
        $validated = $request->validate([
            'name'            => 'required|string|max:255',
            'sku'             => 'required|string|max:100|unique:products,sku,' . $product->id,
            'barcode'         => 'nullable|string|max:100',
            'category_id'     => 'nullable|exists:categories,id',
            'unit_id'         => 'nullable|exists:units,id',
            'purchase_price'  => 'required|numeric|min:0',
            'sale_price'      => 'required|numeric|min:0',
            'tax_rate'        => 'nullable|numeric|min:0|max:100',
            'min_stock_level' => 'nullable|numeric|min:0',
            'description'     => 'nullable|string',
            'status'          => 'required|in:active,inactive',
        ], [
            'name.required' => 'يرجى إدخال اسم المنتج.',
            'sku.unique'    => 'رمز المنتج (SKU) مستخدم مسبقاً.',
        ]);

        $product->update($validated);
        AuditLog::record('update', "تم تحديث بيانات المنتج: {$product->name}", $product);

        return redirect()->back()->with('success', 'تم تحديث بيانات المنتج بنجاح.');
    }

    public function destroy(Product $product)
    {
        if ($product->invoiceItems()->exists() || $product->purchaseItems()->exists()) {
            return redirect()->back()->with('error', 'لا يمكن حذف المنتج لأنه مرتبط بحركات مبيعات أو مشتريات سابقة. يمكنك تعطيل حالته بدلاً من ذلك.');
        }

        $product->delete();
        AuditLog::record('delete', "تم حذف المنتج: {$product->name}", $product);

        return redirect()->back()->with('success', 'تم حذف المنتج بنجاح.');
    }

    /**
     * Fast search endpoint for invoice/purchase form autocomplete
     */
    public function search(Request $request)
    {
        $term = $request->input('q');
        if (!$term) {
            return response()->json([]);
        }

        $products = Product::active()
            ->with(['unit', 'category'])
            ->where(function ($q) use ($term) {
                $q->where('name', 'like', "%{$term}%")
                  ->orWhere('sku', 'like', "%{$term}%")
                  ->orWhere('barcode', 'like', "%{$term}%");
            })
            ->limit(20)
            ->get();

        return response()->json($products);
    }
}
