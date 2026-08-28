import React, { useState } from 'react';
import { useForm, Link } from '@inertiajs/react';
import AppLayout from '@/Components/Layout/AppLayout';
import {
    ShoppingBag,
    ArrowLeft,
    Plus,
    Trash2,
    Search,
    Upload,
    Calendar,
    CheckCircle2,
    Truck,
    PackagePlus,
    DollarSign,
} from 'lucide-react';

export default function PurchasesCreate({ suppliers, products: initialProducts = [], default_tax_rate = 15, company }) {
    const [selectedSupplier, setSelectedSupplier] = useState('');
    const [attachmentFile, setAttachmentFile] = useState(null);
    const [paidAmount, setPaidAmount] = useState('');

    // Default initial row for instant manual entry
    const [items, setItems] = useState([
        {
            product_id: '',
            name: '',
            sku: '',
            quantity: 1,
            unit_price: '',
            discount_percent: 0,
            tax_rate: default_tax_rate,
        }
    ]);

    const { data, setData, post, processing, errors } = useForm({
        supplier_id: '',
        purchase_date: new Date().toISOString().split('T')[0],
        due_date: '',
        supplier_invoice_number: '',
        paid_amount: '',
        notes: '',
        attachment: null,
        items: [],
    });

    // Add a new empty manual item row
    const addNewRow = () => {
        setItems([
            ...items,
            {
                product_id: '',
                name: '',
                sku: '',
                quantity: 1,
                unit_price: '',
                discount_percent: 0,
                tax_rate: default_tax_rate,
            }
        ]);
    };

    // When an existing product is selected from dropdown/datalist
    const handleProductSelect = (index, selectedName) => {
        const found = initialProducts.find((p) => p.name === selectedName || p.sku === selectedName || p.barcode === selectedName);
        const updated = [...items];
        if (found) {
            updated[index].product_id = found.id;
            updated[index].name = found.name;
            updated[index].sku = found.sku;
            updated[index].unit_price = Number(found.purchase_price || 0);
            updated[index].tax_rate = Number(found.tax_rate ?? default_tax_rate);
        } else {
            updated[index].product_id = '';
            updated[index].name = selectedName;
        }
        setItems(updated);
    };

    const updateItem = (index, field, value) => {
        const updated = [...items];
        updated[index][field] = value;
        setItems(updated);
    };

    const removeItem = (index) => {
        if (items.length === 1) {
            setItems([
                {
                    product_id: '',
                    name: '',
                    sku: '',
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

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!selectedSupplier) {
            alert('يرجى اختيار المورد.');
            return;
        }

        const validItems = items.filter((i) => i.name && i.name.trim() !== '' && Number(i.quantity) > 0);
        if (validItems.length === 0) {
            alert('يرجى إدخال اسم وسعر منتج واحد على الأقل في جدول المشتريات.');
            return;
        }

        const formData = new FormData();
        formData.append('supplier_id', selectedSupplier);
        formData.append('purchase_date', data.purchase_date);
        if (data.due_date) formData.append('due_date', data.due_date);
        if (data.supplier_invoice_number) formData.append('supplier_invoice_number', data.supplier_invoice_number);
        if (paidAmount) formData.append('paid_amount', paidAmount);
        if (data.notes) formData.append('notes', data.notes);
        if (attachmentFile) formData.append('attachment', attachmentFile);

        validItems.forEach((item, idx) => {
            if (item.product_id) {
                formData.append(`items[${idx}][product_id]`, item.product_id);
            }
            formData.append(`items[${idx}][name]`, item.name);
            formData.append(`items[${idx}][quantity]`, item.quantity);
            formData.append(`items[${idx}][unit_price]`, item.unit_price || 0);
            formData.append(`items[${idx}][discount_percent]`, item.discount_percent || 0);
            formData.append(`items[${idx}][tax_rate]`, item.tax_rate || default_tax_rate);
        });

        router.post('/purchases', formData, {
            forceFormData: true,
        });
    };

    return (
        <AppLayout title="فاتورة شراء جديدة">
            {/* HTML5 Datalist for fast auto-suggesting existing products */}
            <datalist id="existing-products-list">
                {initialProducts.map((p) => (
                    <option key={p.id} value={p.name}>
                        {p.sku} — {p.purchase_price} ر.س
                    </option>
                ))}
            </datalist>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="page-header">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Link href="/purchases" className="text-sm font-semibold text-slate-500 hover:text-indigo-700 flex items-center gap-1">
                                <ArrowLeft className="w-4 h-4" />
                                <span>العودة لفواتير الشراء</span>
                            </Link>
                        </div>
                        <h1 className="page-title">
                            <ShoppingBag className="w-7 h-7 text-indigo-700" />
                            <span>تسجيل فاتورة شراء جديدة</span>
                        </h1>
                        <p className="page-subtitle">
                            إدخال المشتريات وتحديث كميات المخزون وحساب المورد تلقائياً
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link href="/purchases" className="btn btn-secondary">
                            إلغاء
                        </Link>
                        <button
                            type="submit"
                            disabled={processing}
                            className="btn btn-primary btn-lg flex items-center gap-2 shadow-md"
                        >
                            <CheckCircle2 className="w-5 h-5" />
                            <span>حفظ واعتماد الفاتورة</span>
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column: Supplier & Items */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* 1. Supplier & Invoice Info */}
                        <div className="card space-y-4">
                            <div className="card-header !mb-3">
                                <div className="card-title text-sm flex items-center gap-2">
                                    <Truck className="w-4 h-4 text-indigo-700" />
                                    <span>1. بيانات المورد والفاتورة الأصلية</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="sm:col-span-2">
                                    <label className="label text-xs">المورد *</label>
                                    <select
                                        className={`input ${errors.supplier_id ? 'input-error' : ''}`}
                                        value={selectedSupplier}
                                        onChange={(e) => setSelectedSupplier(e.target.value)}
                                        required
                                    >
                                        <option value="">-- اختر المورد --</option>
                                        {suppliers.map((s) => (
                                            <option key={s.id} value={s.id}>
                                                {s.name} {s.tax_number ? `(الرقم الضريبي: ${s.tax_number})` : ''}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.supplier_id && <div className="field-error">{errors.supplier_id}</div>}
                                </div>

                                <div>
                                    <label className="label text-xs">تاريخ الشراء *</label>
                                    <input
                                        type="date"
                                        className="input"
                                        value={data.purchase_date}
                                        onChange={(e) => setData('purchase_date', e.target.value)}
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="label text-xs">رقم فاتورة المورد الأصلية</label>
                                    <input
                                        type="text"
                                        className="input font-mono"
                                        placeholder="مثال: SUP-9923..."
                                        value={data.supplier_invoice_number}
                                        onChange={(e) => setData('supplier_invoice_number', e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* 2. Items Table with Full Manual Input */}
                        <div className="card space-y-4">
                            <div className="card-header !mb-2 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                                <div>
                                    <div className="card-title text-sm flex items-center gap-2">
                                        <PackagePlus className="w-4 h-4 text-indigo-700" />
                                        <span>2. بنود ومنتجات فاتورة الشراء ({items.length})</span>
                                    </div>
                                    <div className="text-xs text-slate-500 mt-0.5">
                                        اكتب اسم المنتج يدوياً مباشرة، أو اختر من قائمة المنتجات المتوفرة
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
                                            <th style={{ width: '18%' }}>سعر الشراء (ر.س) *</th>
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
                                                                list="existing-products-list"
                                                                className="input text-sm font-semibold !py-1.5"
                                                                placeholder="اكتب اسم المنتج أو اختر..."
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
                                                            step="0.01"
                                                            min="0.01"
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

                    {/* Right Column: Totals & Attachment */}
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
                                    <span>الإجمالي شامل الضريبة:</span>
                                    <span className="font-mono text-indigo-900">{formatMoney(totals.grandTotal)}</span>
                                </div>

                                <div className="pt-3 border-t border-slate-200 space-y-2">
                                    <label className="label text-xs">المبلغ المسدد للمورد الآن (اختياري)</label>
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

                                <div className="flex justify-between text-sm font-bold text-red-600 pt-2 border-t border-dashed border-slate-200">
                                    <span>المتبقي للمورد:</span>
                                    <span className="font-mono">{formatMoney(totals.remaining)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Supplier Invoice Attachment */}
                        <div className="card space-y-3">
                            <div className="card-header !mb-2">
                                <div className="card-title text-sm flex items-center gap-2">
                                    <Upload className="w-4 h-4 text-slate-600" />
                                    <span>مرفق فاتورة المورد (صورة / PDF)</span>
                                </div>
                            </div>

                            <input
                                type="file"
                                accept="application/pdf,image/jpeg,image/png,image/jpg"
                                className="input text-xs"
                                onChange={(e) => setAttachmentFile(e.target.files[0])}
                            />
                            <div className="text-[11px] text-slate-400">
                                يمكنك إرفاق نسخة ضوئية من فاتورة المورد للرجوع إليها مستقبلاً
                            </div>
                        </div>

                        {/* Notes */}
                        <div className="card space-y-2">
                            <label className="label text-xs">ملاحظات الفاتورة</label>
                            <textarea
                                className="input text-xs"
                                rows="3"
                                placeholder="أي ملاحظات تخص استلام البضاعة أو طريقة التوصيل..."
                                value={data.notes}
                                onChange={(e) => setData('notes', e.target.value)}
                            ></textarea>
                        </div>
                    </div>
                </div>
            </form>
        </AppLayout>
    );
}
