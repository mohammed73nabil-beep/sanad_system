import React, { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import AppLayout from '@/Components/Layout/AppLayout';
import {
    ArrowLeftRight,
    ArrowLeft,
    Filter,
    Package,
    Calendar,
    ArrowDownRight,
    ArrowUpRight,
} from 'lucide-react';

export default function InventoryMovements({ movements, products, filters }) {
    const [selectedProduct, setSelectedProduct] = useState(filters.product_id || '');
    const [selectedType, setSelectedType] = useState(filters.type || '');
    const [fromDate, setFromDate] = useState(filters.from_date || '');
    const [toDate, setToDate] = useState(filters.to_date || '');

    const handleFilter = (e) => {
        if (e) e.preventDefault();
        router.get('/inventory/movements', {
            product_id: selectedProduct,
            type: selectedType,
            from_date: fromDate,
            to_date: toDate,
        }, { preserveState: true });
    };

    return (
        <AppLayout title="سجل حركات المخزون">
            <div className="space-y-6">
                <div className="page-header">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Link href="/inventory" className="text-sm font-semibold text-slate-500 hover:text-teal-700 flex items-center gap-1">
                                <ArrowLeft className="w-4 h-4" />
                                <span>العودة للمخزون</span>
                            </Link>
                        </div>
                        <h1 className="page-title">
                            <ArrowLeftRight className="w-7 h-7 text-teal-700" />
                            <span>سجل حركات المخزون التفصيلي</span>
                        </h1>
                        <p className="page-subtitle">
                            تتبع كل عملية إضافة أو سحب تمت على المخزون مع الرصيد قبل وبعد كل حركة
                        </p>
                    </div>
                </div>

                {/* Filters */}
                <div className="card !p-4">
                    <form onSubmit={handleFilter} className="flex flex-wrap items-center gap-3">
                        <select
                            className="input !py-1.5 !px-2.5 text-xs w-48"
                            value={selectedProduct}
                            onChange={(e) => setSelectedProduct(e.target.value)}
                        >
                            <option value="">جميع المنتجات</option>
                            {products.map((p) => (
                                <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                            ))}
                        </select>

                        <select
                            className="input !py-1.5 !px-2.5 text-xs w-36"
                            value={selectedType}
                            onChange={(e) => setSelectedType(e.target.value)}
                        >
                            <option value="">جميع أنواع الحركات</option>
                            <option value="purchase">شراء (زيادة +)</option>
                            <option value="sale">بيع (نقص -)</option>
                            <option value="adjustment">تعديل يدوي</option>
                        </select>

                        <div className="flex items-center gap-1.5 text-xs">
                            <span>من:</span>
                            <input
                                type="date"
                                className="input !py-1.5 !px-2 text-xs w-32"
                                value={fromDate}
                                onChange={(e) => setFromDate(e.target.value)}
                            />
                        </div>

                        <div className="flex items-center gap-1.5 text-xs">
                            <span>إلى:</span>
                            <input
                                type="date"
                                className="input !py-1.5 !px-2 text-xs w-32"
                                value={toDate}
                                onChange={(e) => setToDate(e.target.value)}
                            />
                        </div>

                        <button type="submit" className="btn btn-sm btn-secondary">
                            تطبيق الفلترة
                        </button>
                    </form>
                </div>

                {/* Table */}
                <div className="table-container bg-white shadow-xs">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>التاريخ والوقت</th>
                                <th>المنتج</th>
                                <th>نوع الحركة</th>
                                <th>الكمية المتغيرة</th>
                                <th>الرصيد قبل</th>
                                <th>الرصيد بعد</th>
                                <th>البيان / المرجع</th>
                            </tr>
                        </thead>
                        <tbody>
                            {movements.data.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="text-center py-10 text-slate-400">
                                        لا توجد حركات مخزون مسجلة.
                                    </td>
                                </tr>
                            ) : (
                                movements.data.map((m) => (
                                    <tr key={m.id}>
                                        <td className="font-mono text-xs text-slate-500">
                                            {new Date(m.created_at).toLocaleString('ar-SA')}
                                        </td>
                                        <td>
                                            <div className="font-bold text-slate-900">{m.product ? m.product.name : '—'}</div>
                                            {m.product && <div className="text-xs text-slate-400 font-mono">SKU: {m.product.sku}</div>}
                                        </td>
                                        <td>
                                            <span className={`text-xs px-2 py-0.5 rounded-full font-bold inline-flex items-center gap-1 ${m.type === 'purchase' ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-800'}`}>
                                                {m.type === 'purchase' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                                <span>{m.type_name}</span>
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`font-black ${m.type === 'purchase' ? 'text-emerald-700' : 'text-red-600'}`}>
                                                {m.type === 'purchase' ? '+' : '-'}{Number(m.quantity)} {m.product?.unit?.name || ''}
                                            </span>
                                        </td>
                                        <td className="font-mono text-xs">{Number(m.quantity_before)}</td>
                                        <td className="font-mono text-xs font-bold text-slate-900">{Number(m.quantity_after)}</td>
                                        <td className="text-xs text-slate-600">{m.notes || '—'}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {movements.links && movements.links.length > 3 && (
                    <div className="flex justify-center gap-1 py-4">
                        {movements.links.map((link, i) => (
                            <Link
                                key={i}
                                href={link.url || '#'}
                                className={`px-3 py-1.5 rounded-lg text-sm font-semibold ${link.active ? 'bg-sky-700 text-white' : link.url ? 'bg-white text-slate-700 border hover:bg-slate-50' : 'text-slate-400 pointer-events-none'}`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
