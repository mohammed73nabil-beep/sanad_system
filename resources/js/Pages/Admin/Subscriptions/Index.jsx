import React, { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import AdminLayout from '@/Components/Layout/AdminLayout';
import {
    CreditCard,
    PlusCircle,
    Search,
    Filter,
    Eye,
    Edit3,
    CheckCircle2,
    Ban,
    Clock,
    XCircle,
    Calendar,
} from 'lucide-react';

export default function Index({ subscriptions, plans, statuses, filters }) {
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || '');
    const [planId, setPlanId] = useState(filters.plan_id || '');

    const handleSearch = (e) => {
        e.preventDefault();
        router.get('/admin/subscriptions', { search, status, plan_id: planId }, { preserveState: true });
    };

    const handleReset = () => {
        setSearch('');
        setStatus('');
        setPlanId('');
        router.get('/admin/subscriptions');
    };

    return (
        <AdminLayout title="إدارة الاشتراكات">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-black text-white flex items-center gap-2">
                        <CreditCard className="w-6 h-6 text-purple-400" />
                        <span>إدارة الاشتراكات</span>
                    </h1>
                    <p className="text-xs text-slate-400 mt-1">
                        متابعة اشتراكات العملاء، تفعيل وتعليق الاشتراكات، التمديد، ومراقبة حدود الاستخدام
                    </p>
                </div>
                <Link
                    href="/admin/subscriptions/create"
                    className="btn bg-purple-600 hover:bg-purple-500 text-white font-bold px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 text-sm self-start"
                >
                    <PlusCircle className="w-4 h-4" />
                    <span>+ إنشاء اشتراك جديد</span>
                </Link>
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

                    <div className="min-w-[150px]">
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                        >
                            <option value="">جميع الحالات</option>
                            {Object.entries(statuses).map(([key, label]) => (
                                <option key={key} value={key}>{label}</option>
                            ))}
                        </select>
                    </div>

                    <div className="min-w-[150px]">
                        <select
                            value={planId}
                            onChange={(e) => setPlanId(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                        >
                            <option value="">جميع الباقات</option>
                            {plans.map((p) => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </select>
                    </div>

                    <button
                        type="submit"
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl transition-colors"
                    >
                        تصفية
                    </button>

                    {(search || status || planId) && (
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

            {/* Subscriptions Table */}
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-right text-xs">
                        <thead>
                            <tr className="border-b border-slate-700 bg-slate-900/60 text-slate-400 font-bold">
                                <th className="p-4">العميل</th>
                                <th className="p-4">الباقة</th>
                                <th className="p-4">الحالة</th>
                                <th className="p-4">تاريخ البداية</th>
                                <th className="p-4">تاريخ الانتهاء</th>
                                <th className="p-4">الفواتير المستخدمة</th>
                                <th className="p-4">السعر</th>
                                <th className="p-4">حالة الدفع</th>
                                <th className="p-4 text-left">الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700/50">
                            {subscriptions.data.length === 0 ? (
                                <tr>
                                    <td colSpan={9} className="text-center py-10 text-slate-400">
                                        لا توجد اشتراكات مسجلة
                                    </td>
                                </tr>
                            ) : (
                                subscriptions.data.map((sub) => (
                                    <tr key={sub.id} className="hover:bg-slate-750/40">
                                        <td className="p-4">
                                            <div className="font-bold text-white text-sm">{sub.user?.name}</div>
                                            <div className="text-[11px] text-slate-400 font-mono">{sub.user?.email}</div>
                                        </td>
                                        <td className="p-4 font-semibold text-slate-200">
                                            {sub.plan?.name || <span className="text-slate-500">اشتراك مخصص</span>}
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2.5 py-1 rounded-full font-bold text-[11px] ${
                                                sub.status === 'active'    ? 'bg-emerald-500/20 text-emerald-300' :
                                                sub.status === 'trial'     ? 'bg-amber-500/20 text-amber-300' :
                                                sub.status === 'expired'   ? 'bg-rose-500/20 text-rose-300' :
                                                sub.status === 'suspended' ? 'bg-orange-500/20 text-orange-300' :
                                                'bg-slate-700 text-slate-300'
                                            }`}>
                                                {statuses[sub.status] || sub.status}
                                            </span>
                                        </td>
                                        <td className="p-4 font-mono text-slate-300">{sub.start_date}</td>
                                        <td className="p-4 font-mono text-slate-300">{sub.end_date}</td>
                                        <td className="p-4">
                                            <div className="font-bold text-white font-mono">
                                                {sub.invoices_used} / {sub.invoice_limit}
                                            </div>
                                        </td>
                                        <td className="p-4 font-bold text-emerald-400 font-mono">
                                            {sub.price} ر.س
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                                                sub.payment_status === 'paid' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                                            }`}>
                                                {sub.payment_status === 'paid' ? 'مدفوع' : 'غير مدفوع'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-left">
                                            <div className="flex items-center justify-end gap-1.5">
                                                <Link
                                                    href={`/admin/subscriptions/${sub.id}`}
                                                    className="p-1.5 rounded-lg bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white transition-colors"
                                                    title="عرض تفاصيل الاشتراك والتمديد"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </Link>
                                                <Link
                                                    href={`/admin/subscriptions/${sub.id}/edit`}
                                                    className="p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 transition-colors"
                                                    title="تعديل حد الفواتير والتاريخ"
                                                >
                                                    <Edit3 className="w-4 h-4" />
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {subscriptions.links && subscriptions.links.length > 3 && (
                    <div className="p-4 border-t border-slate-700/80 flex items-center justify-between text-xs text-slate-400">
                        <div>
                            عرض {subscriptions.from} إلى {subscriptions.to} من أصل {subscriptions.total} اشتراك
                        </div>
                        <div className="flex items-center gap-1">
                            {subscriptions.links.map((link, idx) => (
                                <Link
                                    key={idx}
                                    href={link.url || '#'}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                    className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
                                        link.active
                                            ? 'bg-purple-600 text-white'
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
