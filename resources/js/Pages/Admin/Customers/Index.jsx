import React, { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import AdminLayout from '@/Components/Layout/AdminLayout';
import {
    Users,
    PlusCircle,
    Search,
    Filter,
    Shield,
    LogIn,
    Edit3,
    Ban,
    CheckCircle2,
    Eye,
    CreditCard,
    AlertCircle,
} from 'lucide-react';

export default function Index({ customers, filters, statuses }) {
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || '');

    const handleSearch = (e) => {
        e.preventDefault();
        router.get('/admin/customers', { search, status }, { preserveState: true });
    };

    const handleReset = () => {
        setSearch('');
        setStatus('');
        router.get('/admin/customers');
    };

    const handleToggleStatus = (customer) => {
        const action = customer.is_active ? 'تعطيل' : 'تفعيل';
        if (confirm(`هل أنت متأكد من ${action} حساب العميل "${customer.name}"؟`)) {
            const url = customer.is_active
                ? `/admin/customers/${customer.id}/suspend`
                : `/admin/customers/${customer.id}/activate`;
            router.patch(url);
        }
    };

    const handleImpersonate = (customer) => {
        if (confirm(`هل تريد الدخول إلى لوحة العميل "${customer.name}"؟ سيتم تسجيل هذا الإجراء في سجل العمليات.`)) {
            router.post(`/admin/customers/${customer.id}/impersonate`);
        }
    };

    return (
        <AdminLayout title="إدارة العملاء والمنشآت">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-black text-white flex items-center gap-2">
                        <Users className="w-6 h-6 text-emerald-400" />
                        <span>إدارة العملاء والمنشآت</span>
                    </h1>
                    <p className="text-xs text-slate-400 mt-1">
                        عرض وإدارة حسابات العملاء، باقاتهم واشتراكاتهم، والتحكم في صلاحيات الوصول
                    </p>
                </div>
                <Link
                    href="/admin/customers/create"
                    className="btn bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 text-sm self-start"
                >
                    <PlusCircle className="w-4 h-4" />
                    <span>+ إضافة عميل جديد</span>
                </Link>
            </div>

            {/* Filter Bar */}
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 mb-6">
                <form onSubmit={handleSearch} className="flex flex-wrap items-center gap-3">
                    <div className="relative flex-1 min-w-[220px]">
                        <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="بحث بالاسم أو البريد الإلكتروني..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl pr-9 pl-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-purple-500"
                        />
                    </div>

                    <div className="min-w-[160px]">
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                        >
                            <option value="">جميع حالات الاشتراك</option>
                            {Object.entries(statuses).map(([key, label]) => (
                                <option key={key} value={key}>{label}</option>
                            ))}
                        </select>
                    </div>

                    <button
                        type="submit"
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl transition-colors"
                    >
                        تطبيق الفلتر
                    </button>

                    {(search || status) && (
                        <button
                            type="button"
                            onClick={handleReset}
                            className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs font-bold rounded-xl transition-colors"
                        >
                            إلغاء الفلتر
                        </button>
                    )}
                </form>
            </div>

            {/* Table */}
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-right text-xs">
                        <thead>
                            <tr className="border-b border-slate-700 bg-slate-900/60 text-slate-400 font-bold">
                                <th className="p-4">المنشأة / العميل</th>
                                <th className="p-4">البريد الإلكتروني</th>
                                <th className="p-4">حالة الحساب</th>
                                <th className="p-4">الباقة الحالية</th>
                                <th className="p-4">حالة الاشتراك</th>
                                <th className="p-4">استخدام الفواتير</th>
                                <th className="p-4">تاريخ الانتهاء</th>
                                <th className="p-4 text-left">الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700/50">
                            {customers.data.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="text-center py-10 text-slate-400">
                                        لا يوجد عملاء يطابقون خيارات البحث
                                    </td>
                                </tr>
                            ) : (
                                customers.data.map((c) => (
                                    <tr key={c.id} className="hover:bg-slate-750/40">
                                        <td className="p-4">
                                            <div className="font-bold text-white text-sm">{c.name}</div>
                                            {c.phone && <div className="text-[11px] text-slate-400 font-mono mt-0.5">{c.phone}</div>}
                                        </td>
                                        <td className="p-4 text-slate-300 font-mono">{c.email}</td>
                                        <td className="p-4">
                                            <span className={`px-2.5 py-1 rounded-full font-bold text-[11px] inline-flex items-center gap-1 ${
                                                c.is_active ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                                            }`}>
                                                {c.is_active ? (
                                                    <>
                                                        <CheckCircle2 className="w-3 h-3" />
                                                        <span>نشط</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Ban className="w-3 h-3" />
                                                        <span>معطل</span>
                                                    </>
                                                )}
                                            </span>
                                        </td>
                                        <td className="p-4 font-semibold text-slate-200">
                                            {c.subscription ? c.subscription.plan_name : <span className="text-slate-500">لا توجد باقة</span>}
                                        </td>
                                        <td className="p-4">
                                            {c.subscription ? (
                                                <span className={`px-2.5 py-1 rounded-full font-bold text-[11px] ${
                                                    c.subscription.status === 'active' ? 'bg-emerald-500/20 text-emerald-300' :
                                                    c.subscription.status === 'trial'  ? 'bg-amber-500/20 text-amber-300' :
                                                    c.subscription.status === 'expired'? 'bg-rose-500/20 text-rose-300' :
                                                    'bg-slate-700 text-slate-300'
                                                }`}>
                                                    {c.subscription.status_label}
                                                </span>
                                            ) : (
                                                <span className="text-slate-500">—</span>
                                            )}
                                        </td>
                                        <td className="p-4">
                                            {c.subscription ? (
                                                <div>
                                                    <div className="font-bold text-white font-mono">
                                                        {c.subscription.invoices_used} / {c.subscription.invoice_limit}
                                                    </div>
                                                    <div className="w-24 bg-slate-700 rounded-full h-1.5 mt-1 overflow-hidden">
                                                        <div
                                                            className={`h-full rounded-full ${
                                                                (c.subscription.invoices_used / c.subscription.invoice_limit) >= 1 ? 'bg-rose-500' :
                                                                (c.subscription.invoices_used / c.subscription.invoice_limit) >= 0.8 ? 'bg-amber-500' : 'bg-emerald-500'
                                                            }`}
                                                            style={{ width: `${Math.min(100, (c.subscription.invoices_used / c.subscription.invoice_limit) * 100)}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="text-slate-500">—</span>
                                            )}
                                        </td>
                                        <td className="p-4 font-mono text-slate-300">
                                            {c.subscription ? (
                                                <div>
                                                    <div>{c.subscription.end_date}</div>
                                                    <div className="text-[10px] text-slate-400">({c.subscription.days_remaining} يوم متبقٍ)</div>
                                                </div>
                                            ) : (
                                                '—'
                                            )}
                                        </td>
                                        <td className="p-4 text-left">
                                            <div className="flex items-center justify-end gap-1.5">
                                                {/* Impersonate */}
                                                <button
                                                    type="button"
                                                    onClick={() => handleImpersonate(c)}
                                                    className="p-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white transition-colors"
                                                    title="الدخول إلى لوحة العميل"
                                                >
                                                    <LogIn className="w-4 h-4" />
                                                </button>

                                                {/* Create Subscription */}
                                                <Link
                                                    href={`/admin/subscriptions/create?customer_id=${c.id}`}
                                                    className="p-1.5 rounded-lg bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white transition-colors"
                                                    title="إنشاء اشتراك"
                                                >
                                                    <CreditCard className="w-4 h-4" />
                                                </Link>

                                                {/* Show */}
                                                <Link
                                                    href={`/admin/customers/${c.id}`}
                                                    className="p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 transition-colors"
                                                    title="عرض التفاصيل"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </Link>

                                                {/* Edit */}
                                                <Link
                                                    href={`/admin/customers/${c.id}/edit`}
                                                    className="p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 transition-colors"
                                                    title="تعديل"
                                                >
                                                    <Edit3 className="w-4 h-4" />
                                                </Link>

                                                {/* Toggle Status */}
                                                <button
                                                    type="button"
                                                    onClick={() => handleToggleStatus(c)}
                                                    className={`p-1.5 rounded-lg transition-colors ${
                                                        c.is_active
                                                            ? 'bg-rose-500/20 hover:bg-rose-600 text-rose-300 hover:text-white'
                                                            : 'bg-emerald-500/20 hover:bg-emerald-600 text-emerald-300 hover:text-white'
                                                    }`}
                                                    title={c.is_active ? 'تعطيل الحساب' : 'تفعيل الحساب'}
                                                >
                                                    {c.is_active ? <Ban className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {customers.links && customers.links.length > 3 && (
                    <div className="p-4 border-t border-slate-700/80 flex items-center justify-between text-xs text-slate-400">
                        <div>
                            عرض {customers.from} إلى {customers.to} من أصل {customers.total} عميل
                        </div>
                        <div className="flex items-center gap-1">
                            {customers.links.map((link, idx) => (
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
