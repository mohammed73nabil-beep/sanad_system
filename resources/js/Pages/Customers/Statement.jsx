import React, { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import AppLayout from '@/Components/Layout/AppLayout';
import {
    FileText,
    ArrowLeft,
    Download,
    Calendar,
    Filter,
    ArrowDownLeft,
    ArrowUpRight,
    Building2,
    Phone,
} from 'lucide-react';

export default function CustomerStatement({ statement }) {
    const { customer, opening_balance, period_sales, period_paid, closing_balance, transactions, from_date, to_date } = statement;

    const [fromDateInput, setFromDateInput] = useState(from_date || '');
    const [toDateInput, setToDateInput] = useState(to_date || '');

    const handleFilter = (e) => {
        e.preventDefault();
        router.get(`/customers/${customer.id}/statement`, {
            from_date: fromDateInput,
            to_date: toDateInput,
        }, { preserveState: true });
    };

    const formatMoney = (val) => {
        return Number(val || 0).toLocaleString('ar-SA', { minimumFractionDigits: 2 }) + ' ر.س';
    };

    return (
        <AppLayout title={`كشف حساب — ${customer.name}`}>
            <div className="space-y-6">
                {/* Header with Back & Export Buttons */}
                <div className="page-header">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Link href="/customers" className="text-sm font-semibold text-slate-500 hover:text-sky-700 flex items-center gap-1">
                                <ArrowLeft className="w-4 h-4" />
                                <span>العودة للعملاء</span>
                            </Link>
                        </div>
                        <h1 className="page-title">
                            <FileText className="w-7 h-7 text-sky-700" />
                            <span>كشف حساب: {customer.name}</span>
                        </h1>
                    </div>

                    <div className="flex items-center gap-2">
                        <a
                            href={`/customers/${customer.id}/statement/pdf?from_date=${fromDateInput}&to_date=${toDateInput}`}
                            target="_blank"
                            className="btn btn-primary shadow-sm flex items-center gap-1.5"
                        >
                            <Download className="w-4 h-4" />
                            <span>تصدير PDF</span>
                        </a>
                    </div>
                </div>

                {/* Customer Details Box */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row justify-between gap-4">
                    <div className="space-y-1">
                        <div className="text-lg font-black text-slate-900">{customer.name}</div>
                        <div className="text-sm text-slate-500 flex items-center gap-3">
                            <span>النوع: {customer.type_name}</span>
                            {customer.phone && <span>• جوال: {customer.phone}</span>}
                            {customer.tax_number && <span>• الرقم الضريبي: {customer.tax_number}</span>}
                        </div>
                    </div>

                    {/* Date Filter Form */}
                    <form onSubmit={handleFilter} className="flex flex-wrap items-center gap-2">
                        <div className="flex items-center gap-1.5 text-sm">
                            <span className="text-slate-600 font-medium">من:</span>
                            <input
                                type="date"
                                className="input !py-1.5 !px-2 text-xs w-36"
                                value={fromDateInput}
                                onChange={(e) => setFromDateInput(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-1.5 text-sm">
                            <span className="text-slate-600 font-medium">إلى:</span>
                            <input
                                type="date"
                                className="input !py-1.5 !px-2 text-xs w-36"
                                value={toDateInput}
                                onChange={(e) => setToDateInput(e.target.value)}
                            />
                        </div>
                        <button type="submit" className="btn btn-sm btn-secondary">
                            تطبيق
                        </button>
                    </form>
                </div>

                {/* Financial Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="stat-card">
                        <div>
                            <div className="stat-value text-slate-700">{formatMoney(opening_balance)}</div>
                            <div className="stat-label">الرصيد السابق (قبل الفترة)</div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div>
                            <div className="stat-value text-sky-900">{formatMoney(period_sales)}</div>
                            <div className="stat-label">إجمالي فواتير الفترة (مدين +)</div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div>
                            <div className="stat-value text-emerald-700">{formatMoney(period_paid)}</div>
                            <div className="stat-label">إجمالي المسدد بالفترة (دائن -)</div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div>
                            <div className={`stat-value ${closing_balance > 0 ? 'text-red-600' : 'text-emerald-700'}`}>
                                {formatMoney(closing_balance)}
                            </div>
                            <div className="stat-label">الرصيد النهائي المستحق</div>
                        </div>
                    </div>
                </div>

                {/* Statement Transactions Timeline Table */}
                <div className="table-container bg-white shadow-xs">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>التاريخ</th>
                                <th>نوع الحركة</th>
                                <th>المرجع</th>
                                <th>البيان</th>
                                <th>مدين (عليك +)</th>
                                <th>دائن (سددت -)</th>
                                <th>الرصيد التراكمي</th>
                            </tr>
                        </thead>
                        <tbody>
                            {opening_balance !== 0 && (
                                <tr className="bg-slate-50 font-bold">
                                    <td>{from_date || '—'}</td>
                                    <td>رصيد</td>
                                    <td>—</td>
                                    <td>رصيد افتتاحي سابق</td>
                                    <td>{opening_balance > 0 ? formatMoney(opening_balance) : '—'}</td>
                                    <td>{opening_balance < 0 ? formatMoney(Math.abs(opening_balance)) : '—'}</td>
                                    <td>{formatMoney(opening_balance)}</td>
                                </tr>
                            )}

                            {transactions.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="text-center py-10 text-slate-400">
                                        لا توجد حركات مسجلة خلال الفترة المحددة.
                                    </td>
                                </tr>
                            ) : (
                                transactions.map((t, idx) => (
                                    <tr key={idx}>
                                        <td className="font-mono text-xs">{t.date}</td>
                                        <td>
                                            <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${t.type === 'invoice' ? 'bg-sky-50 text-sky-800' : 'bg-emerald-50 text-emerald-800'}`}>
                                                {t.type === 'invoice' ? 'فاتورة مبيعات' : 'سداد دفعة'}
                                            </span>
                                        </td>
                                        <td className="font-mono text-xs font-bold text-slate-800">{t.reference}</td>
                                        <td>{t.description}</td>
                                        <td className="font-bold text-red-600">
                                            {t.debit > 0 ? formatMoney(t.debit) : '—'}
                                        </td>
                                        <td className="font-bold text-emerald-700">
                                            {t.credit > 0 ? formatMoney(t.credit) : '—'}
                                        </td>
                                        <td className="font-black text-slate-900">
                                            {formatMoney(t.balance)}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AppLayout>
    );
}
