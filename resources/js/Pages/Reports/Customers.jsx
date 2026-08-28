import React from 'react';
import { Link } from '@inertiajs/react';
import AppLayout from '@/Components/Layout/AppLayout';
import { Users, FileText } from 'lucide-react';

export default function CustomersReport({ customers, summary }) {
    const formatMoney = (val) => Number(val || 0).toLocaleString('ar-SA', { minimumFractionDigits: 2 }) + ' ر.س';

    return (
        <AppLayout title="تقرير أرصدة ومبيعات العملاء">
            <div className="space-y-6">
                <div className="page-header">
                    <div>
                        <h1 className="page-title">
                            <Users className="w-7 h-7 text-sky-700" />
                            <span>تقرير أرصدة ومبيعات العملاء الشامل</span>
                        </h1>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="stat-card">
                        <div>
                            <div className="stat-value text-sky-900">{formatMoney(summary.total_sales)}</div>
                            <div className="stat-label">إجمالي المبيعات لجميع العملاء</div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div>
                            <div className="stat-value text-emerald-700">{formatMoney(summary.total_paid)}</div>
                            <div className="stat-label">إجمالي المبالغ المحصلة</div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div>
                            <div className="stat-value text-red-600">{formatMoney(summary.total_remaining)}</div>
                            <div className="stat-label">إجمالي الأرصدة المتبقية المستحقة</div>
                        </div>
                    </div>
                </div>

                <div className="table-container bg-white shadow-xs">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>اسم العميل / المحل</th>
                                <th>الجوال</th>
                                <th>إجمالي المبيعات</th>
                                <th>المسدد</th>
                                <th>المتبقي (المديونية)</th>
                                <th>كشف الحساب</th>
                            </tr>
                        </thead>
                        <tbody>
                            {customers.map((c) => (
                                <tr key={c.id}>
                                    <td className="font-bold text-slate-900">{c.name}</td>
                                    <td className="font-mono text-xs">{c.phone || '—'}</td>
                                    <td className="font-bold">{formatMoney(c.total_sales)}</td>
                                    <td className="text-emerald-700 font-bold">{formatMoney(c.total_paid)}</td>
                                    <td className={`font-black ${c.total_remaining > 0 ? 'text-red-600' : 'text-slate-400'}`}>
                                        {formatMoney(c.total_remaining)}
                                    </td>
                                    <td>
                                        <Link href={`/customers/${c.id}/statement`} className="btn btn-sm btn-secondary !py-1 !px-2 text-xs flex items-center gap-1 inline-flex">
                                            <FileText className="w-3.5 h-3.5" />
                                            <span>كشف الحساب</span>
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </AppLayout>
    );
}
