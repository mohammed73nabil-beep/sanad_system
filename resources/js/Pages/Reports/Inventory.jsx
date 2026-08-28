import React from 'react';
import AppLayout from '@/Components/Layout/AppLayout';
import { Package } from 'lucide-react';

export default function InventoryReport({ products, total_valuation }) {
    const formatMoney = (val) => Number(val || 0).toLocaleString('ar-SA', { minimumFractionDigits: 2 }) + ' ر.س';

    return (
        <AppLayout title="تقرير تقييم المخزون">
            <div className="space-y-6">
                <div className="page-header">
                    <div>
                        <h1 className="page-title">
                            <Package className="w-7 h-7 text-teal-700" />
                            <span>تقرير تقييم المخزون المالي</span>
                        </h1>
                    </div>
                </div>

                <div className="stat-card max-w-sm">
                    <div>
                        <div className="stat-value text-teal-800">{formatMoney(total_valuation)}</div>
                        <div className="stat-label">إجمالي القيمة التقديرية لكامل المخزون (بسعر الشراء)</div>
                    </div>
                </div>

                <div className="table-container bg-white shadow-xs">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>المنتج</th>
                                <th>SKU</th>
                                <th>التصنيف</th>
                                <th>الكمية المتوفرة</th>
                                <th>سعر الشراء</th>
                                <th>القيمة الإجمالية بالمخزون</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map((p) => {
                                const val = Number(p.stock_quantity) * Number(p.purchase_price);
                                return (
                                    <tr key={p.id}>
                                        <td className="font-bold text-slate-900">{p.name}</td>
                                        <td className="font-mono text-xs">{p.sku}</td>
                                        <td>{p.category ? p.category.name : '—'}</td>
                                        <td className="font-bold">{Number(p.stock_quantity)} {p.unit?.name || ''}</td>
                                        <td>{formatMoney(p.purchase_price)}</td>
                                        <td className="font-black text-teal-800">{formatMoney(val)}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </AppLayout>
    );
}
