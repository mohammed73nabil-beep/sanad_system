import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import AppLayout from '@/Components/Layout/AppLayout';
import { Percent, Building2 } from 'lucide-react';

export default function TaxReport({ report }) {
    const { sales_taxable, sales_tax, sales_total, purchases_taxable, purchases_tax, purchases_total, net_tax_due, from_date, to_date, disclaimer } = report;
    const [fromDate, setFromDate] = useState(from_date || '');
    const [toDate, setToDate] = useState(to_date || '');

    const handleFilter = (e) => {
        e.preventDefault();
        router.get('/reports/tax', { from_date: fromDate, to_date: toDate }, { preserveState: true });
    };

    const formatMoney = (val) => Number(val || 0).toLocaleString('ar-SA', { minimumFractionDigits: 2 }) + ' ر.س';

    return (
        <AppLayout title="تقرير ضريبة القيمة المضافة (VAT)">
            <div className="space-y-6">
                <div className="page-header">
                    <div>
                        <h1 className="page-title">
                            <Percent className="w-7 h-7 text-amber-500" />
                            <span>تقرير ضريبة القيمة المضافة (VAT)</span>
                        </h1>
                        <p className="page-subtitle">
                            حساب ضريبة المخرجات وضريبة المدخلات وصافي الضريبة المستحقة للسداد
                        </p>
                    </div>
                </div>

                <div className="card !p-4">
                    <form onSubmit={handleFilter} className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-1.5 text-xs">
                            <span>من:</span>
                            <input type="date" className="input !py-1.5 !px-2 text-xs w-36" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
                        </div>
                        <div className="flex items-center gap-1.5 text-xs">
                            <span>إلى:</span>
                            <input type="date" className="input !py-1.5 !px-2 text-xs w-36" value={toDate} onChange={(e) => setToDate(e.target.value)} />
                        </div>
                        <button type="submit" className="btn btn-sm btn-secondary">تطبيق</button>
                    </form>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="card space-y-3">
                        <div className="text-xs font-bold text-sky-800 uppercase">ضريبة المبيعات (المخرجات)</div>
                        <div className="text-2xl font-black text-sky-900">{formatMoney(sales_tax)}</div>
                        <div className="text-xs text-slate-500 pt-2 border-t">المبيعات الخاضعة للضريبة: {formatMoney(sales_taxable)}</div>
                        <div className="text-xs text-slate-500">إجمالي المبيعات شامل الضريبة: {formatMoney(sales_total)}</div>
                    </div>

                    <div className="card space-y-3">
                        <div className="text-xs font-bold text-indigo-800 uppercase">ضريبة المشتريات (المدخلات)</div>
                        <div className="text-2xl font-black text-indigo-900">{formatMoney(purchases_tax)}</div>
                        <div className="text-xs text-slate-500 pt-2 border-t">المشتريات الخاضعة للضريبة: {formatMoney(purchases_taxable)}</div>
                        <div className="text-xs text-slate-500">إجمالي المشتريات شامل الضريبة: {formatMoney(purchases_total)}</div>
                    </div>

                    <div className="card bg-gradient-to-tr from-sky-900 to-indigo-950 text-white space-y-3 shadow-lg">
                        <div className="text-xs font-bold text-amber-300 uppercase">صافي الضريبة المستحقة للسداد</div>
                        <div className="text-3xl font-black text-amber-400 font-mono">{formatMoney(net_tax_due)}</div>
                        <div className="text-xs text-slate-300 pt-2 border-t border-white/10">الفارق الواجب تقديمه للهيئة في الإقرار الضريبي</div>
                    </div>
                </div>

                <div className="p-4 bg-slate-100 rounded-xl text-xs text-slate-600">
                    ℹ️ {disclaimer}
                </div>
            </div>
        </AppLayout>
    );
}
