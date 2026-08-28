import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import AppLayout from '@/Components/Layout/AppLayout';
import {
    BarChart3,
    Download,
    FileSpreadsheet,
    FileText,
    Calendar,
    CheckCircle2,
    Building2,
    TrendingUp,
    ShoppingBag,
    Wallet,
} from 'lucide-react';

export default function AccountantReport({ data }) {
    const { sales, purchases, tax, receipts, from_date, to_date } = data;

    const [fromDateInput, setFromDateInput] = useState(from_date || '');
    const [toDateInput, setToDateInput] = useState(to_date || '');

    const handleFilter = (e) => {
        e.preventDefault();
        router.get('/reports/accountant', {
            from_date: fromDateInput,
            to_date: toDateInput,
        }, { preserveState: true });
    };

    const formatMoney = (val) => {
        return Number(val || 0).toLocaleString('ar-SA', { minimumFractionDigits: 2 }) + ' ر.س';
    };

    return (
        <AppLayout title="ملف المحاسب والإقرار الضريبي">
            <div className="space-y-6">
                <div className="page-header">
                    <div>
                        <h1 className="page-title">
                            <BarChart3 className="w-7 h-7 text-amber-500" />
                            <span>ملف المحاسب والإقرار الضريبي</span>
                        </h1>
                        <p className="page-subtitle">
                            تصدير ومراجعة العمليات المالية والضريبية الشاملة لتقديم الإقرارات المحاسبية
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <a
                            href={`/reports/accountant/pdf?from_date=${fromDateInput}&to_date=${toDateInput}`}
                            target="_blank"
                            className="btn btn-primary shadow-sm flex items-center gap-1.5"
                        >
                            <FileText className="w-4 h-4" />
                            <span>تصدير PDF للمحاسب</span>
                        </a>

                        <a
                            href={`/reports/accountant/excel?from_date=${fromDateInput}&to_date=${toDateInput}`}
                            className="btn btn-secondary flex items-center gap-1.5 text-emerald-800"
                        >
                            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                            <span>تصدير Excel (CSV)</span>
                        </a>
                    </div>
                </div>

                {/* Date Filter */}
                <div className="card !p-4">
                    <form onSubmit={handleFilter} className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex flex-wrap items-center gap-3">
                            <div className="flex items-center gap-1.5 text-sm">
                                <span className="text-slate-600 font-bold">من تاريخ:</span>
                                <input
                                    type="date"
                                    className="input !py-1.5 !px-2 text-xs w-36"
                                    value={fromDateInput}
                                    onChange={(e) => setFromDateInput(e.target.value)}
                                />
                            </div>

                            <div className="flex items-center gap-1.5 text-sm">
                                <span className="text-slate-600 font-bold">إلى تاريخ:</span>
                                <input
                                    type="date"
                                    className="input !py-1.5 !px-2 text-xs w-36"
                                    value={toDateInput}
                                    onChange={(e) => setToDateInput(e.target.value)}
                                />
                            </div>

                            <button type="submit" className="btn btn-sm btn-secondary">
                                تطبيق الفترة
                            </button>
                        </div>

                        <div className="text-xs text-slate-500">
                            الفترة الحالية: من <strong>{from_date || 'البداية'}</strong> إلى <strong>{to_date || 'اليوم'}</strong>
                        </div>
                    </form>
                </div>

                {/* Tax Breakdown Card */}
                <div className="card bg-gradient-to-b from-white to-slate-50 border-2 border-sky-100">
                    <h3 className="font-black text-base text-sky-950 border-b border-slate-200 pb-3 mb-4">
                        1. ملخص ضريبة القيمة المضافة (VAT Breakdown)
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
                            <div className="text-xs font-bold text-sky-800">ضريبة المبيعات (المخرجات)</div>
                            <div className="text-xl font-black text-sky-900">{formatMoney(tax.sales_tax)}</div>
                            <div className="text-xs text-slate-500">المبيعات الخاضعة: {formatMoney(tax.sales_taxable)}</div>
                        </div>

                        <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
                            <div className="text-xs font-bold text-indigo-800">ضريبة المشتريات (المدخلات)</div>
                            <div className="text-xl font-black text-indigo-900">{formatMoney(tax.purchases_tax)}</div>
                            <div className="text-xs text-slate-500">المشتريات الخاضعة: {formatMoney(tax.purchases_taxable)}</div>
                        </div>

                        <div className="bg-gradient-to-tr from-sky-900 to-indigo-950 text-white p-4 rounded-xl shadow-md space-y-2">
                            <div className="text-xs font-bold text-amber-300">صافي الضريبة المستحقة للسداد</div>
                            <div className="text-2xl font-black text-amber-400 font-mono">{formatMoney(tax.net_tax_due)}</div>
                            <div className="text-[11px] text-slate-300">الفارق بين ضريبة المبيعات وضريبة المشتريات</div>
                        </div>
                    </div>

                    <div className="mt-4 text-xs text-slate-500 bg-slate-100 p-3 rounded-lg">
                        ℹ️ {tax.disclaimer}
                    </div>
                </div>

                {/* Operations Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="stat-card">
                        <div>
                            <div className="stat-value text-sky-900">{formatMoney(sales.total_sales)}</div>
                            <div className="stat-label">إجمالي المبيعات بالفترة (شامل الضريبة)</div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div>
                            <div className="stat-value text-indigo-900">{formatMoney(purchases.total_purchases)}</div>
                            <div className="stat-label">إجمالي المشتريات بالفترة (شامل الضريبة)</div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div>
                            <div className="stat-value text-emerald-700">{formatMoney(sales.total_paid)}</div>
                            <div className="stat-label">المقبوضات المحصلة من العملاء</div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div>
                            <div className="stat-value text-red-600">{formatMoney(sales.total_remaining)}</div>
                            <div className="stat-label">المتبقي غير المسدد من فواتير الفترة</div>
                        </div>
                    </div>
                </div>

                {/* Invoices List */}
                <div className="card">
                    <div className="card-header">
                        <div className="card-title text-sm">
                            2. فواتير المبيعات الصادرة خلال الفترة ({sales.count})
                        </div>
                    </div>

                    <div className="table-container border-0">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>رقم الفاتورة</th>
                                    <th>العميل</th>
                                    <th>التاريخ</th>
                                    <th>المجموع الفرعي</th>
                                    <th>الضريبة</th>
                                    <th>الإجمالي</th>
                                    <th>المدفوع</th>
                                    <th>المتبقي</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sales.invoices.length === 0 ? (
                                    <tr>
                                        <td colSpan="8" className="text-center py-6 text-slate-400 text-xs">
                                            لا توجد فواتير مبيعات مسجلة في هذه الفترة.
                                        </td>
                                    </tr>
                                ) : (
                                    sales.invoices.map((inv) => (
                                        <tr key={inv.id}>
                                            <td className="font-mono font-bold text-xs">{inv.invoice_number}</td>
                                            <td>{inv.customer ? inv.customer.name : '—'}</td>
                                            <td className="font-mono text-xs">{inv.issue_date}</td>
                                            <td>{formatMoney(inv.subtotal)}</td>
                                            <td>{formatMoney(inv.tax_amount)}</td>
                                            <td className="font-bold">{formatMoney(inv.total_amount)}</td>
                                            <td className="text-emerald-700 font-bold">{formatMoney(inv.paid_amount)}</td>
                                            <td className="text-red-600 font-bold">{formatMoney(inv.remaining_amount)}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
