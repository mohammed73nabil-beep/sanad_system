import React from 'react';
import { Link } from '@inertiajs/react';
import AdminLayout from '@/Components/Layout/AdminLayout';
import {
    Users,
    CreditCard,
    CheckCircle,
    Clock,
    AlertTriangle,
    DollarSign,
    FileText,
    TrendingUp,
    PlusCircle,
    ArrowUpRight,
    Sparkles,
    Shield,
} from 'lucide-react';

export default function Dashboard({
    stats,
    recent_customers,
    expiring_soon,
    recent_payments,
    recent_activities,
}) {
    return (
        <AdminLayout title="لوحة التحكم الرئيسية">
            {/* Header Banner */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 bg-gradient-to-l from-purple-900/50 via-slate-800 to-slate-800/80 p-6 rounded-2xl border border-purple-500/20 shadow-xl">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-black text-white flex items-center gap-3">
                        <span>مرحباً بك في لوحة تحكم مالك النظام</span>
                        <Sparkles className="w-6 h-6 text-amber-400" />
                    </h1>
                    <p className="text-sm text-purple-200/70 mt-1">
                        نظرة شاملة على العملاء، الاشتراكات النشطة، حركة المدفوعات، واستخدام النظام
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <Link
                        href="/admin/customers/create"
                        className="btn bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 text-sm transition-all"
                    >
                        <PlusCircle className="w-4 h-4" />
                        <span>+ عميل جديد</span>
                    </Link>
                    <Link
                        href="/admin/subscriptions/create"
                        className="btn bg-purple-600 hover:bg-purple-500 text-white font-bold px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 text-sm transition-all"
                    >
                        <CreditCard className="w-4 h-4" />
                        <span>+ اشتراك جديد</span>
                    </Link>
                </div>
            </div>

            {/* 8 Metric KPI Cards Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {/* 1. Total Customers */}
                <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-5 shadow-sm">
                    <div className="flex items-center justify-between text-slate-400 mb-2">
                        <span className="text-xs font-bold">إجمالي المنشآت والعملاء</span>
                        <Users className="w-5 h-5 text-blue-400" />
                    </div>
                    <div className="text-2xl lg:text-3xl font-black text-white">
                        {stats.total_customers}
                    </div>
                    <div className="text-xs text-emerald-400 mt-2 flex items-center gap-1 font-semibold">
                        <span>{stats.active_customers} عميل نشط</span>
                    </div>
                </div>

                {/* 2. Active Subscriptions */}
                <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-5 shadow-sm">
                    <div className="flex items-center justify-between text-slate-400 mb-2">
                        <span className="text-xs font-bold">الاشتراكات النشطة</span>
                        <CheckCircle className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div className="text-2xl lg:text-3xl font-black text-emerald-400">
                        {stats.active_subs}
                    </div>
                    <div className="text-xs text-slate-400 mt-2 font-semibold">
                        من أصل {stats.total_subscriptions} اشتراك كلي
                    </div>
                </div>

                {/* 3. Trials */}
                <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-5 shadow-sm">
                    <div className="flex items-center justify-between text-slate-400 mb-2">
                        <span className="text-xs font-bold">الفترة التجريبية (Trial)</span>
                        <Clock className="w-5 h-5 text-amber-400" />
                    </div>
                    <div className="text-2xl lg:text-3xl font-black text-amber-400">
                        {stats.trial_subs}
                    </div>
                    <div className="text-xs text-slate-400 mt-2 font-semibold">
                        عملاء تحت التجربة
                    </div>
                </div>

                {/* 4. Expiring Soon */}
                <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-5 shadow-sm">
                    <div className="flex items-center justify-between text-slate-400 mb-2">
                        <span className="text-xs font-bold">تنتهي خلال 7 أيام</span>
                        <AlertTriangle className="w-5 h-5 text-rose-400" />
                    </div>
                    <div className="text-2xl lg:text-3xl font-black text-rose-400">
                        {stats.expiring_soon}
                    </div>
                    <div className="text-xs text-slate-400 mt-2 font-semibold">
                        {stats.expired_subs} اشتراك منتهي حالياً
                    </div>
                </div>

                {/* 5. Monthly Revenue */}
                <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-5 shadow-sm">
                    <div className="flex items-center justify-between text-slate-400 mb-2">
                        <span className="text-xs font-bold">إيرادات الاشتراكات (هذا الشهر)</span>
                        <DollarSign className="w-5 h-5 text-teal-400" />
                    </div>
                    <div className="text-2xl lg:text-3xl font-black text-teal-300">
                        {Number(stats.monthly_revenue).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        <span className="text-xs font-bold mr-1 text-slate-400">ر.س</span>
                    </div>
                    <div className="text-xs text-slate-400 mt-2 font-semibold">
                        مدفوعات مؤكدة
                    </div>
                </div>

                {/* 6. Invoices Issued This Month */}
                <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-5 shadow-sm">
                    <div className="flex items-center justify-between text-slate-400 mb-2">
                        <span className="text-xs font-bold">فواتير أُصدرت (هذا الشهر)</span>
                        <FileText className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div className="text-2xl lg:text-3xl font-black text-indigo-300">
                        {stats.monthly_invoices}
                    </div>
                    <div className="text-xs text-slate-400 mt-2 font-semibold">
                        عبر جميع المنشآت
                    </div>
                </div>

                {/* 7. Active Customers Ratio */}
                <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-5 shadow-sm">
                    <div className="flex items-center justify-between text-slate-400 mb-2">
                        <span className="text-xs font-bold">نسبة تشغيل الحسابات</span>
                        <TrendingUp className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div className="text-2xl lg:text-3xl font-black text-white">
                        {stats.total_customers > 0 ? Math.round((stats.active_customers / stats.total_customers) * 100) : 0}%
                    </div>
                    <div className="text-xs text-slate-400 mt-2 font-semibold">
                        حسابات مفعلة تعمل الآن
                    </div>
                </div>

                {/* 8. Quick Subscriptions Link */}
                <div className="bg-gradient-to-br from-purple-900/40 to-slate-800/90 border border-purple-500/30 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
                    <div className="flex items-center justify-between text-purple-300">
                        <span className="text-xs font-bold">إدارة الباقات والأسعار</span>
                        <Package className="w-5 h-5" />
                    </div>
                    <Link
                        href="/admin/plans"
                        className="mt-3 flex items-center justify-between text-sm font-bold text-white hover:text-purple-300 transition-colors"
                    >
                        <span>تعديل الباقات</span>
                        <ArrowUpRight className="w-4 h-4" />
                    </Link>
                </div>
            </div>

            {/* Split Content: Expiring Soon & Recent Customers */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Expiring Soon Table */}
                <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-base font-bold text-white flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-amber-400" />
                            <span>اشتراكات تنتهي قريباً (خلال 7 أيام)</span>
                        </h2>
                        <Link href="/admin/subscriptions" className="text-xs text-purple-400 hover:text-purple-300 font-bold">
                            عرض الكل
                        </Link>
                    </div>

                    {expiring_soon.length === 0 ? (
                        <div className="text-center py-8 text-slate-400 text-sm">
                            لا توجد اشتراكات تنتهي خلال الـ 7 أيام القادمة 👍
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-right text-xs">
                                <thead>
                                    <tr className="border-b border-slate-700 text-slate-400 font-semibold">
                                        <th className="pb-3">العميل</th>
                                        <th className="pb-3">الباقة</th>
                                        <th className="pb-3">تاريخ الانتهاء</th>
                                        <th className="pb-3">المتبقي</th>
                                        <th className="pb-3 text-left">إجراء</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-700/50">
                                    {expiring_soon.map((sub) => (
                                        <tr key={sub.id} className="hover:bg-slate-750/50">
                                            <td className="py-3 font-bold text-white">{sub.user_name}</td>
                                            <td className="py-3 text-slate-300">{sub.plan_name}</td>
                                            <td className="py-3 text-slate-300 font-mono">{sub.end_date}</td>
                                            <td className="py-3">
                                                <span className="px-2 py-0.5 rounded-full font-bold text-[11px] bg-amber-500/20 text-amber-300">
                                                    {sub.days_left} يوم
                                                </span>
                                            </td>
                                            <td className="py-3 text-left">
                                                <Link
                                                    href={`/admin/subscriptions/${sub.id}`}
                                                    className="px-2.5 py-1 rounded-lg bg-purple-600/30 hover:bg-purple-600 text-purple-200 text-xs font-bold transition-colors"
                                                >
                                                    تمديد
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Recent Customers */}
                <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-base font-bold text-white flex items-center gap-2">
                            <Users className="w-5 h-5 text-blue-400" />
                            <span>آخر العملاء والمنشآت المسجلة</span>
                        </h2>
                        <Link href="/admin/customers" className="text-xs text-purple-400 hover:text-purple-300 font-bold">
                            عرض الكل
                        </Link>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-right text-xs">
                            <thead>
                                <tr className="border-b border-slate-700 text-slate-400 font-semibold">
                                    <th className="pb-3">المنشأة / العميل</th>
                                    <th className="pb-3">البريد</th>
                                    <th className="pb-3">الاشتراك</th>
                                    <th className="pb-3">الحساب</th>
                                    <th className="pb-3 text-left">التفاصيل</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700/50">
                                {recent_customers.map((c) => (
                                    <tr key={c.id} className="hover:bg-slate-750/50">
                                        <td className="py-3 font-bold text-white">{c.name}</td>
                                        <td className="py-3 text-slate-300 font-mono">{c.email}</td>
                                        <td className="py-3">
                                            <span className="px-2 py-0.5 rounded-full font-bold text-[11px] bg-slate-700 text-slate-200">
                                                {c.subscription_status}
                                            </span>
                                        </td>
                                        <td className="py-3">
                                            <span className={`px-2 py-0.5 rounded-full font-bold text-[11px] ${c.status === 'نشط' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'}`}>
                                                {c.status}
                                            </span>
                                        </td>
                                        <td className="py-3 text-left">
                                            <Link
                                                href={`/admin/customers/${c.id}`}
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
                </div>
            </div>

            {/* Split Content: Recent Payments & Activity Log */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Payments */}
                <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-base font-bold text-white flex items-center gap-2">
                            <DollarSign className="w-5 h-5 text-teal-400" />
                            <span>آخر المدفوعات المسجلة</span>
                        </h2>
                        <Link href="/admin/payments" className="text-xs text-purple-400 hover:text-purple-300 font-bold">
                            عرض الكل
                        </Link>
                    </div>

                    {recent_payments.length === 0 ? (
                        <div className="text-center py-8 text-slate-400 text-sm">
                            لا توجد مدفوعات مسجلة بعد
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-right text-xs">
                                <thead>
                                    <tr className="border-b border-slate-700 text-slate-400 font-semibold">
                                        <th className="pb-3">العميل</th>
                                        <th className="pb-3">المبلغ</th>
                                        <th className="pb-3">التاريخ</th>
                                        <th className="pb-3">الطريقة</th>
                                        <th className="pb-3">الحالة</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-700/50">
                                    {recent_payments.map((p) => (
                                        <tr key={p.id} className="hover:bg-slate-750/50">
                                            <td className="py-3 font-bold text-white">{p.user_name}</td>
                                            <td className="py-3 font-bold text-emerald-400 font-mono">
                                                {p.amount.toFixed(2)} ر.س
                                            </td>
                                            <td className="py-3 text-slate-300 font-mono">{p.date}</td>
                                            <td className="py-3 text-slate-300">{p.method}</td>
                                            <td className="py-3">
                                                <span className="px-2 py-0.5 rounded-full font-bold text-[11px] bg-emerald-500/20 text-emerald-300">
                                                    {p.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Recent Activities */}
                <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-base font-bold text-white flex items-center gap-2">
                            <History className="w-5 h-5 text-slate-400" />
                            <span>سجل العمليات والنشاطات الأخيرة</span>
                        </h2>
                        <Link href="/admin/activity-log" className="text-xs text-purple-400 hover:text-purple-300 font-bold">
                            سجل النشاطات الكامل
                        </Link>
                    </div>

                    <div className="space-y-3">
                        {recent_activities.map((act) => (
                            <div key={act.id} className="flex items-start justify-between gap-3 p-3 rounded-xl bg-slate-900/50 border border-slate-750">
                                <div>
                                    <div className="text-xs font-semibold text-slate-200">{act.description}</div>
                                    <div className="text-[10px] text-slate-400 mt-1">بواسطة: {act.user_name}</div>
                                </div>
                                <span className="text-[10px] font-mono text-slate-400 whitespace-nowrap">{act.created_at}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
