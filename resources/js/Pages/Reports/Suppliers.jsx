import React from 'react';
import AppLayout from '@/Components/Layout/AppLayout';
import { Truck } from 'lucide-react';

export default function SuppliersReport({ suppliers, summary }) {
    const formatMoney = (val) => Number(val || 0).toLocaleString('ar-SA', { minimumFractionDigits: 2 }) + ' ر.س';

    return (
        <AppLayout title="تقرير حسابات الموردين">
            <div className="space-y-6">
                <div className="page-header">
                    <div>
                        <h1 className="page-title">
                            <Truck className="w-7 h-7 text-indigo-700" />
                            <span>تقرير مشتريات وحسابات الموردين الشامل</span>
                        </h1>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="stat-card">
                        <div>
                            <div className="stat-value text-indigo-900">{formatMoney(summary.total_purchases)}</div>
                            <div className="stat-label">إجمالي المشتريات من الموردين</div>
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
                            <div className="stat-value text-red-600">{formatMoney(summary.total_remaining)}</div>
                            <div className="stat-label">إجمالي المتبقي للموردين</div>
                        </div>
                    </div>
                </div>

                <div className="table-container bg-white shadow-xs">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>اسم المورد</th>
                                <th>الجوال</th>
                                <th>إجمالي المشتريات</th>
                                <th>المسدد</th>
                                <th>المتبقي له</th>
                            </tr>
                        </thead>
                        <tbody>
                            {suppliers.map((s) => (
                                <tr key={s.id}>
                                    <td className="font-bold text-slate-900">{s.name}</td>
                                    <td className="font-mono text-xs">{s.phone || '—'}</td>
                                    <td className="font-bold">{formatMoney(s.total_purchases)}</td>
                                    <td className="text-emerald-700 font-bold">{formatMoney(s.total_paid)}</td>
                                    <td className="font-black text-red-600">{formatMoney(s.total_remaining)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </AppLayout>
    );
}
