<?php

namespace App\Http\Controllers;

use App\Models\CompanySetting;
use App\Models\Product;
use App\Models\Purchase;
use App\Models\Supplier;
use App\Services\PurchaseService;
use App\Services\TaxService;
use Exception;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PurchaseController extends Controller
{
    protected PurchaseService $purchaseService;
    protected TaxService $taxService;

    public function __construct(PurchaseService $purchaseService, TaxService $taxService)
    {
        $this->purchaseService = $purchaseService;
        $this->taxService = $taxService;
    }

    public function index(Request $request): Response
    {
        $search = $request->input('search');
        $supplierId = $request->input('supplier_id');
        $fromDate = $request->input('from_date');
        $toDate = $request->input('to_date');

        $query = Purchase::with(['supplier', 'items']);

        if ($search) {
            $query->search($search);
        }

        if ($supplierId) {
            $query->where('supplier_id', $supplierId);
        }

        if ($fromDate) {
            $query->whereDate('purchase_date', '>=', $fromDate);
        }

        if ($toDate) {
            $query->whereDate('purchase_date', '<=', $toDate);
        }

        $purchases = $query->orderBy('purchase_date', 'desc')->paginate(15)->withQueryString();

        return Inertia::render('Purchases/Index', [
            'purchases' => $purchases,
            'suppliers' => Supplier::active()->orderBy('name')->get(),
            'filters'   => [
                'search'      => $search,
                'supplier_id' => $supplierId,
                'from_date'   => $fromDate,
                'to_date'     => $toDate,
            ],
            'summary' => [
                'total_purchases' => (float) Purchase::where('status', 'confirmed')->sum('total_amount'),
                'total_paid'      => (float) Purchase::where('status', 'confirmed')->sum('paid_amount'),
                'total_due'       => (float) Purchase::where('status', 'confirmed')->sum('remaining_amount'),
            ]
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Purchases/Create', [
            'suppliers'        => Supplier::active()->orderBy('name')->get(),
            'products'         => Product::active()->with('unit')->orderBy('name')->get(),
            'default_tax_rate' => $this->taxService->getDefaultTaxRate(),
            'company'          => CompanySetting::getOrCreate(),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'supplier_id'                 => 'required|exists:suppliers,id',
            'purchase_date'               => 'required|date',
            'due_date'                    => 'nullable|date|after_or_equal:purchase_date',
            'supplier_invoice_number'     => 'nullable|string|max:100',
            'paid_amount'                 => 'nullable|numeric|min:0',
            'attachment'                  => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:10240', // 10MB max
            'notes'                       => 'nullable|string',
            'items'                       => 'required|array|min:1',
            'items.*.product_id'          => 'nullable',
            'items.*.name'                => 'nullable|string|max:255',
            'items.*.quantity'            => 'required|numeric|min:0.01',
            'items.*.unit_price'          => 'required|numeric|min:0',
            'items.*.discount_percent'    => 'nullable|numeric|min:0|max:100',
            'items.*.tax_rate'            => 'nullable|numeric|min:0|max:100',
        ], [
            'supplier_id.required'        => 'يرجى اختيار المورد.',
            'purchase_date.required'      => 'يرجى تحديد تاريخ الشراء.',
            'items.required'              => 'يجب إضافة منتج واحد على الأقل.',
            'items.min'                   => 'يجب إضافة منتج واحد على الأقل.',
            'items.*.quantity.min'        => 'الكمية يجب أن تكون أكبر من صفر.',
            'items.*.unit_price.required' => 'يرجى تحديد سعر الشراء للوحدة.',
        ]);

        $attachmentPath = null;
        if ($request->hasFile('attachment')) {
            $attachmentPath = $request->file('attachment')->store('purchases/attachments', 'public');
        }

        try {
            $data = $request->only([
                'supplier_id', 'purchase_date', 'due_date',
                'supplier_invoice_number', 'paid_amount', 'notes'
            ]);
            $data['attachment_path'] = $attachmentPath;

            $purchase = $this->purchaseService->createPurchase(
                $data,
                $request->input('items', []),
                true // Auto confirm & increase inventory
            );

            return redirect()->route('purchases.show', $purchase->id)->with('success', 'تم حفظ فاتورة الشراء وتحديث المخزون تلقائياً بنجاح.');
        } catch (Exception $e) {
            return redirect()->back()->withInput()->with('error', $e->getMessage());
        }
    }

    public function show(Purchase $purchase): Response
    {
        $purchase->load(['supplier', 'items.product.unit', 'creator']);

        return Inertia::render('Purchases/Show', [
            'purchase' => $purchase,
            'company'  => CompanySetting::getOrCreate(),
        ]);
    }

    public function confirm(Purchase $purchase)
    {
        try {
            $this->purchaseService->confirmPurchase($purchase);
            return redirect()->back()->with('success', 'تم اعتماد فاتورة الشراء وتحديث المخزون بنجاح.');
        } catch (Exception $e) {
            return redirect()->back()->with('error', $e->getMessage());
        }
    }
}
