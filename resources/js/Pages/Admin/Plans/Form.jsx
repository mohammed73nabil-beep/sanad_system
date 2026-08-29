import React from 'react';
import { Link, useForm } from '@inertiajs/react';
import AdminLayout from '@/Components/Layout/AdminLayout';
import { Package, Save, ArrowRight } from 'lucide-react';

export default function Form({ plan }) {
    const isEdit = Boolean(plan);

    const { data, setData, post, put, processing, errors } = useForm({
        name: plan?.name || '',
        description: plan?.description || '',
        price: plan?.price !== undefined ? plan.price : '',
        duration_days: plan?.duration_days || 30,
        invoice_limit: plan?.invoice_limit || 100,
        is_active: plan?.is_active !== undefined ? plan.is_active : true,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isEdit) {
            put(`/admin/plans/${plan.id}`);
        } else {
            post('/admin/plans');
        }
    };

    return (
        <AdminLayout title={isEdit ? `تعديل باقة: ${plan.name}` : 'إضافة باقة جديدة'}>
            <div className="max-w-2xl mx-auto">
                <div className="flex items-center justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-2xl font-black text-white flex items-center gap-2">
                            <Package className="w-6 h-6 text-blue-400" />
                            <span>{isEdit ? `تعديل باقة: ${plan.name}` : 'إضافة باقة جديدة'}</span>
                        </h1>
                        <p className="text-xs text-slate-400 mt-1">
                            تحديد شروط الباقة والحد الأقصى للفواتير وقيمتها بالريال السعودي
                        </p>
                    </div>
                    <Link
                        href="/admin/plans"
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors border border-slate-700"
                    >
                        <ArrowRight className="w-4 h-4" />
                        <span>عودة للباقات</span>
                    </Link>
                </div>

                <form onSubmit={handleSubmit} className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 shadow-sm space-y-5">
                    <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1">
                            اسم الباقة <span className="text-rose-400">*</span>
                        </label>
                        <input
                            type="text"
                            required
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            placeholder="مثال: الباقة الذهبية، باقة الشركات..."
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                        />
                        {errors.name && <div className="text-xs text-rose-400 mt-1">{errors.name}</div>}
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1">
                            وصف الباقة
                        </label>
                        <textarea
                            rows={3}
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            placeholder="وصف مختصر للمميزات والفئة المستهدفة..."
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-300 mb-1">
                                السعر (ر.س) <span className="text-rose-400">*</span>
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                required
                                value={data.price}
                                onChange={(e) => setData('price', e.target.value)}
                                placeholder="0.00"
                                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-purple-500"
                            />
                            {errors.price && <div className="text-xs text-rose-400 mt-1">{errors.price}</div>}
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-300 mb-1">
                                المدة (بالأيام) <span className="text-rose-400">*</span>
                            </label>
                            <input
                                type="number"
                                min="1"
                                required
                                value={data.duration_days}
                                onChange={(e) => setData('duration_days', parseInt(e.target.value) || '')}
                                placeholder="30"
                                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-purple-500"
                            />
                            {errors.duration_days && <div className="text-xs text-rose-400 mt-1">{errors.duration_days}</div>}
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-300 mb-1">
                                حد الفواتير <span className="text-rose-400">*</span>
                            </label>
                            <input
                                type="number"
                                min="1"
                                required
                                value={data.invoice_limit}
                                onChange={(e) => setData('invoice_limit', parseInt(e.target.value) || '')}
                                placeholder="100"
                                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-purple-500"
                            />
                            {errors.invoice_limit && <div className="text-xs text-rose-400 mt-1">{errors.invoice_limit}</div>}
                        </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                        <input
                            type="checkbox"
                            id="is_active"
                            checked={data.is_active}
                            onChange={(e) => setData('is_active', e.target.checked)}
                            className="rounded bg-slate-900 border-slate-700 text-purple-600 focus:ring-purple-500"
                        />
                        <label htmlFor="is_active" className="text-xs font-bold text-slate-200 cursor-pointer">
                            الباقة مفعلة ومتاحة للاشتراك
                        </label>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-700">
                        <Link
                            href="/admin/plans"
                            className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs transition-colors"
                        >
                            إلغاء
                        </Link>
                        <button
                            type="submit"
                            disabled={processing}
                            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg transition-colors disabled:opacity-50"
                        >
                            <Save className="w-4 h-4" />
                            <span>{processing ? 'جاري الحفظ...' : isEdit ? 'تحديث الباقة' : 'حفظ الباقة'}</span>
                        </button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
