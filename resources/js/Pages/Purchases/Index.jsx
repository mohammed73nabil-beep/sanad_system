import React, { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import AppLayout from '@/Components/Layout/AppLayout';
import Badge from '@/Components/UI/Badge';
import {
    ShoppingBag,
    Plus,
    Search,
    Download,
    Eye,
    Building2,
    Calendar,
} from 'lucide-react';

export default function PurchasesIndex({ purchases, suppliers, filters, summary }) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [selectedSupplier, setSelectedSupplier] = useState(filters.supplier_id || '');
    const [fromDate, setFromDate] = useState(filters.from_date || '');
    const [toDate, setToDate] = useState(filters.to_date || '');

    const handleFilter = (e) => {
        if (e) e.preventDefault();
        router.get('/purchases', {
            search: searchTerm,
            supplier_id: selectedSupplier,
            from_date: fromDate,
            to_date: toDate,
        }, { preserveState: true });
    };

    const formatMoney = (val) => {
        return Number(val || 0).toLocaleString('ar-SA', { minimumFractionDigits: 2 }) + ' ر.س';
    };

    return (
        <AppLayout title="سجل فواتير المشتريات">
            <div className="space-y-6">
                <div className="page-header">
                    <div>
                        <h1 className="page-title">
                            <ShoppingBag className="w-7 h-7 text-indigo-700" />
                            <span>فواتير المشتريات من الموردين</span>
                        </h1>
                        <p className="page-subtitle">
                            تسجيل فواتير الشراء، متابعة دفعات الموردين، وتحديث كميات المخزون
                        </p>
                    </div>

                    <Link
                        href="/purchases/create"
                        className="btn btn-primary flex items-center gap-1.5 shadow-sm"
                    >
                        <Plus className="w-5 h-5" />
                        <span>+ فاتورة شراء جديدة</span>
                    </Link>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="stat-card">
                        <div>
                            <div className="stat-value text-indigo-900">{formatMoney(summary.total_purchases)}</div>
                            <div className="stat-label">إجمالي المشتريات المعتمدة</div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div>
                            <div className="stat-value text-emerald-700">{formatMoney(summary.total_paid)}</div>
                            <div className="stat-label">إجمالي المسدد للموردين</div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div>
                            <div className="stat-value text-red-600">{formatMoney(summary.total_due)}</div>
                            <div className="stat-label">إجمالي المتبقي للموردين</div>
                        </div>
                    </div>
                </div>

                {/* Filter */}
                <div className="card !p-4 flex flex-col md:flex-row gap-3 items-center justify-between">
                    <form onSubmit={handleFilter} className="flex gap-2 w-full md:w-80">
                        <div className="relative flex-1">
                            <input
                                type="text"
                                className="input pr-9 text-sm"
                                placeholder="بحث برقم الفاتورة أو اسم المورد..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                        <button type="submit" className="btn btn-secondary text-sm">
                            بحث
                        </button>
                    </form>

                    <div className="flex flex-wrap gap-2 w-full md:w-auto">
                        <select
                            className="input !py-1.5 !px-2.5 text-xs w-44"
                            value={selectedSupplier}
                            onChange={(e) => {
                                setSelectedSupplier(e.target.value);
                                router.get('/purchases', { search: searchTerm, supplier_id: e.target.value, from_date: fromDate, to_date: toDate }, { preserveState: true });
                            }}
                        >
                            <option value="">جميع الموردين</option>
                            {suppliers.map((s) => (
                                <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Table */}
                <div className="table-container bg-white shadow-xs">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>رقم الشراء</th>
                                <th>المورد</th>
                                <th>تاريخ الشراء</th>
                                <th>رقم فاتورة المورد</th>
                                <th>الإجمالي</th>
                                <th>المدفوع</th>
                                <th>المتبقي</th>
                                <th>الحالة</th>
                                <th>الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {purchases.data.length === 0 ? (
                                <tr>
                                    <td colSpan="9" className="text-center py-10 text-slate-400">
                                        لا توجد فواتير شراء مسجلة حتى الآن.
                                    </td>
                                </tr>
                            ) : (
                                purchases.data.map((pur) => (
                                    <tr key={pur.id}>
                                        <td>
                                            <Link href={`/purchases/${pur.id}`} className="font-mono font-bold text-indigo-800 hover:underline">
                                                {pur.purchase_number}
                                            </Link>
                                        </td>
                                        <td>
                                            <div className="font-bold text-slate-900">{pur.supplier ? pur.supplier.name : '—'}</div>
                                        </td>
                                        <td className="font-mono text-xs">{pur.purchase_date}</td>
                                        <td className="font-mono text-xs text-slate-500">{pur.supplier_invoice_number || '—'}</td>
                                        <td className="font-black text-slate-900">{formatMoney(pur.total_amount)}</td>
                                        <td className="font-bold text-emerald-700">{formatMoney(pur.paid_amount)}</td>
                                        <td className="font-black text-red-600">{formatMoney(pur.remaining_amount)}</td>
                                        <td>
                                            <Badge
                                                status={pur.status === 'confirmed' ? 'paid' : 'draft'}
                                                text={pur.status === 'confirmed' ? 'معتمدة' : 'مسودة'}
                                            />
                                        </td>
                                        <td>
                                            <div className="flex items-center gap-1.5 justify-center">
                                                <Link
                                                    href={`/purchases/${pur.id}`}
                                                    className="p-1.5 text-slate-600 hover:text-indigo-700 rounded-lg hover:bg-slate-100"
                                                    title="عرض الفاتورة"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {purchases.links && purchases.links.length > 3 && (
                    <div className="flex justify-center gap-1 py-4">
                        {purchases.links.map((link, i) => (
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
