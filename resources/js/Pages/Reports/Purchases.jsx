import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import AppLayout from '@/Components/Layout/AppLayout';
import { ShoppingBag } from 'lucide-react';

export default function PurchasesReport({ report }) {
    const { purchases, count, total_purchases, total_subtotal, total_tax, total_paid, total_remaining, from_date, to_date } = report;
    const [fromDate, setFromDate] = useState(from_date || '');
    const [toDate, setToDate] = useState(to_date || '');

    const handleFilter = (e) => {
        e.preventDefault();
        router.get('/reports/purchases', { from_date: fromDate, to_date: toDate }, { preserveState: true });
    };

    const formatMoney = (val) => Number(val || 0).toLocaleString('ar-SA', { minimumFractionDigits: 2 }) + ' ر.س';

    return (
        <AppLayout title="تقرير المشتريات التفصيلي">
            <div className="space-y-6">
                <div className="page-header">
                    <div>
                        <h1 className="page-title">
                            <ShoppingBag className="w-7 h-7 text-indigo-700" />
                            <span>تقرير المشتريات التفصيلي</span>
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
                            <div className="stat-label">فواتير الشراء المعتمدة</div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div>
                            <div className="stat-value text-indigo-900">{formatMoney(total_purchases)}</div>
                            <div className="stat-label">إجمالي المشتريات</div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div>
                            <div className="stat-value text-emerald-700">{formatMoney(total_paid)}</div>
                            <div className="stat-label">المسدد للموردين</div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div>
                            <div className="stat-value text-red-600">{formatMoney(total_remaining)}</div>
                            <div className="stat-label">المتبقي للموردين</div>
                        </div>
                    </div>
                </div>

                <div className="table-container bg-white shadow-xs">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>رقم الشراء</th>
                                <th>المورد</th>
                                <th>التاريخ</th>
                                <th>المجموع الفرعي</th>
                                <th>الضريبة</th>
                                <th>الإجمالي</th>
                                <th>المدفوع</th>
                                <th>المتبقي</th>
                            </tr>
                        </thead>
                        <tbody>
                            {purchases.map((pur) => (
                                <tr key={pur.id}>
                                    <td className="font-mono font-bold text-xs">{pur.purchase_number}</td>
                                    <td>{pur.supplier ? pur.supplier.name : '—'}</td>
                                    <td className="font-mono text-xs">{pur.purchase_date}</td>
                                    <td>{formatMoney(pur.subtotal)}</td>
                                    <td>{formatMoney(pur.tax_amount)}</td>
                                    <td className="font-bold">{formatMoney(pur.total_amount)}</td>
                                    <td className="text-emerald-700 font-bold">{formatMoney(pur.paid_amount)}</td>
                                    <td className="text-red-600 font-bold">{formatMoney(pur.remaining_amount)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </AppLayout>
    );
}
