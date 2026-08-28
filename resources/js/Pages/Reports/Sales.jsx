import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import AppLayout from '@/Components/Layout/AppLayout';
import { TrendingUp, Calendar } from 'lucide-react';

export default function SalesReport({ report }) {
    const { invoices, count, total_sales, total_subtotal, total_tax, total_paid, total_remaining, from_date, to_date } = report;
    const [fromDate, setFromDate] = useState(from_date || '');
    const [toDate, setToDate] = useState(to_date || '');

    const handleFilter = (e) => {
        e.preventDefault();
        router.get('/reports/sales', { from_date: fromDate, to_date: toDate }, { preserveState: true });
    };

    const formatMoney = (val) => Number(val || 0).toLocaleString('ar-SA', { minimumFractionDigits: 2 }) + ' ر.س';

    return (
        <AppLayout title="تقرير المبيعات التفصيلي">
            <div className="space-y-6">
                <div className="page-header">
                    <div>
                        <h1 className="page-title">
                            <TrendingUp className="w-7 h-7 text-emerald-600" />
                            <span>تقرير المبيعات التفصيلي</span>
                        </h1>
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

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    <div className="stat-card">
                        <div>
                            <div className="stat-value text-slate-800">{count}</div>
                            <div className="stat-label">عدد الفواتير الصادرة</div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div>
                            <div className="stat-value text-sky-900">{formatMoney(total_sales)}</div>
                            <div className="stat-label">إجمالي المبيعات</div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div>
                            <div className="stat-value text-emerald-700">{formatMoney(total_paid)}</div>
                            <div className="stat-label">إجمالي المحصل</div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div>
                            <div className="stat-value text-red-600">{formatMoney(total_remaining)}</div>
                            <div className="stat-label">المتبقي غير المحصل</div>
                        </div>
                    </div>
                </div>

                <div className="table-container bg-white shadow-xs">
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
                            {invoices.map((inv) => (
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
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </AppLayout>
    );
}
