import React, { useState } from 'react';
import { useForm, router, Link } from '@inertiajs/react';
import AppLayout from '@/Components/Layout/AppLayout';
import Modal from '@/Components/UI/Modal';
import {
    FileText,
    ArrowLeft,
    Plus,
    Trash2,
    Search,
    Barcode,
    User,
    Calendar,
    CreditCard,
    CheckCircle2,
    Percent,
    Building2,
    DollarSign,
    PackagePlus,
    UserPlus,
} from 'lucide-react';

export default function InvoicesCreate({ customers, products: initialProducts = [], default_tax_rate = 15, company }) {
    const [selectedCustomer, setSelectedCustomer] = useState('');
    const [productSearchTerm, setProductSearchTerm] = useState('');
    const [paidAmount, setPaidAmount] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('cash');
    const [createReceiptVoucher, setCreateReceiptVoucher] = useState(true);
    const [isQuickCustomerModalOpen, setIsQuickCustomerModalOpen] = useState(false);

    // Items in the invoice - starts with 1 ready row for direct manual typing
    const [items, setItems] = useState([
        {
            product_id: '',
            name: '',
            sku: '',
            barcode: '',
            quantity: 1,
            unit_price: '',
            discount_percent: 0,
            tax_rate: default_tax_rate,
        }
    ]);

    const { data, setData, post, processing, errors } = useForm({
        customer_id: '',
        issue_date: new Date().toISOString().split('T')[0],
        due_date: '',
        payment_method: 'cash',
        notes: '',
        items: [],
        initial_payment: {
            amount: '',
            payment_method: 'cash',
            create_receipt_voucher: true,
        },
    });

    // Quick customer creation state
    const [newCustomerName, setNewCustomerName] = useState('');
    const [newCustomerPhone, setNewCustomerPhone] = useState('');
    const [newCustomerType, setNewCustomerType] = useState('business');
    const [creatingCustomer, setCreatingCustomer] = useState(false);

    // Add empty manual row
    const addNewRow = () => {
        setItems([
            ...items,
            {
                product_id: '',
                name: '',
                sku: '',
                barcode: '',
                quantity: 1,
                unit_price: '',
                discount_percent: 0,
                tax_rate: default_tax_rate,
            }
        ]);
    };

    // When an existing product is selected
    const handleProductSelect = (index, selectedName) => {
        const found = initialProducts.find(
            (p) => p.name === selectedName || p.sku === selectedName || p.barcode === selectedName
        );
        const updated = [...items];
        if (found) {
            updated[index].product_id = found.id;
            updated[index].name = found.name;
            updated[index].sku = found.sku;
            updated[index].barcode = found.barcode || '';
            updated[index].unit_price = Number(found.sale_price || 0);
            updated[index].tax_rate = Number(found.tax_rate ?? default_tax_rate);
        } else {
            updated[index].product_id = '';
            updated[index].name = selectedName;
        }
        setItems(updated);
    };

    // Quick add product from search bar
    const addProductFromSearch = (product) => {
        // If the first row is empty, fill it
        if (items.length === 1 && !items[0].name && !items[0].product_id) {
            setItems([
                {
                    product_id: product.id,
                    name: product.name,
                    sku: product.sku,
                    barcode: product.barcode || '',
                    quantity: 1,
                    unit_price: Number(product.sale_price || 0),
                    discount_percent: 0,
                    tax_rate: Number(product.tax_rate ?? default_tax_rate),
                }
            ]);
        } else {
            setItems([
                ...items,
                {
                    product_id: product.id,
                    name: product.name,
                    sku: product.sku,
                    barcode: product.barcode || '',
                    quantity: 1,
                    unit_price: Number(product.sale_price || 0),
                    discount_percent: 0,
                    tax_rate: Number(product.tax_rate ?? default_tax_rate),
                }
            ]);
        }
        setProductSearchTerm('');
    };

    const updateItem = (index, field, value) => {
        const updated = [...items];
        if (field === 'quantity') {
            if (value === '') {
                updated[index][field] = '';
            } else {
                // منع الفواصل وضمان أرقام صحيحة (1, 2, 3...)
                const cleaned = String(value).replace(/[^0-9]/g, '');
                const intVal = parseInt(cleaned, 10);
                updated[index][field] = isNaN(intVal) ? 1 : Math.max(1, intVal);
            }
        } else {
            updated[index][field] = value;
        }
        setItems(updated);
    };

    const removeItem = (index) => {
        if (items.length === 1) {
            setItems([
                {
                    product_id: '',
                    name: '',
                    sku: '',
                    barcode: '',
                    quantity: 1,
                    unit_price: '',
                    discount_percent: 0,
                    tax_rate: default_tax_rate,
                }
            ]);
            return;
        }
        setItems(items.filter((_, i) => i !== index));
    };

    // Totals calculations
    const calculateTotals = () => {
        let subtotal = 0;
        let totalDiscount = 0;
        let totalTax = 0;
        let grandTotal = 0;

        items.forEach((item) => {
            const qty = Number(item.quantity || 0);
            const price = Number(item.unit_price || 0);
            const discPercent = Number(item.discount_percent || 0);
            const taxRate = Number(item.tax_rate || 0);

            const gross = qty * price;
            const discount = gross * (discPercent / 100);
            const net = gross - discount;
            const tax = net * (taxRate / 100);
            const total = net + tax;

            subtotal += net;
            totalDiscount += discount;
            totalTax += tax;
            grandTotal += total;
        });

        const paid = Number(paidAmount || 0);
        const remaining = Math.max(0, grandTotal - paid);

        return {
            subtotal: Math.round(subtotal * 100) / 100,
            totalDiscount: Math.round(totalDiscount * 100) / 100,
            totalTax: Math.round(totalTax * 100) / 100,
            grandTotal: Math.round(grandTotal * 100) / 100,
            paid: Math.round(paid * 100) / 100,
            remaining: Math.round(remaining * 100) / 100,
        };
    };

    const totals = calculateTotals();

    const formatMoney = (val) => {
        return Number(val || 0).toLocaleString('ar-SA', { minimumFractionDigits: 2 }) + ' ر.س';
    };

    // Quick customer create handler
    const handleQuickCustomerSubmit = (e) => {
        e.preventDefault();
        if (!newCustomerName.trim()) return;

        setCreatingCustomer(true);
        router.post('/customers', {
            name: newCustomerName,
            phone: newCustomerPhone,
            type: newCustomerType,
        }, {
            preserveState: true,
            onSuccess: (page) => {
                setCreatingCustomer(false);
                setIsQuickCustomerModalOpen(false);
                setNewCustomerName('');
                setNewCustomerPhone('');
                const created = page.props.customers?.find((c) => c.name === newCustomerName);
                if (created) {
                    setSelectedCustomer(created.id);
                }
            },
            onError: () => {
                setCreatingCustomer(false);
            }
        });
    };

    // Filter products for quick search bar
    const searchFilteredProducts = productSearchTerm.trim().length > 0
        ? initialProducts.filter((p) =>
            p.name.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
            (p.sku && p.sku.toLowerCase().includes(productSearchTerm.toLowerCase())) ||
            (p.barcode && p.barcode.includes(productSearchTerm))
        ).slice(0, 8)
        : [];

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!selectedCustomer) {
            alert('يرجى اختيار العميل أولاً.');
            return;
        }

        const validItems = items.filter((i) => i.name && i.name.trim() !== '' && Number(i.quantity) > 0);
        if (validItems.length === 0) {
            alert('يرجى إدخال اسم وسعر منتج واحد على الأقل في الفاتورة.');
            return;
        }

        setIsSubmitting(true);

        router.post('/invoices', {
            customer_id: selectedCustomer,
            issue_date: data.issue_date,
            due_date: data.due_date || null,
            payment_method: paymentMethod,
            notes: data.notes || '',
            items: validItems.map((item) => ({
                product_id: item.product_id || null,
                name: item.name,
                quantity: Number(item.quantity),
                unit_price: Number(item.unit_price || 0),
                discount_percent: Number(item.discount_percent || 0),
                tax_rate: Number(item.tax_rate || default_tax_rate),
            })),
            initial_payment: paidAmount > 0 ? {
                amount: Number(paidAmount),
                payment_method: paymentMethod,
                create_receipt_voucher: createReceiptVoucher,
            } : null,
        }, {
            preserveScroll: true,
            onStart: () => setIsSubmitting(true),
            onFinish: () => setIsSubmitting(false),
            onError: (errs) => {
                setIsSubmitting(false);
                const firstErr = Object.values(errs)[0];
                if (firstErr) alert(firstErr);
            },
        });
    };

    return (
        <AppLayout title="إنشاء فاتورة مبيعات جديدة">
            {/* HTML5 Datalist for instant suggestion */}
            <datalist id="sales-products-list">
                {initialProducts.map((p) => (
                    <option key={p.id} value={p.name}>
                        {p.sku} — {p.sale_price} ر.س {p.barcode ? `(${p.barcode})` : ''}
                    </option>
                ))}
            </datalist>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="page-header">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Link href="/invoices" className="text-sm font-semibold text-slate-500 hover:text-sky-700 flex items-center gap-1">
                                <ArrowLeft className="w-4 h-4" />
                                <span>العودة لسجل الفواتير</span>
                            </Link>
                        </div>
                        <h1 className="page-title">
                            <FileText className="w-7 h-7 text-sky-700" />
                            <span>إصدار فاتورة بيع جديدة</span>
                        </h1>
                        <p className="page-subtitle">
                            إدخال المنتجات يدوياً أو اختيارها، وحساب الضرائب، وإصدار الفاتورة فوراً
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link href="/invoices" className="btn btn-secondary">
                            إلغاء
                        </Link>
                        <button
                            type="submit"
                            disabled={isSubmitting || processing}
                            className="btn btn-primary btn-lg flex items-center gap-2 shadow-md"
                        >
                            <CheckCircle2 className="w-5 h-5" />
                            <span>{isSubmitting ? 'جارٍ حفظ وإصدار الفاتورة...' : 'حفظ وإصدار الفاتورة'}</span>
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column: Customer & Items Table */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* 1. Customer & Invoice Details */}
                        <div className="card space-y-4">
                            <div className="card-header !mb-3">
                                <div className="card-title text-sm flex items-center gap-2">
                                    <User className="w-4 h-4 text-sky-700" />
                                    <span>1. بيانات العميل والفاتورة</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="sm:col-span-2">
                                    <div className="flex justify-between items-center mb-1">
                                        <label className="label text-xs !mb-0">العميل / المحل التجاري *</label>
                                        <button
                                            type="button"
                                            onClick={() => setIsQuickCustomerModalOpen(true)}
                                            className="text-xs text-sky-700 font-bold hover:underline flex items-center gap-1"
                                        >
                                            <UserPlus className="w-3.5 h-3.5" />
                                            <span>+ عميل جديد سريع</span>
                                        </button>
                                    </div>
                                    <select
                                        className={`input ${errors.customer_id ? 'input-error' : ''}`}
                                        value={selectedCustomer}
                                        onChange={(e) => setSelectedCustomer(e.target.value)}
                                        required
                                    >
                                        <option value="">-- اختر العميل --</option>
                                        {customers.map((c) => (
                                            <option key={c.id} value={c.id}>
                                                {c.name} {c.phone ? `(${c.phone})` : ''} {c.tax_number ? `• ضريبي: ${c.tax_number}` : ''}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.customer_id && <div className="field-error">{errors.customer_id}</div>}
                                </div>

                                <div>
                                    <label className="label text-xs">تاريخ الإصدار *</label>
                                    <input
                                        type="date"
                                        className="input"
                                        value={data.issue_date}
                                        onChange={(e) => setData('issue_date', e.target.value)}
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="label text-xs">تاريخ الاستحقاق (اختياري)</label>
                                    <input
                                        type="date"
                                        className="input"
                                        value={data.due_date}
                                        onChange={(e) => setData('due_date', e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Quick Search Helper Bar */}
                        <div className="card !p-4 bg-slate-50 border-slate-200">
                            <div className="relative">
                                <input
                                    type="text"
                                    className="input pr-10 text-sm bg-white"
                                    placeholder="بحث سريع في المنتجات بالاسم أو الباركود لإضافتها للجدول..."
                                    value={productSearchTerm}
                                    onChange={(e) => setProductSearchTerm(e.target.value)}
                                />
                                <Search className="w-5 h-5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />

                                {searchFilteredProducts.length > 0 && (
                                    <div className="absolute left-0 right-0 top-full mt-1 bg-white rounded-xl shadow-2xl border border-slate-200 z-30 max-h-60 overflow-y-auto divide-y divide-slate-100">
                                        {searchFilteredProducts.map((p) => (
                                            <div
                                                key={p.id}
                                                onClick={() => addProductFromSearch(p)}
                                                className="p-3 hover:bg-sky-50 cursor-pointer flex items-center justify-between transition-colors"
                                            >
                                                <div>
                                                    <div className="font-bold text-sm text-slate-900">{p.name}</div>
                                                    <div className="text-xs text-slate-400">SKU: {p.sku} {p.barcode ? `• باركود: ${p.barcode}` : ''}</div>
                                                </div>
                                                <div className="text-left">
                                                    <div className="font-bold text-sm text-sky-800">{formatMoney(p.sale_price)}</div>
                                                    <div className="text-[11px] text-slate-500">المتوفر بالمخزون: {Number(p.stock_quantity)} {p.unit ? p.unit.name : ''}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* 2. Items Table with Direct Manual Input */}
                        <div className="card space-y-4">
                            <div className="card-header !mb-2 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                                <div>
                                    <div className="card-title text-sm flex items-center gap-2">
                                        <PackagePlus className="w-4 h-4 text-sky-700" />
                                        <span>2. بنود ومنتجات الفاتورة ({items.length})</span>
                                    </div>
                                    <div className="text-xs text-slate-500 mt-0.5">
                                        اكتب اسم المنتج يدوياً مباشرة، أو اختر من القائمة
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={addNewRow}
                                    className="btn btn-sm btn-primary flex items-center gap-1.5 shadow-xs"
                                >
                                    <Plus className="w-4 h-4" />
                                    <span>+ إضافة بند يدوي</span>
                                </button>
                            </div>

                            {/* Table */}
                            <div className="table-container border border-slate-200 rounded-xl overflow-x-auto">
                                <table className="table">
                                    <thead>
                                        <tr className="bg-slate-50">
                                            <th style={{ width: '40%' }}>اسم المنتج / البيان *</th>
                                            <th style={{ width: '15%' }}>الكمية *</th>
                                            <th style={{ width: '18%' }}>سعر البيع (ر.س) *</th>
                                            <th style={{ width: '12%' }}>الخصم (%)</th>
                                            <th style={{ width: '15%' }}>الإجمالي</th>
                                            <th style={{ width: '5%' }}></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {items.map((item, index) => {
                                            const gross = Number(item.quantity || 0) * Number(item.unit_price || 0);
                                            const disc = gross * (Number(item.discount_percent || 0) / 100);
                                            const net = gross - disc;
                                            const tax = net * (Number(item.tax_rate || 0) / 100);
                                            const total = net + tax;

                                            return (
                                                <tr key={index} className="hover:bg-slate-50/50">
                                                    <td>
                                                        <div className="space-y-1">
                                                            <input
                                                                type="text"
                                                                list="sales-products-list"
                                                                className="input text-sm font-semibold !py-1.5"
                                                                placeholder="اكتب اسم المنتج يدوياً أو اختر..."
                                                                value={item.name}
                                                                onChange={(e) => handleProductSelect(index, e.target.value)}
                                                                required
                                                            />
                                                            {item.sku && (
                                                                <div className="text-[11px] text-slate-400 font-mono px-1">
                                                                    رمز: {item.sku}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <input
                                                            type="number"
                                                            step="1"
                                                            min="1"
                                                            className="input !py-1.5 text-center font-bold text-sm"
                                                            value={item.quantity}
                                                            onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                                                            required
                                                        />
                                                    </td>
                                                    <td>
                                                        <input
                                                            type="number"
                                                            step="0.01"
                                                            min="0"
                                                            className="input !py-1.5 text-center font-bold text-sm"
                                                            placeholder="0.00"
                                                            value={item.unit_price}
                                                            onChange={(e) => updateItem(index, 'unit_price', e.target.value)}
                                                            required
                                                        />
                                                    </td>
                                                    <td>
                                                        <input
                                                            type="number"
                                                            step="1"
                                                            min="0"
                                                            max="100"
                                                            className="input !py-1.5 text-center text-xs"
                                                            value={item.discount_percent}
                                                            onChange={(e) => updateItem(index, 'discount_percent', e.target.value)}
                                                        />
                                                    </td>
                                                    <td>
                                                        <div className="font-bold text-sm text-slate-900 text-center font-mono">
                                                            {formatMoney(total)}
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <button
                                                            type="button"
                                                            onClick={() => removeItem(index)}
                                                            className="p-1 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                                                            title="حذف البند"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            <div className="flex justify-start">
                                <button
                                    type="button"
                                    onClick={addNewRow}
                                    className="btn btn-sm btn-secondary flex items-center gap-1.5 text-xs font-bold"
                                >
                                    <Plus className="w-4 h-4" />
                                    <span>+ إضافة سطر آخر</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Financial Totals & Payment */}
                    <div className="space-y-6">
                        {/* Financial Totals */}
                        <div className="card space-y-4">
                            <div className="card-header !mb-3">
                                <div className="card-title text-sm">ملخص الحساب المالي</div>
                            </div>

                            <div className="space-y-2.5 text-sm">
                                <div className="flex justify-between text-slate-600">
                                    <span>المجموع قبل الضريبة:</span>
                                    <span className="font-mono font-bold">{formatMoney(totals.subtotal)}</span>
                                </div>

                                {totals.totalDiscount > 0 && (
                                    <div className="flex justify-between text-amber-700">
                                        <span>إجمالي الخصم:</span>
                                        <span className="font-mono font-bold">-{formatMoney(totals.totalDiscount)}</span>
                                    </div>
                                )}

                                <div className="flex justify-between text-slate-600">
                                    <span>ضريبة القيمة المضافة ({default_tax_rate}%):</span>
                                    <span className="font-mono font-bold">{formatMoney(totals.totalTax)}</span>
                                </div>

                                <div className="flex justify-between text-base font-black pt-3 border-t border-slate-200 text-slate-900">
                                    <span>الإجمالي النهائي المستحق:</span>
                                    <span className="font-mono text-sky-800 text-lg">{formatMoney(totals.grandTotal)}</span>
                                </div>

                                {/* Payment Method */}
                                <div className="pt-3 border-t border-slate-200 space-y-2">
                                    <label className="label text-xs">طريقة الدفع</label>
                                    <select
                                        className="input"
                                        value={paymentMethod}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                    >
                                        <option value="cash">نقداً (Cash)</option>
                                        <option value="card">بطاقة مدى / شبكة (Card / Mada)</option>
                                        <option value="bank">تحويل بنكي (Bank Transfer)</option>
                                        <option value="other">آجل / أخرى (Credit)</option>
                                    </select>
                                </div>

                                {/* Immediate Payment Input */}
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <label className="label text-xs !mb-0">المبلغ المدفوع فوراً (اختياري)</label>
                                        <button
                                            type="button"
                                            onClick={() => setPaidAmount(String(totals.grandTotal))}
                                            className="text-xs text-sky-700 font-bold hover:underline"
                                        >
                                            سداد كامل المبلغ
                                        </button>
                                    </div>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        max={totals.grandTotal}
                                        className="input font-mono font-bold text-emerald-800"
                                        placeholder="0.00"
                                        value={paidAmount}
                                        onChange={(e) => setPaidAmount(e.target.value)}
                                    />
                                </div>

                                {Number(paidAmount) > 0 && (
                                    <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer pt-1">
                                        <input
                                            type="checkbox"
                                            className="rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                                            checked={createReceiptVoucher}
                                            onChange={(e) => setCreateReceiptVoucher(e.target.checked)}
                                        />
                                        <span>إصدار سند قبض تلقائي لهذا المبلغ المدفوع</span>
                                    </label>
                                )}

                                <div className="flex justify-between text-sm font-bold text-red-600 pt-2 border-t border-dashed border-slate-200">
                                    <span>المتبقي ذمة على العميل:</span>
                                    <span className="font-mono">{formatMoney(totals.remaining)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Notes */}
                        <div className="card space-y-2">
                            <label className="label text-xs">ملاحظات الفاتورة</label>
                            <textarea
                                className="input text-xs"
                                rows="3"
                                placeholder="أي شروط أو ملاحظات خاصة بالفاتورة أو التسليم..."
                                value={data.notes}
                                onChange={(e) => setData('notes', e.target.value)}
                            ></textarea>
                        </div>
                    </div>
                </div>
            </form>

            {/* Quick Customer Modal */}
            <Modal
                isOpen={isQuickCustomerModalOpen}
                onClose={() => setIsQuickCustomerModalOpen(false)}
                title="إضافة عميل جديد سريع"
            >
                <form onSubmit={handleQuickCustomerSubmit} className="space-y-4">
                    <div>
                        <label className="label text-xs">اسم العميل / المحل *</label>
                        <input
                            type="text"
                            className="input"
                            placeholder="مثال: مؤسسة الأفق / عبدالله المحمد"
                            value={newCustomerName}
                            onChange={(e) => setNewCustomerName(e.target.value)}
                            required
                        />
                    </div>

                    <div>
                        <label className="label text-xs">رقم الجوال</label>
                        <input
                            type="text"
                            className="input font-mono"
                            placeholder="05XXXXXXXX"
                            value={newCustomerPhone}
                            onChange={(e) => setNewCustomerPhone(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="label text-xs">نوع العميل</label>
                        <select
                            className="input text-xs"
                            value={newCustomerType}
                            onChange={(e) => setNewCustomerType(e.target.value)}
                        >
                            <option value="business">منشأة / محل تجاري (Business)</option>
                            <option value="individual">فرد / عميل نهائي (Individual)</option>
                        </select>
                    </div>

                    <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={() => setIsQuickCustomerModalOpen(false)}
                            className="btn btn-secondary text-xs"
                        >
                            إلغاء
                        </button>
                        <button
                            type="submit"
                            disabled={creatingCustomer || !newCustomerName.trim()}
                            className="btn btn-primary text-xs flex items-center gap-1.5"
                        >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>{creatingCustomer ? 'جارٍ الحفظ...' : 'حفظ واختيار العميل'}</span>
                        </button>
                    </div>
                </form>
            </Modal>
        </AppLayout>
    );
}
