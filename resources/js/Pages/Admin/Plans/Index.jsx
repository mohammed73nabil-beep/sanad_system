import React from 'react';
import { Link, router } from '@inertiajs/react';
import AdminLayout from '@/Components/Layout/AdminLayout';
import {
    Package,
    PlusCircle,
    Edit3,
    Trash2,
    ToggleLeft,
    ToggleRight,
    Check,
    CreditCard,
    Sparkles,
} from 'lucide-react';

export default function Index({ plans }) {
    const handleToggle = (plan) => {
        router.patch(`/admin/plans/${plan.id}/toggle`);
    };

    const handleDelete = (plan) => {
        if (confirm(`هل أنت متأكد من حذف باقة "${plan.name}"؟`)) {
            router.delete(`/admin/plans/${plan.id}`);
        }
    };

    return (
        <AdminLayout title="إدارة الباقات والأسعار">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-black text-white flex items-center gap-2">
                        <Package className="w-6 h-6 text-blue-400" />
                        <span>إدارة الباقات والاشتراكات</span>
                    </h1>
                    <p className="text-xs text-slate-400 mt-1">
                        تعريف باقات الاشتراك، تحديد الأسعار، مدد الاشتراك، وحدود الفواتير المسموحة
                    </p>
                </div>
                <Link
                    href="/admin/plans/create"
                    className="btn bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 text-sm self-start"
                >
                    <PlusCircle className="w-4 h-4" />
                    <span>+ إضافة باقة جديدة</span>
                </Link>
            </div>

            {/* Plans Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {plans.map((plan) => (
                    <div
                        key={plan.id}
                        className={`bg-slate-800/80 border rounded-2xl p-6 flex flex-col justify-between shadow-md relative transition-all ${
                            plan.is_active
                                ? 'border-slate-700/80 hover:border-purple-500/50'
                                : 'border-slate-800 opacity-60'
                        }`}
                    >
                        {!plan.is_active && (
                            <div className="absolute top-3 left-3 bg-rose-500/20 text-rose-300 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                باقة معطلة
                            </div>
                        )}

                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-lg font-black text-white">{plan.name}</h3>
                            </div>

                            <p className="text-xs text-slate-400 min-h-[36px] mb-4">
                                {plan.description || 'لا يوجد وصف لهذه الباقة.'}
                            </p>

                            <div className="bg-slate-900/80 rounded-xl p-4 mb-4 border border-slate-750">
                                <div className="text-3xl font-black text-white font-mono flex items-baseline gap-1">
                                    <span>{Number(plan.price).toFixed(2)}</span>
                                    <span className="text-xs font-bold text-slate-400">ر.س</span>
                                    <span className="text-xs font-normal text-slate-400 mr-2">/ {plan.duration_days} يوماً</span>
                                </div>
                            </div>

                            <div className="space-y-2.5 text-xs text-slate-300 border-t border-slate-750 pt-4 mb-6">
                                <div className="flex items-center gap-2">
                                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                                    <span>حد الفواتير: <strong className="text-white font-mono">{plan.invoice_limit} فاتورة</strong></span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                                    <span>مدة الصلاحية: <strong className="text-white">{plan.duration_days} يوم</strong></span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CreditCard className="w-4 h-4 text-purple-400 shrink-0" />
                                    <span>الاشتراكات المرتبطة: <strong className="text-white font-mono">{plan.subscriptions_count || 0}</strong></span>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-between pt-4 border-t border-slate-750 gap-2">
                            <button
                                type="button"
                                onClick={() => handleToggle(plan)}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                                    plan.is_active
                                        ? 'bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20'
                                        : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                                }`}
                            >
                                {plan.is_active ? <ToggleRight className="w-4 h-4 text-emerald-400" /> : <ToggleLeft className="w-4 h-4" />}
                                <span>{plan.is_active ? 'نشطة' : 'معطلة'}</span>
                            </button>

                            <div className="flex items-center gap-1.5">
                                <Link
                                    href={`/admin/plans/${plan.id}/edit`}
                                    className="p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 transition-colors"
                                    title="تعديل الباقة"
                                >
                                    <Edit3 className="w-4 h-4" />
                                </Link>

                                {plan.subscriptions_count === 0 && (
                                    <button
                                        type="button"
                                        onClick={() => handleDelete(plan)}
                                        className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors"
                                        title="حذف الباقة"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </AdminLayout>
    );
}
