import React from 'react';
import { Link, router } from '@inertiajs/react';
import AppLayout from '@/Components/Layout/AppLayout';
import Badge from '@/Components/UI/Badge';
import {
    ShoppingBag,
    ArrowLeft,
    Download,
    CheckCircle2,
    Truck,
    Calendar,
    FileText,
} from 'lucide-react';

export default function PurchasesShow({ purchase, company }) {
    const formatMoney = (val) => {
        return Number(val || 0).toLocaleString('ar-SA', { minimumFractionDigits: 2 }) + ' ر.س';
    };

    const handleConfirm = () => {
        if (confirm('هل أنت متأكد من اعتماد فاتورة الشراء وزيادة كميات المخزون؟')) {
            router.patch(`/purchases/${purchase.id}/confirm`);
        }
    };

    return (
        <AppLayout title={`فاتورة شراء — ${purchase.purchase_number}`}>
            <div className="space-y-6">
                <div className="page-header">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Link href="/purchases" className="text-sm font-semibold text-slate-500 hover:text-indigo-700 flex items-center gap-1">
                                <ArrowLeft className="w-4 h-4" />
                                <span>العودة للمشتريات</span>
                            </Link>
                        </div>
                        <h1 className="page-title flex items-center gap-3">
                            <ShoppingBag className="w-7 h-7 text-indigo-700" />
                            <span>فاتورة شراء: {purchase.purchase_number}</span>
                            <Badge
                                status={purchase.status === 'confirmed' ? 'paid' : 'draft'}
                                text={purchase.status === 'confirmed' ? 'معتمدة (المخزون محدث)' : 'مسودة'}
                            />
                        </h1>
                    </div>

                    <div className="flex items-center gap-2">
                        {purchase.status === 'draft' && (
                            <button
                                type="button"
                                onClick={handleConfirm}
                                className="btn btn-primary flex items-center gap-1.5 shadow-sm"
                            >
                                <CheckCircle2 className="w-4 h-4" />
                                <span>اعتماد الفاتورة وتحديث المخزون</span>
                            </button>
                        )}
                        {purchase.attachment_path && (
                            <a
                                href={`/storage/${purchase.attachment_path}`}
                                target="_blank"
                                className="btn btn-secondary flex items-center gap-1.5"
                            >
                                <Download className="w-4 h-4" />
                                <span>عرض مرفق المورد</span>
                            </a>
                        )}
                    </div>
                </div>

                <div className="card space-y-6">
                    {/* Header Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-slate-200">
                        <div className="space-y-1.5">
                            <div className="text-xs font-bold text-slate-400">بيانات المنشأة (المشتري)</div>
                            <div className="text-xl font-black text-slate-900">{company.name}</div>
                            {company.tax_number && (
                                <div className="text-xs text-slate-600">الرقم الضريبي: {company.tax_number}</div>
                            )}
                        </div>

                        <div className="space-y-1.5 md:text-left bg-slate-50 p-4 rounded-xl border border-slate-200">
                            <div className="text-xs font-bold text-indigo-800">بيانات المورد</div>
                            <div className="text-base font-bold text-slate-900">{purchase.supplier ? purchase.supplier.name : '—'}</div>
                            {purchase.supplier_invoice_number && (
                                <div className="text-xs text-slate-600">رقم فاتورة المورد: <strong>{purchase.supplier_invoice_number}</strong></div>
                            )}
                            <div className="text-xs text-slate-600">تاريخ الشراء: <span className="font-mono">{purchase.purchase_date}</span></div>
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
                                    <th>سعر الشراء</th>
                                    <th>الخصم</th>
                                    <th>الضريبة</th>
                                    <th>الإجمالي شامل الضريبة</th>
                                </tr>
                            </thead>
                            <tbody>
                                {purchase.items.map((item, idx) => (
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

                    {/* Totals */}
                    <div className="flex flex-col sm:flex-row justify-between gap-6 pt-4 border-t border-slate-200">
                        <div className="sm:w-1/2">
                            {purchase.notes && (
                                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                                    <div className="font-bold text-slate-700 mb-1">ملاحظات:</div>
                                    <div className="text-slate-600">{purchase.notes}</div>
                                </div>
                            )}
                        </div>

                        <div className="sm:w-80 space-y-2 text-sm bg-slate-50 p-4 rounded-xl border border-slate-200">
                            <div className="flex justify-between text-slate-600">
                                <span>المجموع الفرعي:</span>
                                <span className="font-mono font-bold">{formatMoney(purchase.subtotal)}</span>
                            </div>
                            {purchase.discount_amount > 0 && (
                                <div className="flex justify-between text-amber-700">
                                    <span>الخصم:</span>
                                    <span className="font-mono font-bold">-{formatMoney(purchase.discount_amount)}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-slate-600">
                                <span>ضريبة القيمة المضافة:</span>
                                <span className="font-mono font-bold">{formatMoney(purchase.tax_amount)}</span>
                            </div>
                            <div className="flex justify-between font-black text-base pt-2 border-t border-slate-200 text-slate-900">
                                <span>الإجمالي النهائي:</span>
                                <span className="font-mono text-indigo-900">{formatMoney(purchase.total_amount)}</span>
                            </div>
                            <div className="flex justify-between font-bold text-emerald-700">
                                <span>المسدد للمورد:</span>
                                <span className="font-mono">{formatMoney(purchase.paid_amount)}</span>
                            </div>
                            <div className="flex justify-between font-black text-red-600 pt-1 border-t border-dashed border-slate-200">
                                <span>المتبقي للمورد:</span>
                                <span className="font-mono">{formatMoney(purchase.remaining_amount)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
