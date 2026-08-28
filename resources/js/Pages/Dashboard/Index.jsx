import React from 'react';
import { Link } from '@inertiajs/react';
import AppLayout from '@/Components/Layout/AppLayout';
import Badge from '@/Components/UI/Badge';
import {
    TrendingUp,
    ShoppingBag,
    FileText,
    Receipt,
    Wallet,
    AlertTriangle,
    Package,
    Users,
    ArrowUpRight,
    PlusCircle,
    Building2,
    Calendar,
    ChevronLeft,
} from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';

export default function Dashboard({
    metrics,
    charts,
    recent_invoices,
    recent_purchases,
    debt_customers,
    low_stock_products,
    recent_vouchers,
}) {
    const formatMoney = (amount) => {
        return Number(amount || 0).toLocaleString('ar-SA', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }) + ' ر.س';
    };

    return (
        <AppLayout title="لوحة التحكم">
            <div className="space-y-6">
                {/* Header Welcome Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                            مرحباً بك في سَنَد
                            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-300">
                                الإصدار الأول
                            </span>
                        </h1>
                        <p className="text-slate-500 text-sm mt-1">
                            نظرة عامة ومباشرة على نشاط المبيعات والمشتريات والمخزون
                        </p>
                    </div>

                    <div className="flex items-center gap-2.5">
                        <Link
                            href="/invoices/create"
                            className="btn btn-primary shadow-sm flex items-center gap-1.5"
                        >
                            <PlusCircle className="w-4 h-4" />
                            <span>+ إنشاء فاتورة جديدة</span>
                        </Link>
                        <Link
                            href="/purchases/create"
                            className="btn btn-secondary flex items-center gap-1.5"
                        >
                            <ShoppingBag className="w-4 h-4 text-slate-500" />
                            <span>+ فاتورة شراء</span>
                        </Link>
                    </div>
                </div>

                {/* Main KPI Stat Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Today Sales */}
                    <div className="stat-card">
                        <div className="stat-icon bg-emerald-50 text-emerald-600 border border-emerald-200">
                            <TrendingUp className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="stat-value text-emerald-700">{formatMoney(metrics.today_sales)}</div>
                            <div className="stat-label">مبيعات اليوم</div>
                        </div>
                    </div>

                    {/* Month Sales */}
                    <div className="stat-card">
                        <div className="stat-icon bg-sky-50 text-sky-700 border border-sky-200">
                            <FileText className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="stat-value text-sky-900">{formatMoney(metrics.month_sales)}</div>
                            <div className="stat-label">مبيعات هذا الشهر</div>
                        </div>
                    </div>

                    {/* Month Purchases */}
                    <div className="stat-card">
                        <div className="stat-icon bg-indigo-50 text-indigo-700 border border-indigo-200">
                            <ShoppingBag className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="stat-value text-indigo-900">{formatMoney(metrics.month_purchases)}</div>
                            <div className="stat-label">مشتريات هذا الشهر</div>
                        </div>
                    </div>

                    {/* Collected Amount */}
                    <div className="stat-card">
                        <div className="stat-icon bg-amber-50 text-amber-700 border border-amber-200">
                            <Receipt className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="stat-value text-amber-800">{formatMoney(metrics.total_collected)}</div>
                            <div className="stat-label">المحصل هذا الشهر</div>
                        </div>
                    </div>

                    {/* Total Remaining Debt */}
                    <div className="stat-card">
                        <div className="stat-icon bg-red-50 text-red-600 border border-red-200">
                            <Wallet className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="stat-value text-red-600">{formatMoney(metrics.total_remaining)}</div>
                            <div className="stat-label">إجمالي المبالغ المستحقة (على العملاء)</div>
                        </div>
                    </div>

                    {/* Total Invoices */}
                    <div className="stat-card">
                        <div className="stat-icon bg-slate-100 text-slate-700 border border-slate-200">
                            <FileText className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="stat-value text-slate-800">{metrics.total_invoices_count}</div>
                            <div className="stat-label">إجمالي عدد الفواتير</div>
                        </div>
                    </div>

                    {/* Inventory Value */}
                    <div className="stat-card">
                        <div className="stat-icon bg-teal-50 text-teal-700 border border-teal-200">
                            <Package className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="stat-value text-teal-800">{formatMoney(metrics.inventory_value)}</div>
                            <div className="stat-label">إجمالي قيمة المخزون (سعر الشراء)</div>
                        </div>
                    </div>

                    {/* Estimated Profit */}
                    <div className="stat-card">
                        <div className="stat-icon bg-gradient-to-tr from-amber-500 to-amber-400 text-slate-950 font-bold">
                            <TrendingUp className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="stat-value text-amber-900">{formatMoney(metrics.estimated_profit)}</div>
                            <div className="stat-label">الأرباح التقديرية (هذا الشهر)</div>
                        </div>
                    </div>
                </div>

                {/* Sales Chart: Last 7 Days */}
                <div className="card">
                    <div className="card-header">
                        <div>
                            <div className="card-title flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-sky-700" />
                                <span>مبيعات آخر 7 أيام</span>
                            </div>
                            <div className="text-xs text-slate-500 mt-0.5">تتبع أداء المبيعات اليومي للمنشأة</div>
                        </div>
                    </div>

                    <div className="h-72 w-full pt-4" dir="ltr">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={charts.last_7_days} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                <XAxis dataKey="day" stroke="#64748B" fontSize={12} tickLine={false} />
                                <YAxis stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip
                                    formatter={(value) => [`${Number(value).toLocaleString()} ر.س`, 'المبيعات']}
                                    labelFormatter={(label) => `يوم ${label}`}
                                    contentStyle={{ backgroundColor: '#ffffff', borderRadius: '10px', border: '1px solid #E2E8F0', direction: 'rtl', textAlign: 'right' }}
                                />
                                <Bar dataKey="amount" fill="#1B4B6B" radius={[6, 6, 0, 0]} maxBarSize={50} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Two Columns: Recent Invoices & Recent Purchases */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Recent Invoices */}
                    <div className="card">
                        <div className="card-header">
                            <div className="card-title flex items-center gap-2">
                                <FileText className="w-5 h-5 text-sky-700" />
                                <span>آخر فواتير المبيعات</span>
                            </div>
                            <Link href="/invoices" className="text-xs text-sky-700 font-bold hover:underline flex items-center gap-1">
                                <span>عرض الكل</span>
                                <ChevronLeft className="w-4 h-4" />
                            </Link>
                        </div>

                        <div className="divide-y divide-slate-100">
                            {recent_invoices.length === 0 ? (
                                <div className="text-center py-8 text-slate-400 text-sm">
                                    لا توجد فواتير مبيعات مسجلة حتى الآن.
                                </div>
                            ) : (
                                recent_invoices.map((inv) => (
                                    <Link
                                        key={inv.id}
                                        href={`/invoices/${inv.id}`}
                                        className="flex items-center justify-between py-3 hover:bg-slate-50 px-2 rounded-lg transition-colors"
                                    >
                                        <div>
                                            <div className="text-sm font-bold text-slate-800">{inv.invoice_number}</div>
                                            <div className="text-xs text-slate-500">{inv.customer ? inv.customer.name : '—'} • {inv.issue_date}</div>
                                        </div>
                                        <div className="text-left">
                                            <div className="text-sm font-black text-slate-900">{formatMoney(inv.total_amount)}</div>
                                            <div className="mt-0.5"><Badge status={inv.status} text={inv.status_name} /></div>
                                        </div>
                                    </Link>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Recent Purchases */}
                    <div className="card">
                        <div className="card-header">
                            <div className="card-title flex items-center gap-2">
                                <ShoppingBag className="w-5 h-5 text-indigo-700" />
                                <span>آخر فواتير المشتريات</span>
                            </div>
                            <Link href="/purchases" className="text-xs text-indigo-700 font-bold hover:underline flex items-center gap-1">
                                <span>عرض الكل</span>
                                <ChevronLeft className="w-4 h-4" />
                            </Link>
                        </div>

                        <div className="divide-y divide-slate-100">
                            {recent_purchases.length === 0 ? (
                                <div className="text-center py-8 text-slate-400 text-sm">
                                    لا توجد فواتير شراء مسجلة حتى الآن.
                                </div>
                            ) : (
                                recent_purchases.map((pur) => (
                                    <Link
                                        key={pur.id}
                                        href={`/purchases/${pur.id}`}
                                        className="flex items-center justify-between py-3 hover:bg-slate-50 px-2 rounded-lg transition-colors"
                                    >
                                        <div>
                                            <div className="text-sm font-bold text-slate-800">{pur.purchase_number}</div>
                                            <div className="text-xs text-slate-500">{pur.supplier ? pur.supplier.name : '—'} • {pur.purchase_date}</div>
                                        </div>
                                        <div className="text-left">
                                            <div className="text-sm font-black text-slate-900">{formatMoney(pur.total_amount)}</div>
                                            <div className="mt-0.5">
                                                <Badge
                                                    status={pur.status === 'confirmed' ? 'paid' : 'draft'}
                                                    text={pur.status === 'confirmed' ? 'معتمدة' : 'مسودة'}
                                                />
                                            </div>
                                        </div>
                                    </Link>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Additional Sections: Top Debtors & Low Stock Alerts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Top Debtors */}
                    <div className="card">
                        <div className="card-header">
                            <div className="card-title flex items-center gap-2">
                                <Users className="w-5 h-5 text-amber-600" />
                                <span>العملاء الأكثر مديونية</span>
                            </div>
                            <Link href="/customers?with_debt=1" className="text-xs text-sky-700 font-bold hover:underline flex items-center gap-1">
                                <span>الكل</span>
                                <ChevronLeft className="w-4 h-4" />
                            </Link>
                        </div>

                        <div className="divide-y divide-slate-100">
                            {debt_customers.length === 0 ? (
                                <div className="text-center py-8 text-emerald-600 text-sm font-semibold">
                                    🎉 لا توجد مبالغ متأخرة أو متبقية على أي عميل حالياً!
                                </div>
                            ) : (
                                debt_customers.map((c) => (
                                    <div key={c.id} className="flex items-center justify-between py-3">
                                        <div>
                                            <Link href={`/customers/${c.id}/statement`} className="text-sm font-bold text-slate-800 hover:text-sky-700">
                                                {c.name}
                                            </Link>
                                            <div className="text-xs text-slate-500">{c.phone || 'بدون هاتف'} • إجمالي المبيعات: {formatMoney(c.total_sales)}</div>
                                        </div>
                                        <div className="text-left">
                                            <div className="text-sm font-black text-red-600">{formatMoney(c.total_remaining)}</div>
                                            <Link href={`/customers/${c.id}/statement`} className="text-xs text-sky-700 hover:underline">
                                                كشف الحساب
                                            </Link>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Low Stock Alerts */}
                    <div className="card">
                        <div className="card-header">
                            <div className="card-title flex items-center gap-2">
                                <AlertTriangle className="w-5 h-5 text-amber-500" />
                                <span>تنبيهات انخفاض المخزون</span>
                            </div>
                            <Link href="/inventory?status=low" className="text-xs text-sky-700 font-bold hover:underline flex items-center gap-1">
                                <span>المخزون</span>
                                <ChevronLeft className="w-4 h-4" />
                            </Link>
                        </div>

                        <div className="divide-y divide-slate-100">
                            {low_stock_products.length === 0 ? (
                                <div className="text-center py-8 text-emerald-600 text-sm font-semibold">
                                    ✅ جميع المنتجات متوفرة بكميات كافية أعلى من الحد الأدنى.
                                </div>
                            ) : (
                                low_stock_products.map((p) => (
                                    <div key={p.id} className="flex items-center justify-between py-3">
                                        <div>
                                            <div className="text-sm font-bold text-slate-800">{p.name}</div>
                                            <div className="text-xs text-slate-500">SKU: {p.sku} {p.barcode ? `• باركود: ${p.barcode}` : ''}</div>
                                        </div>
                                        <div className="text-left">
                                            <div className="text-sm font-black text-amber-600">
                                                {Number(p.stock_quantity)} {p.unit ? p.unit.name : 'حبة'}
                                            </div>
                                            <div className="text-xs text-slate-400">الحد الأدنى: {Number(p.min_stock_level)}</div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
