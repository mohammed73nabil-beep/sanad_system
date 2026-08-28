import React, { useState } from 'react';
import { Link, useForm, router } from '@inertiajs/react';
import AppLayout from '@/Components/Layout/AppLayout';
import Badge from '@/Components/UI/Badge';
import Modal from '@/Components/UI/Modal';
import {
    FileText,
    ArrowLeft,
    Download,
    Printer,
    Share2,
    Ban,
    PlusCircle,
    Receipt,
    Calendar,
    User,
    Building2,
    DollarSign,
    QrCode,
} from 'lucide-react';

export default function InvoicesShow({ invoice, company }) {
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
    const [cancelReason, setCancelReason] = useState('');

    const { data, setData, post, processing, errors, reset } = useForm({
        amount: invoice.remaining_amount || '',
        payment_method: 'cash',
        payment_date: new Date().toISOString().split('T')[0],
        reference: '',
        notes: '',
        create_receipt_voucher: true,
    });

    const formatMoney = (val) => {
        return Number(val || 0).toLocaleString('ar-SA', { minimumFractionDigits: 2 }) + ' ر.س';
    };

    const handlePaymentSubmit = (e) => {
        e.preventDefault();
        post(`/invoices/${invoice.id}/payments`, {
            onSuccess: () => {
                setIsPaymentModalOpen(false);
                reset();
            },
        });
    };

    const handleCancelInvoice = (e) => {
        e.preventDefault();
        router.patch(`/invoices/${invoice.id}/cancel`, {
            reason: cancelReason,
        }, {
            onSuccess: () => setIsCancelModalOpen(false),
        });
    };

    const shareWhatsApp = () => {
        const text = `فاتورة ضريبية رقم ${invoice.invoice_number} من ${company.name} بمبلغ ${formatMoney(invoice.total_amount)}. المتبقي: ${formatMoney(invoice.remaining_amount)}.`;
        const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
        window.open(url, '_blank');
    };

    return (
        <AppLayout title={`فاتورة — ${invoice.invoice_number}`}>
            <div className="space-y-6">
                {/* Header Action Bar */}
                <div className="page-header">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Link href="/invoices" className="text-sm font-semibold text-slate-500 hover:text-sky-700 flex items-center gap-1">
                                <ArrowLeft className="w-4 h-4" />
                                <span>العودة للفواتير</span>
                            </Link>
                        </div>
                        <h1 className="page-title flex items-center gap-3">
                            <FileText className="w-7 h-7 text-sky-700" />
                            <span>فاتورة ضريبية: {invoice.invoice_number}</span>
                            <Badge status={invoice.status} text={invoice.status_name} />
                        </h1>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap items-center gap-2">
                        {invoice.status !== 'paid' && invoice.status !== 'cancelled' && (
                            <button
                                type="button"
                                onClick={() => setIsPaymentModalOpen(true)}
                                className="btn btn-primary flex items-center gap-1.5 shadow-sm"
                            >
                                <PlusCircle className="w-4 h-4" />
                                <span>+ تسجيل دفعة</span>
                            </button>
                        )}

                        <a
                            href={`/invoices/${invoice.id}/pdf`}
                            target="_blank"
                            className="btn btn-secondary flex items-center gap-1.5"
                        >
                            <Download className="w-4 h-4 text-slate-600" />
                            <span>تحميل PDF</span>
                        </a>

                        <a
                            href={`/invoices/${invoice.id}/print`}
                            target="_blank"
                            className="btn btn-secondary flex items-center gap-1.5"
                        >
                            <Printer className="w-4 h-4 text-slate-600" />
                            <span>طباعة</span>
                        </a>

                        <button
                            type="button"
                            onClick={shareWhatsApp}
                            className="btn btn-secondary flex items-center gap-1.5 text-emerald-700"
                        >
                            <Share2 className="w-4 h-4" />
                            <span>مشاركة WhatsApp</span>
                        </button>

                        {invoice.status !== 'cancelled' && (
                            <button
                                type="button"
                                onClick={() => setIsCancelModalOpen(true)}
                                className="btn btn-ghost text-red-600 hover:bg-red-50"
                            >
                                <Ban className="w-4 h-4" />
                                <span>إلغاء الفاتورة</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* Invoice Main View Card */}
                <div className="card space-y-6">
                    {/* Header Info: Company & Customer */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-slate-200">
                        {/* Company Data */}
                        <div className="space-y-1.5">
                            <div className="text-xl font-black text-slate-900">{company.name}</div>
                            {company.tax_number && (
                                <div className="text-xs text-slate-600">الرقم الضريبي: <strong>{company.tax_number}</strong></div>
                            )}
                            {company.commercial_register && (
                                <div className="text-xs text-slate-600">السجل التجاري: {company.commercial_register}</div>
                            )}
                            <div className="text-xs text-slate-600">{company.city} {company.address ? `• ${company.address}` : ''}</div>
                            {company.phone && <div className="text-xs text-slate-600">هاتف: {company.phone}</div>}
                        </div>

                        {/* Invoice & Customer Meta */}
                        <div className="space-y-1.5 md:text-left bg-slate-50 p-4 rounded-xl border border-slate-200">
                            <div className="text-xs font-bold text-sky-800">بيانات الفاتورة والعميل</div>
                            <div className="text-base font-bold text-slate-900">{invoice.customer ? invoice.customer.name : '—'}</div>
                            {invoice.customer && invoice.customer.tax_number && (
                                <div className="text-xs text-slate-600">الرقم الضريبي للعميل: {invoice.customer.tax_number}</div>
                            )}
                            <div className="text-xs text-slate-600">تاريخ الإصدار: <span className="font-mono">{invoice.issue_date}</span></div>
                            {invoice.due_date && (
                                <div className="text-xs text-slate-600">تاريخ الاستحقاق: <span className="font-mono">{invoice.due_date}</span></div>
                            )}
                        </div>
                    </div>

                    {/* Items Table */}
                    <div className="table-container border-0">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>المنتج / البيان</th>
                                    <th>الكمية</th>
                                    <th>سعر الوحدة</th>
                                    <th>الخصم</th>
                                    <th>الضريبة</th>
                                    <th>الإجمالي شامل الضريبة</th>
                                </tr>
                            </thead>
                            <tbody>
                                {invoice.items.map((item, idx) => (
                                    <tr key={item.id}>
                                        <td>{idx + 1}</td>
                                        <td>
                                            <div className="font-bold text-slate-900">{item.product_name}</div>
                                            {item.barcode && <div className="text-xs text-slate-400 font-mono">باركود: {item.barcode}</div>}
                                        </td>
                                        <td>{Number(item.quantity)} {item.product?.unit?.name || ''}</td>
                                        <td>{formatMoney(item.unit_price)}</td>
                                        <td>{item.discount_amount > 0 ? formatMoney(item.discount_amount) : '—'}</td>
                                        <td>{formatMoney(item.tax_amount)}</td>
                                        <td className="font-black text-slate-900">{formatMoney(item.total)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Totals Box */}
                    <div className="flex flex-col sm:flex-row justify-between gap-6 pt-4 border-t border-slate-200">
                        <div className="sm:w-1/2 space-y-3">
                            {invoice.notes && (
                                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                                    <div className="text-xs font-bold text-slate-700 mb-1">ملاحظات:</div>
                                    <div className="text-xs text-slate-600">{invoice.notes}</div>
                                </div>
                            )}
                            <div className="text-xs text-slate-400">
                                طريقة الدفع: {invoice.payment_method_name}
                            </div>
                        </div>

                        <div className="sm:w-80 space-y-2 text-sm bg-slate-50 p-4 rounded-xl border border-slate-200">
                            <div className="flex justify-between text-slate-600">
                                <span>المجموع الفرعي:</span>
                                <span className="font-mono font-bold">{formatMoney(invoice.subtotal)}</span>
                            </div>
                            {invoice.discount_amount > 0 && (
                                <div className="flex justify-between text-amber-700">
                                    <span>الخصم:</span>
                                    <span className="font-mono font-bold">-{formatMoney(invoice.discount_amount)}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-slate-600">
                                <span>ضريبة القيمة المضافة:</span>
                                <span className="font-mono font-bold">{formatMoney(invoice.tax_amount)}</span>
                            </div>
                            <div className="flex justify-between font-black text-base pt-2 border-t border-slate-200 text-slate-900">
                                <span>الإجمالي النهائي:</span>
                                <span className="font-mono text-sky-900">{formatMoney(invoice.total_amount)}</span>
                            </div>
                            <div className="flex justify-between font-bold text-emerald-700">
                                <span>المسدد:</span>
                                <span className="font-mono">{formatMoney(invoice.paid_amount)}</span>
                            </div>
                            <div className="flex justify-between font-black text-red-600 pt-1 border-t border-dashed border-slate-200">
                                <span>المتبقي:</span>
                                <span className="font-mono">{formatMoney(invoice.remaining_amount)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Payments & Receipt Vouchers Timeline */}
                <div className="card">
                    <div className="card-header">
                        <div className="card-title flex items-center gap-2">
                            <Receipt className="w-5 h-5 text-amber-500" />
                            <span>سجل الدفعات وسندات القبض المرتبطة ({invoice.payments.length})</span>
                        </div>
                    </div>

                    {invoice.payments.length === 0 ? (
                        <div className="text-center py-6 text-slate-400 text-sm">
                            لا توجد دفعات مسجلة على هذه الفاتورة حتى الآن.
                        </div>
                    ) : (
                        <div className="table-container border-0">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>رقم السند</th>
                                        <th>تاريخ الدفعة</th>
                                        <th>المبلغ</th>
                                        <th>طريقة الدفع</th>
                                        <th>المرجع</th>
                                        <th>سند القبض PDF</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {invoice.payments.map((p) => (
                                        <tr key={p.id}>
                                            <td className="font-mono font-bold text-sky-800">
                                                {p.receipt_voucher ? (
                                                    <Link href={`/receipt-vouchers/${p.receipt_voucher.id}`} className="hover:underline">
                                                        {p.receipt_voucher.voucher_number}
                                                    </Link>
                                                ) : '—'}
                                            </td>
                                            <td className="font-mono text-xs">{p.payment_date}</td>
                                            <td className="font-bold text-emerald-700">{formatMoney(p.amount)}</td>
                                            <td>{p.payment_method_name}</td>
                                            <td className="text-xs text-slate-500">{p.reference || '—'}</td>
                                            <td>
                                                {p.receipt_voucher && (
                                                    <a
                                                        href={`/receipt-vouchers/${p.receipt_voucher.id}/pdf`}
                                                        target="_blank"
                                                        className="btn btn-sm btn-secondary !py-1 !px-2 text-xs flex items-center gap-1 inline-flex"
                                                    >
                                                        <Download className="w-3.5 h-3.5" />
                                                        <span>تحميل السند</span>
                                                    </a>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Record Payment Modal */}
            <Modal
                isOpen={isPaymentModalOpen}
                onClose={() => setIsPaymentModalOpen(false)}
                title="تسجيل دفعة جديدة على الفاتورة"
                maxWidth="sm"
            >
                <form onSubmit={handlePaymentSubmit} className="space-y-4">
                    <div className="bg-slate-50 p-3 rounded-lg text-xs space-y-1">
                        <div>إجمالي الفاتورة: <strong>{formatMoney(invoice.total_amount)}</strong></div>
                        <div className="text-red-600">المبلغ المتبقي: <strong>{formatMoney(invoice.remaining_amount)}</strong></div>
                    </div>

                    <div>
                        <label className="label">مبلغ الدفعة (ر.س) *</label>
                        <input
                            type="number"
                            step="0.01"
                            min="0.01"
                            max={invoice.remaining_amount}
                            className={`input ${errors.amount ? 'input-error' : ''}`}
                            value={data.amount}
                            onChange={(e) => setData('amount', e.target.value)}
                            required
                        />
                        {errors.amount && <div className="field-error">{errors.amount}</div>}
                    </div>

                    <div>
                        <label className="label">طريقة الدفع</label>
                        <select
                            className="input"
                            value={data.payment_method}
                            onChange={(e) => setData('payment_method', e.target.value)}
                        >
                            <option value="cash">نقدي (كاش)</option>
                            <option value="bank">تحويل بنكي</option>
                            <option value="card">شبكة / مدى</option>
                            <option value="other">أخرى</option>
                        </select>
                    </div>

                    <div>
                        <label className="label">تاريخ الدفع</label>
                        <input
                            type="date"
                            className="input"
                            value={data.payment_date}
                            onChange={(e) => setData('payment_date', e.target.value)}
                            required
                        />
                    </div>

                    <div>
                        <label className="label">رقم المرجع / الحوالة (اختياري)</label>
                        <input
                            type="text"
                            className="input"
                            placeholder="رقم العملية البنكية..."
                            value={data.reference}
                            onChange={(e) => setData('reference', e.target.value)}
                        />
                    </div>

                    <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer text-slate-700 bg-emerald-50 p-2.5 rounded-lg border border-emerald-200">
                        <input
                            type="checkbox"
                            className="rounded border-emerald-300 text-emerald-600 focus:ring-emerald-500"
                            checked={data.create_receipt_voucher}
                            onChange={(e) => setData('create_receipt_voucher', e.target.checked)}
                        />
                        <span>إنشاء وتوليد سند قبض تلقائي للدفعة</span>
                    </label>

                    <div className="modal-footer -mx-6 -mb-6 mt-6">
                        <button type="submit" disabled={processing} className="btn btn-primary">
                            تسجيل الدفعة
                        </button>
                        <button type="button" onClick={() => setIsPaymentModalOpen(false)} className="btn btn-secondary">
                            إلغاء
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Cancel Invoice Modal */}
            <Modal
                isOpen={isCancelModalOpen}
                onClose={() => setIsCancelModalOpen(false)}
                title="تأكيد إلغاء الفاتورة"
                maxWidth="sm"
            >
                <form onSubmit={handleCancelInvoice} className="space-y-4">
                    <p className="text-sm text-slate-600">
                        هل أنت متأكد من رغبتك في إلغاء الفاتورة رقم <strong>{invoice.invoice_number}</strong>؟
                    </p>
                    <p className="text-xs text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-200">
                        ⚠️ سيتم إعادة جميع كميات المنتجات المباعة في الفاتورة إلى رصيد المخزون تلقائياً.
                    </p>

                    <div>
                        <label className="label">سبب الإلغاء (اختياري)</label>
                        <input
                            type="text"
                            className="input"
                            placeholder="مثال: خطأ في إدخال الأصناف..."
                            value={cancelReason}
                            onChange={(e) => setCancelReason(e.target.value)}
                        />
                    </div>

                    <div className="modal-footer -mx-6 -mb-6 mt-6">
                        <button type="submit" className="btn btn-danger">
                            تأكيد الإلغاء
                        </button>
                        <button type="button" onClick={() => setIsCancelModalOpen(false)} className="btn btn-secondary">
                            تراجع
                        </button>
                    </div>
                </form>
            </Modal>
        </AppLayout>
    );
}
