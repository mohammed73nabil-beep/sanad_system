import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import AppLayout from '@/Components/Layout/AppLayout';
import { TrendingUp, DollarSign, Percent } from 'lucide-react';

export default function ProfitsReport({ report }) {
    const { total_revenue, total_cogs, gross_profit, profit_margin, from_date, to_date } = report;
    const [fromDate, setFromDate] = useState(from_date || '');
    const [toDate, setToDate] = useState(to_date || '');

    const handleFilter = (e) => {
        e.preventDefault();
        router.get('/reports/profits', { from_date: fromDate, to_date: toDate }, { preserveState: true });
    };

    const formatMoney = (val) => Number(val || 0).toLocaleString('ar-SA', { minimumFractionDigits: 2 }) + ' ر.س';

    return (
        <AppLayout title="تقرير الأرباح التقديرية">
            <div className="space-y-6">
                <div className="page-header">
                    <div>
                        <h1 className="page-title">
                            <TrendingUp className="w-7 h-7 text-amber-500" />
                            <span>تقرير الأرباح التقديرية (مجمل الربح)</span>
                        </h1>
                        <p className="page-subtitle">
                            احتساب صافي الإيرادات وتكلفة البضاعة المباعة (COGS) وهامش الربح
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

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="stat-card">
                        <div>
                            <div className="stat-value text-sky-900">{formatMoney(total_revenue)}</div>
                            <div className="stat-label">إجمالي إيرادات المبيعات (صافي)</div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div>
                            <div className="stat-value text-slate-700">{formatMoney(total_cogs)}</div>
                            <div className="stat-label">تكلفة البضاعة المباعة (COGS)</div>
                        </div>
                    </div>
                    <div className="stat-card bg-emerald-50/50 border-emerald-200">
                        <div>
                            <div className="stat-value text-emerald-700">{formatMoney(gross_profit)}</div>
                            <div className="stat-label">مجمل الربح التقديري</div>
                        </div>
                    </div>
                    <div className="stat-card bg-amber-50/50 border-amber-200">
                        <div>
                            <div className="stat-value text-amber-800">{profit_margin}%</div>
                            <div className="stat-label">هامش الربح الإجمالي</div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
