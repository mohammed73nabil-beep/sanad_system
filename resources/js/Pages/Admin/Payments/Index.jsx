import React, { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import AdminLayout from '@/Components/Layout/AdminLayout';
import {
    DollarSign,
    Search,
    Calendar,
    Filter,
    CheckCircle2,
    Trash2,
    TrendingUp,
} from 'lucide-react';

export default function Index({ payments, summary, filters, statuses, methods }) {
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || '');
    const [fromDate, setFromDate] = useState(filters.from_date || '');
    const [toDate, setToDate] = useState(filters.to_date || '');

    const handleSearch = (e) => {
        e.preventDefault();
        router.get('/admin/payments', {
            search,
            status,
            from_date: fromDate,
            to_date: toDate,
        }, { preserveState: true });
    };

    const handleReset = () => {
        setSearch('');
        setStatus('');
        setFromDate('');
        setToDate('');
        router.get('/admin/payments');
    };

    const handleDelete = (payment) => {
        if (confirm(`هل أنت متأكد من حذف هذه الدفعة بقيمة ${payment.amount} ر.س؟`)) {
            router.delete(`/admin/payments/${payment.id}`);
        }
    };

    return (
        <AdminLayout title="سجل المدفوعات والإيرادات">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-black text-white flex items-center gap-2">
                        <DollarSign className="w-6 h-6 text-teal-400" />
                        <span>سجل المدفوعات وإيرادات الاشتراكات</span>
                    </h1>
                    <p className="text-xs text-slate-400 mt-1">
                        تتبع المبالغ المحصلة من الاشتراكات والتجديدات
                    </p>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-sm">
                    <div className="text-xs text-slate-400 font-bold mb-1">إجمالي المبالغ المحصلة</div>
                    <div className="text-2xl font-black text-teal-300 font-mono">
                        {summary.total_paid.toFixed(2)} <span className="text-xs text-slate-400 font-normal">ر.س</span>
                    </div>
                </div>

                <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-sm">
                    <div className="text-xs text-slate-400 font-bold mb-1">إيرادات هذا الشهر</div>
                    <div className="text-2xl font-black text-emerald-400 font-mono">
                        {summary.this_month.toFixed(2)} <span className="text-xs text-slate-400 font-normal">ر.س</span>
                    </div>
                </div>

                <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-sm">
                    <div className="text-xs text-slate-400 font-bold mb-1">مبالغ غير محصلة (معلقة)</div>
                    <div className="text-2xl font-black text-amber-400 font-mono">
                        {summary.total_unpaid.toFixed(2)} <span className="text-xs text-slate-400 font-normal">ر.س</span>
                    </div>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 mb-6">
                <form onSubmit={handleSearch} className="flex flex-wrap items-center gap-3">
                    <div className="relative flex-1 min-w-[200px]">
                        <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="بحث باسم العميل..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl pr-9 pl-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-purple-500"
                        />
                    </div>

                    <div className="min-w-[140px]">
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                        >
                            <option value="">جميع الحالات</option>
                            {Object.entries(statuses).map(([k, v]) => (
                                <option key={k} value={k}>{v}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex items-center gap-2">
                        <input
                            type="date"
                            value={fromDate}
                            onChange={(e) => setFromDate(e.target.value)}
                            className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white font-mono"
                        />
                        <span className="text-slate-400 text-xs">إلى</span>
                        <input
                            type="date"
                            value={toDate}
                            onChange={(e) => setToDate(e.target.value)}
                            className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white font-mono"
                        />
                    </div>

                    <button
                        type="submit"
                        className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold rounded-xl transition-colors"
                    >
                        تصفية
                    </button>

                    {(search || status || fromDate || toDate) && (
                        <button
                            type="button"
                            onClick={handleReset}
                            className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs font-bold rounded-xl transition-colors"
                        >
                            إلغاء التصفية
                        </button>
                    )}
                </form>
            </div>

            {/* Payments Table */}
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-right text-xs">
                        <thead>
                            <tr className="border-b border-slate-700 bg-slate-900/60 text-slate-400 font-bold">
                                <th className="p-4">العميل</th>
                                <th className="p-4">الباقة</th>
                                <th className="p-4">المبلغ</th>
                                <th className="p-4">تاريخ الدفعة</th>
                                <th className="p-4">طريقة الدفع</th>
                                <th className="p-4">رقم المرجع</th>
                                <th className="p-4">الحالة</th>
                                <th className="p-4">سُجل بواسطة</th>
                                <th className="p-4 text-left">حذف</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700/50">
                            {payments.data.length === 0 ? (
                                <tr>
                                    <td colSpan={9} className="text-center py-10 text-slate-400">
                                        لا توجد مدفوعات مسجلة
                                    </td>
                                </tr>
                            ) : (
                                payments.data.map((p) => (
                                    <tr key={p.id} className="hover:bg-slate-750/40">
                                        <td className="p-4">
                                            <div className="font-bold text-white text-sm">{p.user?.name}</div>
                                            <div className="text-[11px] text-slate-400 font-mono">{p.user?.email}</div>
                                        </td>
                                        <td className="p-4 font-semibold text-slate-200">
                                            {p.subscription?.plan?.name || 'مخصص'}
                                        </td>
                                        <td className="p-4 font-bold text-emerald-400 font-mono text-sm">
                                            {Number(p.amount).toFixed(2)} ر.س
                                        </td>
                                        <td className="p-4 font-mono text-slate-300">{p.payment_date}</td>
                                        <td className="p-4 text-slate-300">
                                            {methods[p.payment_method] || p.payment_method}
                                        </td>
                                        <td className="p-4 font-mono text-slate-400">
                                            {p.reference_number || '—'}
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2.5 py-1 rounded-full font-bold text-[11px] ${
                                                p.status === 'paid' ? 'bg-emerald-500/20 text-emerald-300' :
                                                p.status === 'refunded' ? 'bg-rose-500/20 text-rose-300' :
                                                'bg-amber-500/20 text-amber-300'
                                            }`}>
                                                {statuses[p.status] || p.status}
                                            </span>
                                        </td>
                                        <td className="p-4 text-slate-400 text-[11px]">
                                            {p.recorded_by?.name || 'النظام'}
                                        </td>
                                        <td className="p-4 text-left">
                                            <button
                                                type="button"
                                                onClick={() => handleDelete(p)}
                                                className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors"
                                                title="حذف الدفعة"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {payments.links && payments.links.length > 3 && (
                    <div className="p-4 border-t border-slate-700/80 flex items-center justify-between text-xs text-slate-400">
                        <div>
                            عرض {payments.from} إلى {payments.to} من أصل {payments.total} دفعة
                        </div>
                        <div className="flex items-center gap-1">
                            {payments.links.map((link, idx) => (
                                <Link
                                    key={idx}
                                    href={link.url || '#'}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                    className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
                                        link.active
                                            ? 'bg-teal-600 text-white'
                                            : link.url
                                            ? 'bg-slate-700 hover:bg-slate-600 text-slate-200'
                                            : 'opacity-50 cursor-not-allowed text-slate-500'
                                    }`}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
