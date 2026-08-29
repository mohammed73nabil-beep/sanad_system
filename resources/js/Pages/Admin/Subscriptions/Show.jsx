import React, { useState } from 'react';
import { Link, router, useForm } from '@inertiajs/react';
import AdminLayout from '@/Components/Layout/AdminLayout';
import Modal from '@/Components/UI/Modal';
import {
    CreditCard,
    ArrowRight,
    CheckCircle2,
    Ban,
    XCircle,
    Calendar,
    Clock,
    DollarSign,
    RefreshCw,
    PlusCircle,
    FileText,
    History,
    AlertTriangle,
    Save,
} from 'lucide-react';

export default function Show({ subscription, real_used, status_labels }) {
    const [renewModalOpen, setRenewModalOpen] = useState(false);
    const [paymentModalOpen, setPaymentModalOpen] = useState(false);

    // Renew Form
    const renewForm = useForm({
        days: 30,
        price: subscription.price || 0,
        notes: '',
    });

    // Payment Form
    const paymentForm = useForm({
        amount: subscription.price || 0,
        payment_date: new Date().toISOString().substring(0, 10),
        payment_method: 'cash',
        status: 'paid',
        reference_number: '',
        notes: '',
    });

    const handleActivate = () => {
        if (confirm('هل تريد تفعيل هذا الاشتراك والسماح للعميل بالاستخدام؟')) {
            router.patch(`/admin/subscriptions/${subscription.id}/activate`);
        }
    };

    const handleSuspend = () => {
        const reason = prompt('يرجى كتابة سبب تعليق الاشتراك (اختياري):');
        if (reason !== null) {
            router.patch(`/admin/subscriptions/${subscription.id}/suspend`, { reason });
        }
    };

    const handleCancel = () => {
        const reason = prompt('هل أنت متأكد من إلغاء هذا الاشتراك؟ اذكر السبب:');
        if (reason !== null) {
            router.patch(`/admin/subscriptions/${subscription.id}/cancel`, { reason });
        }
    };

    const handleRenewSubmit = (e) => {
        e.preventDefault();
        renewForm.post(`/admin/subscriptions/${subscription.id}/renew`, {
            onSuccess: () => setRenewModalOpen(false),
        });
    };

    const handlePaymentSubmit = (e) => {
        e.preventDefault();
        paymentForm.post(`/admin/subscriptions/${subscription.id}/payments`, {
            onSuccess: () => setPaymentModalOpen(false),
        });
    };

    const usagePercent = Math.min(100, Math.round((real_used / subscription.invoice_limit) * 100));

    return (
        <AdminLayout title={`تفاصيل اشتراك: ${subscription.user?.name}`}>
            {/* Top Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                    <Link
                        href="/admin/subscriptions"
                        className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl transition-colors border border-slate-700"
                        title="عودة لقائمة الاشتراكات"
                    >
                        <ArrowRight className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-black text-white flex items-center gap-2">
                            <span>اشتراك: {subscription.user?.name}</span>
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                subscription.status === 'active'    ? 'bg-emerald-500/20 text-emerald-300' :
                                subscription.status === 'trial'     ? 'bg-amber-500/20 text-amber-300' :
                                subscription.status === 'expired'   ? 'bg-rose-500/20 text-rose-300' :
                                subscription.status === 'suspended' ? 'bg-orange-500/20 text-orange-300' :
                                'bg-slate-700 text-slate-300'
                            }`}>
                                {status_labels[subscription.status] || subscription.status}
                            </span>
                        </h1>
                        <p className="text-xs text-slate-400 mt-0.5">
                            الباقة: {subscription.plan?.name || 'مخصص'} • السعر: {subscription.price} ر.س • من {subscription.start_date} إلى {subscription.end_date}
                        </p>
                    </div>
                </div>

                {/* Main Action Buttons */}
                <div className="flex flex-wrap items-center gap-2">
                    {/* Renew Button */}
                    <button
                        type="button"
                        onClick={() => setRenewModalOpen(true)}
                        className="px-3.5 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-lg transition-colors"
                    >
                        <RefreshCw className="w-4 h-4" />
                        <span>تمديد الاشتراك</span>
                    </button>

                    {/* Record Payment Button */}
                    <button
                        type="button"
                        onClick={() => setPaymentModalOpen(true)}
                        className="px-3.5 py-2 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-lg transition-colors"
                    >
                        <DollarSign className="w-4 h-4" />
                        <span>تسجيل دفعة</span>
                    </button>

                    {/* Activate Button */}
                    {subscription.status !== 'active' && (
                        <button
                            type="button"
                            onClick={handleActivate}
                            className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-lg transition-colors"
                        >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>تفعيل الاشتراك</span>
                        </button>
                    )}

                    {/* Suspend Button */}
                    {subscription.status === 'active' && (
                        <button
                            type="button"
                            onClick={handleSuspend}
                            className="px-3 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors border border-amber-500/30"
                        >
                            <Ban className="w-4 h-4" />
                            <span>تعليق</span>
                        </button>
                    )}

                    {/* Cancel Button */}
                    {subscription.status !== 'cancelled' && (
                        <button
                            type="button"
                            onClick={handleCancel}
                            className="px-3 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors border border-rose-500/30"
                        >
                            <XCircle className="w-4 h-4" />
                            <span>إلغاء</span>
                        </button>
                    )}

                    <Link
                        href={`/admin/subscriptions/${subscription.id}/edit`}
                        className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors border border-slate-700"
                    >
                        تعديل
                    </Link>
                </div>
            </div>

            {/* Quick Cards Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4">
                    <div className="text-xs text-slate-400 font-bold mb-1">الفواتير المصدرة (الفعلي)</div>
                    <div className="text-2xl font-black text-white font-mono">
                        {real_used} <span className="text-xs text-slate-400 font-normal">من {subscription.invoice_limit}</span>
                    </div>
                </div>
                <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4">
                    <div className="text-xs text-slate-400 font-bold mb-1">الفواتير المتبقية</div>
                    <div className="text-2xl font-black text-purple-300 font-mono">
                        {Math.max(0, subscription.invoice_limit - real_used)}
                    </div>
                </div>
                <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4">
                    <div className="text-xs text-slate-400 font-bold mb-1">تاريخ الانتهاء</div>
                    <div className="text-lg font-bold text-slate-200 font-mono">
                        {subscription.end_date}
                    </div>
                </div>
                <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4">
                    <div className="text-xs text-slate-400 font-bold mb-1">حالة الدفع</div>
                    <div className="text-lg font-bold text-emerald-400">
                        {subscription.payment_status === 'paid' ? 'مدفوع بالكامل' : 'غير مدفوع'}
                    </div>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 mb-6">
                <div className="flex justify-between items-center text-xs text-slate-300 mb-2">
                    <span className="font-bold text-white">نسبة استهلاك باقة الفواتير:</span>
                    <span className="font-mono font-bold text-purple-300">{usagePercent}% ({real_used} / {subscription.invoice_limit})</span>
                </div>
                <div className="w-full bg-slate-900 rounded-full h-3 overflow-hidden p-0.5 border border-slate-700">
                    <div
                        className={`h-full rounded-full transition-all duration-500 ${
                            usagePercent >= 100 ? 'bg-rose-500' :
                            usagePercent >= 80  ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${usagePercent}%` }}
                    />
                </div>
                {usagePercent >= 100 && (
                    <div className="mt-3 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 shrink-0" />
                        <span>وصل العميل للحد الأقصى للفواتير. سيتم منعه من إصدار فواتير إضافية ما لم يتم تمديد أو ترقية الباقة.</span>
                    </div>
                )}
            </div>

            {/* Split Grid: Payments & Renewals History */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Payments Table */}
                <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4 border-b border-slate-700 pb-3">
                        <h2 className="text-base font-bold text-white flex items-center gap-2">
                            <DollarSign className="w-5 h-5 text-teal-400" />
                            <span>سجل مدفوعات هذا الاشتراك</span>
                        </h2>
                        <button
                            type="button"
                            onClick={() => setPaymentModalOpen(true)}
                            className="text-xs text-teal-400 hover:text-teal-300 font-bold flex items-center gap-1"
                        >
                            <PlusCircle className="w-3.5 h-3.5" />
                            <span>+ دفعة جديدة</span>
                        </button>
                    </div>

                    {subscription.payments.length === 0 ? (
                        <div className="text-center py-8 text-slate-400 text-xs">
                            لا توجد مدفوعات مسجلة بعد
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-right text-xs">
                                <thead>
                                    <tr className="border-b border-slate-750 text-slate-400 font-semibold">
                                        <th className="pb-2">المبلغ</th>
                                        <th className="pb-2">التاريخ</th>
                                        <th className="pb-2">الطريقة</th>
                                        <th className="pb-2">الحالة</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-750">
                                    {subscription.payments.map((pay) => (
                                        <tr key={pay.id}>
                                            <td className="py-2.5 font-mono font-bold text-emerald-400">
                                                {Number(pay.amount).toFixed(2)} ر.س
                                            </td>
                                            <td className="py-2.5 font-mono text-slate-300">{pay.payment_date}</td>
                                            <td className="py-2.5 text-slate-300">{pay.payment_method}</td>
                                            <td className="py-2.5">
                                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300">
                                                    {pay.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Renewals History */}
                <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4 border-b border-slate-700 pb-3">
                        <h2 className="text-base font-bold text-white flex items-center gap-2">
                            <History className="w-5 h-5 text-purple-400" />
                            <span>سجل التمديدات والتجديدات</span>
                        </h2>
                    </div>

                    {subscription.renewals.length === 0 ? (
                        <div className="text-center py-8 text-slate-400 text-xs">
                            لم يتم تمديد هذا الاشتراك من قبل
                        </div>
                    ) : (
                        <div className="space-y-3 text-xs">
                            {subscription.renewals.map((r) => (
                                <div key={r.id} className="p-3 bg-slate-900/60 border border-slate-750 rounded-xl flex items-start justify-between gap-3">
                                    <div>
                                        <div className="font-bold text-white">
                                            تمديد بـ {r.days_added} يوماً (بقيمة {r.price} ر.س)
                                        </div>
                                        <div className="text-[11px] text-slate-400 font-mono mt-1">
                                            من {r.old_end_date} إلى {r.new_end_date}
                                        </div>
                                        {r.notes && <div className="text-[11px] text-purple-300 mt-1">{r.notes}</div>}
                                    </div>
                                    <span className="text-[10px] font-mono text-slate-500">{r.created_at?.substring(0, 10)}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Renew Modal */}
            <Modal
                show={renewModalOpen}
                onClose={() => setRenewModalOpen(false)}
                title="تمديد مدة الاشتراك"
                maxWidth="md"
            >
                <form onSubmit={handleRenewSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-300 mb-2">
                            فترة التمديد
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                            {[
                                { label: '30 يوماً (شهر)', days: 30 },
                                { label: '90 يوماً (3 أشهر)', days: 90 },
                                { label: '365 يوماً (سنة)', days: 365 },
                            ].map((preset) => (
                                <button
                                    key={preset.days}
                                    type="button"
                                    onClick={() => renewForm.setData('days', preset.days)}
                                    className={`p-2 rounded-xl text-xs font-bold text-center border transition-colors ${
                                        renewForm.data.days === preset.days
                                            ? 'bg-purple-600 border-purple-500 text-white'
                                            : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750'
                                    }`}
                                >
                                    {preset.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-bold text-slate-300 mb-1">
                                عدد الأيام المضافة
                            </label>
                            <input
                                type="number"
                                min="1"
                                required
                                value={renewForm.data.days}
                                onChange={(e) => renewForm.setData('days', parseInt(e.target.value) || '')}
                                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-300 mb-1">
                                سعر التمديد (ر.س)
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={renewForm.data.price}
                                onChange={(e) => renewForm.setData('price', e.target.value)}
                                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1">
                            ملاحظات التمديد
                        </label>
                        <textarea
                            rows={2}
                            value={renewForm.data.notes}
                            onChange={(e) => renewForm.setData('notes', e.target.value)}
                            placeholder="سبب التمديد أو رقم الحوالة..."
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500"
                        />
                    </div>

                    <div className="flex justify-end gap-2 pt-3 border-t border-slate-700">
                        <button
                            type="button"
                            onClick={() => setRenewModalOpen(false)}
                            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl"
                        >
                            إلغاء
                        </button>
                        <button
                            type="submit"
                            disabled={renewForm.processing}
                            className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl shadow-lg"
                        >
                            {renewForm.processing ? 'جاري الحفظ...' : 'تأكيد التمديد'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Record Payment Modal */}
            <Modal
                show={paymentModalOpen}
                onClose={() => setPaymentModalOpen(false)}
                title="تسجيل دفعة مالية للاشتراك"
                maxWidth="md"
            >
                <form onSubmit={handlePaymentSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-bold text-slate-300 mb-1">
                                المبلغ (ر.س) <span className="text-rose-400">*</span>
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                min="0.01"
                                required
                                value={paymentForm.data.amount}
                                onChange={(e) => paymentForm.setData('amount', e.target.value)}
                                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-300 mb-1">
                                تاريخ الدفعة <span className="text-rose-400">*</span>
                            </label>
                            <input
                                type="date"
                                required
                                value={paymentForm.data.payment_date}
                                onChange={(e) => paymentForm.setData('payment_date', e.target.value)}
                                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-bold text-slate-300 mb-1">
                                طريقة الدفع
                            </label>
                            <select
                                value={paymentForm.data.payment_method}
                                onChange={(e) => paymentForm.setData('payment_method', e.target.value)}
                                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                            >
                                <option value="cash">نقدي (Cash)</option>
                                <option value="bank_transfer">تحويل بنكي</option>
                                <option value="other">أخرى</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-300 mb-1">
                                رقم المرجع / الحوالة
                            </label>
                            <input
                                type="text"
                                value={paymentForm.data.reference_number}
                                onChange={(e) => paymentForm.setData('reference_number', e.target.value)}
                                placeholder="TRX-XXXX..."
                                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1">
                            ملاحظات
                        </label>
                        <textarea
                            rows={2}
                            value={paymentForm.data.notes}
                            onChange={(e) => paymentForm.setData('notes', e.target.value)}
                            placeholder="أي تفاصيل حول الحوالة..."
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500"
                        />
                    </div>

                    <div className="flex justify-end gap-2 pt-3 border-t border-slate-700">
                        <button
                            type="button"
                            onClick={() => setPaymentModalOpen(false)}
                            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl"
                        >
                            إلغاء
                        </button>
                        <button
                            type="submit"
                            disabled={paymentForm.processing}
                            className="px-5 py-2 bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold rounded-xl shadow-lg"
                        >
                            {paymentForm.processing ? 'جاري التسجيل...' : 'حفظ الدفعة'}
                        </button>
                    </div>
                </form>
            </Modal>
        </AdminLayout>
    );
}
