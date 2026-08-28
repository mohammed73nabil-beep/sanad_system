import React, { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import AppLayout from '@/Components/Layout/AppLayout';
import {
    Receipt,
    Search,
    Download,
    Eye,
    FileText,
    Calendar,
    User,
} from 'lucide-react';

export default function ReceiptVouchersIndex({ vouchers, customers, filters, summary }) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [selectedCustomer, setSelectedCustomer] = useState(filters.customer_id || '');
    const [fromDate, setFromDate] = useState(filters.from_date || '');
    const [toDate, setToDate] = useState(filters.to_date || '');

    const handleFilter = (e) => {
        if (e) e.preventDefault();
        router.get('/receipt-vouchers', {
            search: searchTerm,
            customer_id: selectedCustomer,
            from_date: fromDate,
            to_date: toDate,
        }, { preserveState: true });
    };

    const formatMoney = (val) => {
        return Number(val || 0).toLocaleString('ar-SA', { minimumFractionDigits: 2 }) + ' ر.س';
    };

    return (
        <AppLayout title="سجل سندات القبض">
            <div className="space-y-6">
                <div className="page-header">
                    <div>
                        <h1 className="page-title">
                            <Receipt className="w-7 h-7 text-amber-500" />
                            <span>سندات القبض</span>
                        </h1>
                        <p className="page-subtitle">
                            سجل المقبوضات المالية من العملاء، إيصالات السداد، وتحميل السندات بصيغة PDF
                        </p>
                    </div>
                </div>

                {/* Summary */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="stat-card">
                        <div>
                            <div className="stat-value text-slate-800">{summary.total_vouchers}</div>
                            <div className="stat-label">عدد سندات القبض الصادرة</div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div>
                            <div className="stat-value text-emerald-700">{formatMoney(summary.total_amount)}</div>
                            <div className="stat-label">إجمالي المبالغ المقبوضة</div>
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
                                placeholder="بحث برقم السند، العميل، أو الفاتورة..."
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
                            value={selectedCustomer}
                            onChange={(e) => {
                                setSelectedCustomer(e.target.value);
                                router.get('/receipt-vouchers', { search: searchTerm, customer_id: e.target.value, from_date: fromDate, to_date: toDate }, { preserveState: true });
                            }}
                        >
                            <option value="">جميع العملاء</option>
                            {customers.map((c) => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Table */}
                <div className="table-container bg-white shadow-xs">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>رقم السند</th>
                                <th>العميل</th>
                                <th>التاريخ</th>
                                <th>الفاتورة المرتبطة</th>
                                <th>المبلغ المقبوض</th>
                                <th>طريقة الدفع</th>
                                <th>البيان</th>
                                <th>الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {vouchers.data.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="text-center py-10 text-slate-400">
                                        لا توجد سندات قبض مسجلة حتى الآن.
                                    </td>
                                </tr>
                            ) : (
                                vouchers.data.map((v) => (
                                    <tr key={v.id}>
                                        <td>
                                            <Link href={`/receipt-vouchers/${v.id}`} className="font-mono font-bold text-amber-700 hover:underline">
                                                {v.voucher_number}
                                            </Link>
                                        </td>
                                        <td>
                                            <div className="font-bold text-slate-900">{v.customer ? v.customer.name : '—'}</div>
                                        </td>
                                        <td className="font-mono text-xs">{v.voucher_date}</td>
                                        <td>
                                            {v.invoice ? (
                                                <Link href={`/invoices/${v.invoice.id}`} className="font-mono text-xs text-sky-700 hover:underline font-bold">
                                                    {v.invoice.invoice_number}
                                                </Link>
                                            ) : '—'}
                                        </td>
                                        <td className="font-black text-emerald-700">{formatMoney(v.amount)}</td>
                                        <td>
                                            <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-semibold">
                                                {v.payment_method_name}
                                            </span>
                                        </td>
                                        <td className="text-xs text-slate-500 truncate max-w-xs">{v.description || '—'}</td>
                                        <td>
                                            <div className="flex items-center gap-1.5 justify-center">
                                                <Link
                                                    href={`/receipt-vouchers/${v.id}`}
                                                    className="p-1.5 text-slate-600 hover:text-amber-700 rounded-lg hover:bg-slate-100"
                                                    title="عرض السند"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </Link>
                                                <a
                                                    href={`/receipt-vouchers/${v.id}/pdf`}
                                                    target="_blank"
                                                    className="p-1.5 text-slate-600 hover:text-emerald-700 rounded-lg hover:bg-slate-100"
                                                    title="تحميل PDF"
                                                >
                                                    <Download className="w-4 h-4" />
                                                </a>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {vouchers.links && vouchers.links.length > 3 && (
                    <div className="flex justify-center gap-1 py-4">
                        {vouchers.links.map((link, i) => (
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
