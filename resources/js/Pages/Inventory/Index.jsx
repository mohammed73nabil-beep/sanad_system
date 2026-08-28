import React, { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import AppLayout from '@/Components/Layout/AppLayout';
import Badge from '@/Components/UI/Badge';
import {
    Package,
    ArrowLeftRight,
    Search,
    AlertTriangle,
    Building2,
    DollarSign,
} from 'lucide-react';

export default function InventoryIndex({ products, categories, filters, summary }) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [selectedCategory, setSelectedCategory] = useState(filters.category_id || '');
    const [selectedStatus, setSelectedStatus] = useState(filters.status || '');

    const handleFilter = (e) => {
        if (e) e.preventDefault();
        router.get('/inventory', {
            search: searchTerm,
            category_id: selectedCategory,
            status: selectedStatus,
        }, { preserveState: true });
    };

    const formatMoney = (val) => {
        return Number(val || 0).toLocaleString('ar-SA', { minimumFractionDigits: 2 }) + ' ر.س';
    };

    return (
        <AppLayout title="إدارة وحالة المخزون">
            <div className="space-y-6">
                <div className="page-header">
                    <div>
                        <h1 className="page-title">
                            <Package className="w-7 h-7 text-teal-700" />
                            <span>حالة المخزون والكميات</span>
                        </h1>
                        <p className="page-subtitle">
                            متابعة الكميات الحالية المتوفرة، تقييم المخزون، وتنبيهات النواقص
                        </p>
                    </div>

                    <Link
                        href="/inventory/movements"
                        className="btn btn-secondary flex items-center gap-1.5"
                    >
                        <ArrowLeftRight className="w-4 h-4 text-slate-600" />
                        <span>سجل حركة المخزون</span>
                    </Link>
                </div>

                {/* Summary */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="stat-card">
                        <div>
                            <div className="stat-value text-slate-800">{summary.total_items}</div>
                            <div className="stat-label">إجمالي عدد المنتجات</div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div>
                            <div className="stat-value text-teal-800">{formatMoney(summary.total_valuation)}</div>
                            <div className="stat-label">إجمالي القيمة التقديرية (شراء)</div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div>
                            <div className="stat-value text-amber-600">{summary.low_stock_count}</div>
                            <div className="stat-label">منتجات منخفضة المخزون</div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div>
                            <div className="stat-value text-red-600">{summary.out_of_stock_count}</div>
                            <div className="stat-label">منتجات نفدت من المخزون</div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="card !p-4 flex flex-col md:flex-row gap-3 items-center justify-between">
                    <form onSubmit={handleFilter} className="flex gap-2 w-full md:w-80">
                        <div className="relative flex-1">
                            <input
                                type="text"
                                className="input pr-9 text-sm"
                                placeholder="بحث باسم المنتج أو SKU..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                        <button type="submit" className="btn btn-secondary text-sm">
                            بحث
                        </button>
                    </form>

                    <div className="flex flex-wrap gap-2 w-full md:w-auto">
                        <select
                            className="input !py-1.5 !px-2.5 text-xs w-36"
                            value={selectedCategory}
                            onChange={(e) => {
                                setSelectedCategory(e.target.value);
                                router.get('/inventory', { search: searchTerm, category_id: e.target.value, status: selectedStatus }, { preserveState: true });
                            }}
                        >
                            <option value="">جميع التصنيفات</option>
                            {categories.map((c) => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>

                        <select
                            className="input !py-1.5 !px-2.5 text-xs w-36"
                            value={selectedStatus}
                            onChange={(e) => {
                                setSelectedStatus(e.target.value);
                                router.get('/inventory', { search: searchTerm, category_id: selectedCategory, status: e.target.value }, { preserveState: true });
                            }}
                        >
                            <option value="">جميع الحالات</option>
                            <option value="low">منخفض المخزون</option>
                            <option value="empty">نفد من المخزون</option>
                        </select>
                    </div>
                </div>

                {/* Table */}
                <div className="table-container bg-white shadow-xs">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>المنتج</th>
                                <th>التصنيف</th>
                                <th>الكمية المتوفرة</th>
                                <th>الحد الأدنى</th>
                                <th>سعر الشراء</th>
                                <th>سعر البيع</th>
                                <th>إجمالي القيمة بالمخزون</th>
                                <th>الحالة</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.data.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="text-center py-10 text-slate-400">
                                        لا توجد منتجات مسجلة.
                                    </td>
                                </tr>
                            ) : (
                                products.data.map((p) => {
                                    const totalVal = Number(p.stock_quantity) * Number(p.purchase_price);
                                    return (
                                        <tr key={p.id}>
                                            <td>
                                                <div className="font-bold text-slate-900">{p.name}</div>
                                                <div className="text-xs text-slate-400 font-mono">SKU: {p.sku}</div>
                                            </td>
                                            <td>
                                                <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-semibold">
                                                    {p.category ? p.category.name : '—'}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="font-black text-slate-900 text-sm">
                                                    {Number(p.stock_quantity)} {p.unit ? p.unit.name : ''}
                                                </div>
                                            </td>
                                            <td className="text-slate-500 font-mono text-xs">
                                                {Number(p.min_stock_level)} {p.unit ? p.unit.name : ''}
                                            </td>
                                            <td className="text-slate-600 font-bold">{formatMoney(p.purchase_price)}</td>
                                            <td className="text-sky-800 font-bold">{formatMoney(p.sale_price)}</td>
                                            <td className="font-black text-teal-800">{formatMoney(totalVal)}</td>
                                            <td>
                                                <Badge status={p.stock_status} text={p.stock_status_name} />
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {products.links && products.links.length > 3 && (
                    <div className="flex justify-center gap-1 py-4">
                        {products.links.map((link, i) => (
                            <Link
                                key={i}
                                href={link.url || '#'}
                                className={`px-3 py-1.5 rounded-lg text-sm font-semibold ${link.active ? 'bg-sky-700 text-white' : link.url ? 'bg-white text-slate-700 border hover:bg-slate-50' : 'text-slate-400 pointer-events-none'}`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
