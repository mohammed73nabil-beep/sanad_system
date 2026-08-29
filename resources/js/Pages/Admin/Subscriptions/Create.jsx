import React, { useState, useEffect } from 'react';
import { Link, useForm } from '@inertiajs/react';
import AdminLayout from '@/Components/Layout/AdminLayout';
import { CreditCard, Save, ArrowRight, Calendar, Sparkles } from 'lucide-react';

export default function Create({ customers, plans, selected_customer }) {
    const today = new Date().toISOString().substring(0, 10);

    const [durationPreset, setDurationPreset] = useState('30');

    const { data, setData, post, processing, errors } = useForm({
        user_id: selected_customer ? String(selected_customer.id) : '',
        plan_id: '',
        start_date: today,
        end_date: '',
        duration_days: 30,
        status: 'active',
        invoice_limit: 100,
        price: 49,
        payment_status: 'paid',
        notes: '',
    });

    // Calculate end date whenever start_date or duration_days changes
    useEffect(() => {
        if (data.start_date && data.duration_days) {
            const start = new Date(data.start_date);
            if (!isNaN(start.getTime())) {
                const end = new Date(start);
                end.setDate(end.getDate() + parseInt(data.duration_days));
                setData('end_date', end.toISOString().substring(0, 10));
            }
        }
    }, [data.start_date, data.duration_days]);

    // Handle Plan Selection
    const handlePlanChange = (planId) => {
        setData('plan_id', planId);
        const plan = plans.find((p) => String(p.id) === String(planId));
        if (plan) {
            setData((prev) => ({
                ...prev,
                plan_id: planId,
                duration_days: plan.duration_days,
                invoice_limit: plan.invoice_limit,
                price: plan.price,
            }));
            setDurationPreset(String(plan.duration_days));
        }
    };

    // Handle Duration Preset
    const handlePresetChange = (days) => {
        setDurationPreset(days);
        if (days !== 'custom') {
            setData('duration_days', parseInt(days));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/admin/subscriptions');
    };

    return (
        <AdminLayout title="إنشاء اشتراك جديد">
            <div className="max-w-3xl mx-auto">
                <div className="flex items-center justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-2xl font-black text-white flex items-center gap-2">
                            <CreditCard className="w-6 h-6 text-purple-400" />
                            <span>+ إنشاء اشتراك جديد للعميل</span>
                        </h1>
                        <p className="text-xs text-slate-400 mt-1">
                            تحديد الباقة، المدة، حد الفواتير، وحالة الدفع والتفعيل
                        </p>
                    </div>
                    <Link
                        href="/admin/subscriptions"
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors border border-slate-700"
                    >
                        <ArrowRight className="w-4 h-4" />
                        <span>عودة للاشتراكات</span>
                    </Link>
                </div>

                <form onSubmit={handleSubmit} className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 shadow-sm space-y-5">
                    {/* Customer Selection */}
                    <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1">
                            العميل / المنشأة <span className="text-rose-400">*</span>
                        </label>
                        <select
                            required
                            value={data.user_id}
                            onChange={(e) => setData('user_id', e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
                        >
                            <option value="">-- اختر العميل --</option>
                            {customers.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.name} ({c.email})
                                </option>
                            ))}
                        </select>
                        {errors.user_id && <div className="text-xs text-rose-400 mt-1">{errors.user_id}</div>}
                    </div>

                    {/* Plan Selection */}
                    <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1">
                            الباقة المطلوبة
                        </label>
                        <select
                            value={data.plan_id}
                            onChange={(e) => handlePlanChange(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
                        >
                            <option value="">-- تخصيص اشتراك مخصص (بدون باقة محددة) --</option>
                            {plans.map((p) => (
                                <option key={p.id} value={p.id}>
                                    {p.name} — {p.price} ر.س ({p.duration_days} يوم / {p.invoice_limit} فاتورة)
                                </option>
                            ))}
                        </select>
                        {errors.plan_id && <div className="text-xs text-rose-400 mt-1">{errors.plan_id}</div>}
                    </div>

                    {/* Duration Presets */}
                    <div>
                        <label className="block text-xs font-bold text-slate-300 mb-2">
                            مدة الاشتراك
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {[
                                { label: '7 أيام (تجربة)', value: '7' },
                                { label: 'شهر (30 يوم)', value: '30' },
                                { label: '3 أشهر (90 يوم)', value: '90' },
                                { label: '6 أشهر (180 يوم)', value: '180' },
                                { label: 'سنة (365 يوم)', value: '365' },
                                { label: 'مخصص', value: 'custom' },
                            ].map((preset) => (
                                <button
                                    key={preset.value}
                                    type="button"
                                    onClick={() => handlePresetChange(preset.value)}
                                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                                        durationPreset === preset.value
                                            ? 'bg-purple-600 border-purple-500 text-white shadow-md'
                                            : 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-750'
                                    }`}
                                >
                                    {preset.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Dates Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-300 mb-1">
                                تاريخ البداية <span className="text-rose-400">*</span>
                            </label>
                            <input
                                type="date"
                                required
                                value={data.start_date}
                                onChange={(e) => setData('start_date', e.target.value)}
                                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white font-mono focus:outline-none focus:border-purple-500"
                            />
                            {errors.start_date && <div className="text-xs text-rose-400 mt-1">{errors.start_date}</div>}
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-300 mb-1">
                                عدد الأيام <span className="text-rose-400">*</span>
                            </label>
                            <input
                                type="number"
                                min="1"
                                required
                                value={data.duration_days}
                                onChange={(e) => setData('duration_days', parseInt(e.target.value) || '')}
                                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white font-mono focus:outline-none focus:border-purple-500"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-300 mb-1">
                                تاريخ الانتهاء (تلقائي)
                            </label>
                            <input
                                type="date"
                                readOnly
                                value={data.end_date}
                                className="w-full bg-slate-900/60 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-purple-300 font-mono focus:outline-none cursor-not-allowed"
                            />
                        </div>
                    </div>

                    {/* Limits & Price */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-300 mb-1">
                                حد الفواتير المسموح به <span className="text-rose-400">*</span>
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
                                سعر الاشتراك (ر.س) <span className="text-rose-400">*</span>
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                required
                                value={data.price}
                                onChange={(e) => setData('price', e.target.value)}
                                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-purple-500"
                            />
                            {errors.price && <div className="text-xs text-rose-400 mt-1">{errors.price}</div>}
                        </div>
                    </div>

                    {/* Statuses Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-300 mb-1">
                                حالة الاشتراك <span className="text-rose-400">*</span>
                            </label>
                            <select
                                required
                                value={data.status}
                                onChange={(e) => setData('status', e.target.value)}
                                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
                            >
                                <option value="active">نشط (Active) — مفعل فوراً</option>
                                <option value="trial">تجربة (Trial) — فترة تجريبية</option>
                                <option value="suspended">معلق (Suspended)</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-300 mb-1">
                                حالة الدفع <span className="text-rose-400">*</span>
                            </label>
                            <select
                                required
                                value={data.payment_status}
                                onChange={(e) => setData('payment_status', e.target.value)}
                                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
                            >
                                <option value="paid">مدفوع (Paid)</option>
                                <option value="unpaid">غير مدفوع (Unpaid)</option>
                            </select>
                        </div>
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1">
                            ملاحظات على الاشتراك
                        </label>
                        <textarea
                            rows={2}
                            value={data.notes}
                            onChange={(e) => setData('notes', e.target.value)}
                            placeholder="أي شروط أو اتفاقيات خاصة..."
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                        />
                    </div>

                    {/* Submit Bar */}
                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-700">
                        <Link
                            href="/admin/subscriptions"
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
                            <span>{processing ? 'جاري الحفظ...' : 'حفظ وتفعيل الاشتراك'}</span>
                        </button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
