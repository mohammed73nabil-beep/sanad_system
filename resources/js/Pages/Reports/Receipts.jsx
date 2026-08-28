import React, { useState } from 'react';
import { router, Link } from '@inertiajs/react';
import AppLayout from '@/Components/Layout/AppLayout';
import { Receipt, Eye } from 'lucide-react';

export default function ReceiptsReport({ vouchers, total_amount, filters }) {
    const [fromDate, setFromDate] = useState(filters.from_date || '');
    const [toDate, setToDate] = useState(filters.to_date || '');

    const handleFilter = (e) => {
        e.preventDefault();
        router.get('/reports/receipts', { from_date: fromDate, to_date: toDate }, { preserveState: true });
    };

    const formatMoney = (val) => Number(val || 0).toLocaleString('ar-SA', { minimumFractionDigits: 2 }) + ' ر.س';

    return (
        <AppLayout title="تقرير سندات القبض والمقبوضات">
            <div className="space-y-6">
                <div className="page-header">
                    <div>
                        <h1 className="page-title">
                            <Receipt className="w-7 h-7 text-amber-500" />
                            <span>تقرير سندات القبض والمقبوضات</span>
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

                <div className="stat-card max-w-sm">
                    <div>
                        <div className="stat-value text-emerald-700">{formatMoney(total_amount)}</div>
                        <div className="stat-label">إجمالي المقبوضات بالفترة ({vouchers.length} سند)</div>
                    </div>
                </div>

                <div className="table-container bg-white shadow-xs">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>رقم السند</th>
                                <th>العميل</th>
                                <th>التاريخ</th>
                                <th>الفاتورة المرتبطة</th>
                                <th>المبلغ</th>
                                <th>طريقة الدفع</th>
                                <th>البيان</th>
                            </tr>
                        </thead>
                        <tbody>
                            {vouchers.map((v) => (
                                <tr key={v.id}>
                                    <td className="font-mono font-bold text-xs">
                                        <Link href={`/receipt-vouchers/${v.id}`} className="text-amber-700 hover:underline">
                                            {v.voucher_number}
                                        </Link>
                                    </td>
                                    <td>{v.customer ? v.customer.name : '—'}</td>
                                    <td className="font-mono text-xs">{v.voucher_date}</td>
                                    <td className="font-mono text-xs text-sky-700">{v.invoice?.invoice_number || '—'}</td>
                                    <td className="font-black text-emerald-700">{formatMoney(v.amount)}</td>
                                    <td>{v.payment_method_name}</td>
                                    <td className="text-xs text-slate-500">{v.description || '—'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </AppLayout>
    );
}
