import React from 'react';
import { Link, router } from '@inertiajs/react';
import AdminLayout from '@/Components/Layout/AdminLayout';
import {
    Users,
    Building2,
    CreditCard,
    PlusCircle,
    ArrowRight,
    LogIn,
    Edit3,
    Ban,
    CheckCircle2,
    Clock,
    FileText,
    DollarSign,
    Shield,
} from 'lucide-react';

export default function Show({ customer, invoice_count }) {
    const handleToggleStatus = () => {
        const action = customer.is_active ? 'تعطيل' : 'تفعيل';
        if (confirm(`هل أنت متأكد من ${action} حساب العميل "${customer.name}"؟`)) {
            const url = customer.is_active
                ? `/admin/customers/${customer.id}/suspend`
                : `/admin/customers/${customer.id}/activate`;
            router.patch(url);
        }
    };

    const handleImpersonate = () => {
        if (confirm(`هل تريد الدخول إلى لوحة العميل "${customer.name}"؟ سيتم تسجيل هذا الإجراء في سجل العمليات.`)) {
            router.post(`/admin/customers/${customer.id}/impersonate`);
        }
    };

    const sub = customer.latest_subscription;
    const company = customer.company_setting;

    return (
        <AdminLayout title={`تفاصيل العميل: ${customer.name}`}>
            {/* Top Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                    <Link
                        href="/admin/customers"
                        className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl transition-colors border border-slate-700"
                        title="عودة لقائمة العملاء"
                    >
                        <ArrowRight className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-black text-white flex items-center gap-2">
                            <span>{customer.name}</span>
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                customer.is_active ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                            }`}>
                                {customer.is_active ? 'حساب نشط' : 'حساب معطل'}
                            </span>
                        </h1>
                        <p className="text-xs text-slate-400 font-mono mt-0.5">
                            {customer.email} {customer.phone && `• ${customer.phone}`} • مسجل منذ {customer.created_at?.substring(0, 10)}
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <button
                        type="button"
                        onClick={handleImpersonate}
                        className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-lg transition-colors"
                    >
                        <LogIn className="w-4 h-4" />
                        <span>الدخول إلى لوحة العميل</span>
                    </button>

                    <Link
                        href={`/admin/subscriptions/create?customer_id=${customer.id}`}
                        className="px-3.5 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-lg transition-colors"
                    >
                        <PlusCircle className="w-4 h-4" />
                        <span>+ اشتراك جديد</span>
                    </Link>

                    <Link
                        href={`/admin/customers/${customer.id}/edit`}
                        className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors border border-slate-700"
                    >
                        <Edit3 className="w-4 h-4" />
                        <span>تعديل</span>
                    </Link>

                    <button
                        type="button"
                        onClick={handleToggleStatus}
                        className={`px-3 py-2 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors border ${
                            customer.is_active
                                ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border-rose-500/30'
                                : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                        }`}
                    >
                        {customer.is_active ? (
                            <>
                                <Ban className="w-4 h-4" />
                                <span>تعطيل</span>
                            </>
                        ) : (
                            <>
                                <CheckCircle2 className="w-4 h-4" />
                                <span>تفعيل</span>
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4">
                    <div className="text-xs text-slate-400 font-bold mb-1">إجمالي الفواتير الصادرة</div>
                    <div className="text-2xl font-black text-white">{invoice_count}</div>
                </div>
                <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4">
                    <div className="text-xs text-slate-400 font-bold mb-1">الباقة الحالية</div>
                    <div className="text-lg font-bold text-purple-300">
                        {sub?.plan?.name || <span className="text-slate-500">لا يوجد</span>}
                    </div>
                </div>
                <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4">
                    <div className="text-xs text-slate-400 font-bold mb-1">حالة الاشتراك</div>
                    <div className="text-lg font-bold text-emerald-400">
                        {sub ? sub.status_label : <span className="text-slate-500">غير نشط</span>}
                    </div>
                </div>
                <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4">
                    <div className="text-xs text-slate-400 font-bold mb-1">تاريخ الانتهاء</div>
                    <div className="text-base font-bold text-slate-200 font-mono">
                        {sub ? sub.end_date : '—'}
                    </div>
                </div>
            </div>

            {/* Main Info Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Company Details */}
                <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6">
                    <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2 border-b border-slate-700 pb-3">
                        <Building2 className="w-5 h-5 text-emerald-400" />
                        <span>بيانات المنشأة التجارية</span>
                    </h2>

                    {company ? (
                        <div className="space-y-3 text-xs">
                            <div className="flex justify-between py-1.5 border-b border-slate-750">
                                <span className="text-slate-400 font-bold">اسم المنشأة:</span>
                                <span className="text-white font-semibold">{company.name}</span>
                            </div>
                            <div className="flex justify-between py-1.5 border-b border-slate-750">
                                <span className="text-slate-400 font-bold">السجل التجاري:</span>
                                <span className="text-white font-mono">{company.commercial_register || '—'}</span>
                            </div>
                            <div className="flex justify-between py-1.5 border-b border-slate-750">
                                <span className="text-slate-400 font-bold">الرقم الضريبي:</span>
                                <span className="text-white font-mono">{company.tax_number || '—'}</span>
                            </div>
                            <div className="flex justify-between py-1.5 border-b border-slate-750">
                                <span className="text-slate-400 font-bold">المدينة:</span>
                                <span className="text-white">{company.city || '—'}</span>
                            </div>
                            <div className="flex justify-between py-1.5">
                                <span className="text-slate-400 font-bold">العنوان:</span>
                                <span className="text-white">{company.address || '—'}</span>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-6 text-slate-400 text-xs">
                            لم يتم إدخال بيانات المنشأة بعد
                        </div>
                    )}
                </div>

                {/* Current Subscription Progress */}
                <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6">
                    <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2 border-b border-slate-700 pb-3">
                        <CreditCard className="w-5 h-5 text-purple-400" />
                        <span>الاشتراك الحالي</span>
                    </h2>

                    {sub ? (
                        <div className="space-y-4 text-xs">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-bold text-white">{sub.plan?.name || 'اشتراك مخصص'}</span>
                                <span className="px-2.5 py-1 rounded-full font-bold text-[11px] bg-purple-500/20 text-purple-300">
                                    {sub.price} ر.س
                                </span>
                            </div>

                            <div>
                                <div className="flex justify-between text-slate-300 mb-1.5">
                                    <span>الفواتير المصدرة خلال فترة الاشتراك:</span>
                                    <span className="font-bold font-mono">{sub.invoices_used} من أصل {sub.invoice_limit}</span>
                                </div>
                                <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
                                    <div
                                        className={`h-full rounded-full ${
                                            (sub.invoices_used / sub.invoice_limit) >= 1 ? 'bg-rose-500' :
                                            (sub.invoices_used / sub.invoice_limit) >= 0.8 ? 'bg-amber-500' : 'bg-emerald-500'
                                        }`}
                                        style={{ width: `${Math.min(100, (sub.invoices_used / sub.invoice_limit) * 100)}%` }}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-750">
                                <div>
                                    <div className="text-slate-400 text-[11px]">تاريخ البداية:</div>
                                    <div className="text-white font-mono font-bold mt-0.5">{sub.start_date}</div>
                                </div>
                                <div>
                                    <div className="text-slate-400 text-[11px]">تاريخ الانتهاء:</div>
                                    <div className="text-white font-mono font-bold mt-0.5">{sub.end_date}</div>
                                </div>
                            </div>

                            <div className="pt-2 flex items-center justify-between">
                                <Link
                                    href={`/admin/subscriptions/${sub.id}`}
                                    className="text-purple-400 hover:text-purple-300 font-bold"
                                >
                                    عرض وإدارة الاشتراك ←
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-6 text-slate-400 text-xs">
                            لا يوجد اشتراك حالي لهذا العميل
                            <div className="mt-3">
                                <Link
                                    href={`/admin/subscriptions/create?customer_id=${customer.id}`}
                                    className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-xs inline-flex items-center gap-1.5"
                                >
                                    + إنشاء اشتراك الآن
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Subscriptions History Table */}
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6">
                <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-amber-400" />
                    <span>سجل الاشتراكات السابقة للعميل</span>
                </h2>

                {customer.subscriptions.length === 0 ? (
                    <div className="text-center py-8 text-slate-400 text-xs">
                        لا توجد اشتراكات مسجلة في السجل
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-right text-xs">
                            <thead>
                                <tr className="border-b border-slate-700 text-slate-400 font-bold">
                                    <th className="pb-3">الباقة</th>
                                    <th className="pb-3">تاريخ البداية</th>
                                    <th className="pb-3">تاريخ الانتهاء</th>
                                    <th className="pb-3">الحالة</th>
                                    <th className="pb-3">حد الفواتير</th>
                                    <th className="pb-3">السعر</th>
                                    <th className="pb-3 text-left">التفاصيل</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700/50">
                                {customer.subscriptions.map((s) => (
                                    <tr key={s.id} className="hover:bg-slate-750/40">
                                        <td className="py-3 font-bold text-white">{s.plan?.name || 'مخصص'}</td>
                                        <td className="py-3 font-mono text-slate-300">{s.start_date}</td>
                                        <td className="py-3 font-mono text-slate-300">{s.end_date}</td>
                                        <td className="py-3">
                                            <span className={`px-2 py-0.5 rounded-full font-bold text-[11px] ${
                                                s.status === 'active' ? 'bg-emerald-500/20 text-emerald-300' :
                                                s.status === 'trial' ? 'bg-amber-500/20 text-amber-300' :
                                                'bg-slate-700 text-slate-300'
                                            }`}>
                                                {s.status}
                                            </span>
                                        </td>
                                        <td className="py-3 font-mono text-slate-300">{s.invoice_limit}</td>
                                        <td className="py-3 font-mono text-slate-200">{s.price} ر.س</td>
                                        <td className="py-3 text-left">
                                            <Link
                                                href={`/admin/subscriptions/${s.id}`}
                                                className="text-purple-400 hover:text-purple-300 font-bold"
                                            >
                                                عرض
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
