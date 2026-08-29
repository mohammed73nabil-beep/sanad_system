import React from 'react';
import { Link, useForm } from '@inertiajs/react';
import AdminLayout from '@/Components/Layout/AdminLayout';
import { CreditCard, Save, ArrowRight } from 'lucide-react';

export default function Edit({ subscription }) {
    const { data, setData, put, processing, errors } = useForm({
        invoice_limit: subscription.invoice_limit || 100,
        end_date: subscription.end_date || '',
        notes: subscription.notes || '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        put(`/admin/subscriptions/${subscription.id}`);
    };

    return (
        <AdminLayout title={`تعديل اشتراك: ${subscription.user?.name}`}>
            <div className="max-w-2xl mx-auto">
                <div className="flex items-center justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-2xl font-black text-white flex items-center gap-2">
                            <CreditCard className="w-6 h-6 text-purple-400" />
                            <span>تعديل اشتراك: {subscription.user?.name}</span>
                        </h1>
                        <p className="text-xs text-slate-400 mt-1">
                            تعديل حد الفواتير الأقصى وتاريخ انتهاء الصلاحية
                        </p>
                    </div>
                    <Link
                        href={`/admin/subscriptions/${subscription.id}`}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors border border-slate-700"
                    >
                        <ArrowRight className="w-4 h-4" />
                        <span>عودة للاشتراك</span>
                    </Link>
                </div>

                <form onSubmit={handleSubmit} className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 shadow-sm space-y-5">
                    <div className="p-4 bg-slate-900/60 border border-slate-750 rounded-xl text-xs space-y-1">
                        <div className="text-slate-400">العميل: <strong className="text-white">{subscription.user?.name}</strong></div>
                        <div className="text-slate-400">الباقة: <strong className="text-purple-300">{subscription.plan?.name || 'اشتراك مخصص'}</strong></div>
                        <div className="text-slate-400">تاريخ البداية: <strong className="text-slate-200 font-mono">{subscription.start_date}</strong></div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-300 mb-1">
                                حد الفواتير الأقصى <span className="text-rose-400">*</span>
                            </label>
                            <input
                                type="number"
                                min="1"
                                required
                                value={data.invoice_limit}
                                onChange={(e) => setData('invoice_limit', parseInt(e.target.value) || '')}
                                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-purple-500"
                            />
                            {errors.invoice_limit && <div className="text-xs text-rose-400 mt-1">{errors.invoice_limit}</div>}
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-300 mb-1">
                                تاريخ الانتهاء <span className="text-rose-400">*</span>
                            </label>
                            <input
                                type="date"
                                required
                                value={data.end_date}
                                onChange={(e) => setData('end_date', e.target.value)}
                                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-purple-500"
                            />
                            {errors.end_date && <div className="text-xs text-rose-400 mt-1">{errors.end_date}</div>}
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1">
                            ملاحظات
                        </label>
                        <textarea
                            rows={3}
                            value={data.notes}
                            onChange={(e) => setData('notes', e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                        />
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-700">
                        <Link
                            href={`/admin/subscriptions/${subscription.id}`}
                            className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs transition-colors"
                        >
                            إلغاء
                        </Link>
                        <button
                            type="submit"
                            disabled={processing}
                            className="px-6 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg transition-colors disabled:opacity-50"
                        >
                            <Save className="w-4 h-4" />
                            <span>{processing ? 'جاري الحفظ...' : 'حفظ التعديلات'}</span>
                        </button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
