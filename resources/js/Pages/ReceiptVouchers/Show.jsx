import React from 'react';
import { Link } from '@inertiajs/react';
import AppLayout from '@/Components/Layout/AppLayout';
import {
    Receipt,
    ArrowLeft,
    Download,
    FileText,
    Calendar,
    User,
    Building2,
    DollarSign,
} from 'lucide-react';

export default function ReceiptVouchersShow({ voucher, company }) {
    const formatMoney = (val) => {
        return Number(val || 0).toLocaleString('ar-SA', { minimumFractionDigits: 2 }) + ' ر.س';
    };

    return (
        <AppLayout title={`سند قبض — ${voucher.voucher_number}`}>
            <div className="space-y-6">
                <div className="page-header">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Link href="/receipt-vouchers" className="text-sm font-semibold text-slate-500 hover:text-amber-700 flex items-center gap-1">
                                <ArrowLeft className="w-4 h-4" />
                                <span>العودة لسندات القبض</span>
                            </Link>
                        </div>
                        <h1 className="page-title">
                            <Receipt className="w-7 h-7 text-amber-500" />
                            <span>سند قبض: {voucher.voucher_number}</span>
                        </h1>
                    </div>

                    <div className="flex items-center gap-2">
                        <a
                            href={`/receipt-vouchers/${voucher.id}/pdf`}
                            target="_blank"
                            className="btn btn-primary shadow-sm flex items-center gap-1.5"
                        >
                            <Download className="w-4 h-4" />
                            <span>تحميل سند القبض PDF</span>
                        </a>
                    </div>
                </div>

                {/* Voucher Box Card */}
                <div className="card space-y-6 border-2 border-slate-200">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center pb-6 border-b-2 border-amber-500 gap-4">
                        <div>
                            <div className="text-2xl font-black text-slate-900">{company.name}</div>
                            {company.tax_number && <div className="text-xs text-slate-500">الرقم الضريبي: {company.tax_number}</div>}
                            {company.phone && <div className="text-xs text-slate-500">هاتف: {company.phone}</div>}
                        </div>
                        <div className="text-left">
                            <div className="text-2xl font-black text-amber-600">سَنَد قَبْض</div>
                            <div className="font-mono font-bold text-slate-800 mt-1">{voucher.voucher_number}</div>
                            <div className="text-xs text-slate-500 mt-0.5">التاريخ: {voucher.voucher_date}</div>
                        </div>
                    </div>

                    {/* Amount Highlight */}
                    <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex items-center justify-between">
                        <div className="text-sm text-slate-600 font-bold">المبلغ المقبوض:</div>
                        <div className="text-2xl font-black text-emerald-700 font-mono">
                            {formatMoney(voucher.amount)}
                        </div>
                    </div>

                    {/* Details Table */}
                    <div className="space-y-3 text-sm divide-y divide-slate-100">
                        <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                            <span className="text-slate-500 font-bold sm:w-1/3">استلمنا من المكرم / المحل:</span>
                            <span className="font-black text-slate-900 sm:w-2/3">{voucher.customer ? voucher.customer.name : '—'}</span>
                        </div>

                        <div className="pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                            <span className="text-slate-500 font-bold sm:w-1/3">المبلغ كتابةً (تفقيط):</span>
                            <span className="font-bold text-amber-900 sm:w-2/3">{voucher.amount_in_words || '—'}</span>
                        </div>

                        <div className="pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                            <span className="text-slate-500 font-bold sm:w-1/3">طريقة الدفع:</span>
                            <span className="font-semibold text-slate-800 sm:w-2/3">
                                {voucher.payment_method_name} {voucher.reference ? `(رقم المرجع: ${voucher.reference})` : ''}
                            </span>
                        </div>

                        {voucher.invoice && (
                            <div className="pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                                <span className="text-slate-500 font-bold sm:w-1/3">عن سداد الفاتورة:</span>
                                <span className="sm:w-2/3">
                                    <Link href={`/invoices/${voucher.invoice.id}`} className="font-mono font-bold text-sky-700 hover:underline">
                                        {voucher.invoice.invoice_number}
                                    </Link>
                                    <span className="text-xs text-slate-400 mr-2">(إجمالي الفاتورة: {formatMoney(voucher.invoice.total_amount)})</span>
                                </span>
                            </div>
                        )}

                        <div className="pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                            <span className="text-slate-500 font-bold sm:w-1/3">البيان / ملاحظات:</span>
                            <span className="text-slate-700 sm:w-2/3">{voucher.description || '—'}</span>
                        </div>
                    </div>

                    <div className="pt-8 border-t border-slate-200 grid grid-cols-2 text-center text-xs text-slate-500">
                        <div>
                            <div>المستلم المسؤول</div>
                            <div className="font-bold text-slate-800 mt-1">{voucher.creator ? voucher.creator.name : '—'}</div>
                            <div className="mt-8 border-t border-dotted border-slate-300 w-32 mx-auto pt-1">التوقيع</div>
                        </div>
                        <div>
                            <div>توقيع المسلم (العميل)</div>
                            <div className="mt-11 border-t border-dotted border-slate-300 w-32 mx-auto pt-1">التوقيع</div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
