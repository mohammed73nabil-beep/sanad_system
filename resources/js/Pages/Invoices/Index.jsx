import React, { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import AppLayout from '@/Components/Layout/AppLayout';
import Badge from '@/Components/UI/Badge';
import {
    FileText,
    Plus,
    Search,
    Filter,
    Download,
    Printer,
    Eye,
    ChevronDown,
} from 'lucide-react';

export default function InvoicesIndex({ invoices, customers, filters, summary }) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [selectedStatus, setSelectedStatus] = useState(filters.status || '');
    const [selectedCustomer, setSelectedCustomer] = useState(filters.customer_id || '');
    const [fromDate, setFromDate] = useState(filters.from_date || '');
    const [toDate, setToDate] = useState(filters.to_date || '');

    const handleFilter = (e) => {
        if (e) e.preventDefault();
        router.get('/invoices', {
            search: searchTerm,
            status: selectedStatus,
            customer_id: selectedCustomer,
            from_date: fromDate,
            to_date: toDate,
        }, { preserveState: true });
    };

    const formatMoney = (val) => {
        return Number(val || 0).toLocaleString('ar-SA', { minimumFractionDigits: 2 }) + ' ر.س';
    };

    return (
        <AppLayout title="سجل فواتير المبيعات">
            <div className="space-y-6">
                <div className="page-header">
                    <div>
                        <h1 className="page-title">
                            <FileText className="w-7 h-7 text-sky-700" />
                            <span>فواتير المبيعات</span>
                        </h1>
                        <p className="page-subtitle">
                            إدارة وإصدار الفواتير الضريبية، متابعة السداد، وتحميل المستندات PDF
                        </p>
                    </div>

                    <Link
                        href="/invoices/create"
                        className="btn btn-primary flex items-center gap-1.5 shadow-sm"
                    >
                        <Plus className="w-5 h-5" />
                        <span>+ إنشاء فاتورة جديدة</span>
                    </Link>
                </div>

                {/* Summary KPIs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="stat-card">
                        <div>
                            <div className="stat-value text-slate-800">{summary.total_invoices}</div>
                            <div className="stat-label">عدد الفواتير الصادرة</div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div>
                            <div className="stat-value text-sky-900">{formatMoney(summary.total_sales)}</div>
                            <div className="stat-label">إجمالي المبيعات</div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div>
                            <div className="stat-value text-emerald-700">{formatMoney(summary.total_paid)}</div>
                            <div className="stat-label">إجمالي المحصل</div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div>
                            <div className="stat-value text-red-600">{formatMoney(summary.total_due)}</div>
                            <div className="stat-label">إجمالي المتبقي غير المسدد</div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="card !p-4 flex flex-col md:flex-row gap-3 items-center justify-between">
                    <form onSubmit={handleFilter} className="flex gap-2 w-full md:w-80">
                        <div className="relative flex-1">
                            <input
                                type="text"
                                className="input pr-9 text-sm"
                                placeholder="بحث برقم الفاتورة أو اسم العميل..."
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
                            className="input !py-1.5 !px-2.5 text-xs w-36"
                            value={selectedStatus}
                            onChange={(e) => {
                                setSelectedStatus(e.target.value);
                                router.get('/invoices', { search: searchTerm, status: e.target.value, customer_id: selectedCustomer, from_date: fromDate, to_date: toDate }, { preserveState: true });
                            }}
                        >
                            <option value="">جميع الحالات</option>
                            <option value="issued">صادرة</option>
                            <option value="partially_paid">مدفوعة جزئياً</option>
                            <option value="paid">مدفوعة بالكامل</option>
                            <option value="overdue">متأخرة</option>
                            <option value="draft">مسودة</option>
                            <option value="cancelled">ملغاة</option>
                        </select>

                        <select
                            className="input !py-1.5 !px-2.5 text-xs w-40"
                            value={selectedCustomer}
                            onChange={(e) => {
                                setSelectedCustomer(e.target.value);
                                router.get('/invoices', { search: searchTerm, status: selectedStatus, customer_id: e.target.value, from_date: fromDate, to_date: toDate }, { preserveState: true });
                            }}
                        >
                            <option value="">جميع العملاء</option>
                            {customers.map((c) => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Invoices Table */}
                <div className="table-container bg-white shadow-xs">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>رقم الفاتورة</th>
                                <th>العميل / المحل</th>
                                <th>تاريخ الإصدار</th>
                                <th>المجموع شامل الضريبة</th>
                                <th>المدفوع</th>
                                <th>المتبقي</th>
                                <th>حالة السداد</th>
                                <th>الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoices.data.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="text-center py-10 text-slate-400">
                                        لا توجد فواتير مبيعات مسجلة حتى الآن.
                                    </td>
                                </tr>
                            ) : (
                                invoices.data.map((inv) => (
                                    <tr key={inv.id}>
                                        <td>
                                            <Link href={`/invoices/${inv.id}`} className="font-mono font-bold text-sky-800 hover:underline">
                                                {inv.invoice_number}
                                            </Link>
                                        </td>
                                        <td>
                                            <div className="font-bold text-slate-900">{inv.customer ? inv.customer.name : '—'}</div>
                                            {inv.customer && inv.customer.phone && (
                                                <div className="text-xs text-slate-400">{inv.customer.phone}</div>
                                            )}
                                        </td>
                                        <td className="font-mono text-xs">{inv.issue_date}</td>
                                        <td className="font-black text-slate-900">{formatMoney(inv.total_amount)}</td>
                                        <td className="font-bold text-emerald-700">{formatMoney(inv.paid_amount)}</td>
                                        <td>
                                            <span className={`font-black ${inv.remaining_amount > 0 ? 'text-red-600' : 'text-slate-400'}`}>
                                                {formatMoney(inv.remaining_amount)}
                                            </span>
                                        </td>
                                        <td>
                                            <Badge status={inv.status} text={inv.status_name} />
                                        </td>
                                        <td>
                                            <div className="flex items-center gap-1.5 justify-center">
                                                <Link
                                                    href={`/invoices/${inv.id}`}
                                                    className="p-1.5 text-slate-600 hover:text-sky-700 rounded-lg hover:bg-slate-100"
                                                    title="عرض الفاتورة"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </Link>
                                                <a
                                                    href={`/invoices/${inv.id}/pdf`}
                                                    target="_blank"
                                                    className="p-1.5 text-slate-600 hover:text-emerald-700 rounded-lg hover:bg-slate-100"
                                                    title="تحميل PDF"
                                                >
                                                    <Download className="w-4 h-4" />
                                                </a>
                                                <a
                                                    href={`/invoices/${inv.id}/print`}
                                                    target="_blank"
                                                    className="p-1.5 text-slate-600 hover:text-indigo-700 rounded-lg hover:bg-slate-100"
                                                    title="طباعة مباشرة"
                                                >
                                                    <Printer className="w-4 h-4" />
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
                {invoices.links && invoices.links.length > 3 && (
                    <div className="flex justify-center gap-1 py-4">
                        {invoices.links.map((link, i) => (
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
