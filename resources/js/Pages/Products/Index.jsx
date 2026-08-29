import React, { useState } from 'react';
import { useForm, router } from '@inertiajs/react';
import AppLayout from '@/Components/Layout/AppLayout';
import Modal from '@/Components/UI/Modal';
import Badge from '@/Components/UI/Badge';
import {
    Package,
    Plus,
    Search,
    Edit2,
    Trash2,
    Barcode,
    AlertTriangle,
    Filter,
} from 'lucide-react';

export default function ProductsIndex({ products, categories, units, filters, default_tax_rate }) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [selectedCategory, setSelectedCategory] = useState(filters.category_id || '');
    const [selectedStockStatus, setSelectedStockStatus] = useState(filters.stock_status || '');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);

    const { data, setData, post, put, processing, errors, reset } = useForm({
        name: '',
        sku: '',
        barcode: '',
        category_id: '',
        unit_id: '',
        purchase_price: '',
        sale_price: '',
        tax_rate: default_tax_rate || 15.00,
        stock_quantity: '0',
        min_stock_level: '5',
        description: '',
        status: 'active',
    });

    const handleFilter = (e) => {
        if (e) e.preventDefault();
        router.get('/products', {
            search: searchTerm,
            category_id: selectedCategory,
            stock_status: selectedStockStatus,
        }, { preserveState: true });
    };

    const openAddModal = () => {
        reset();
        setEditingProduct(null);
        // Auto generate SKU suggestion
        setData({
            name: '',
            sku: 'PRD-' + Math.floor(100000 + Math.random() * 900000),
            barcode: '',
            category_id: categories.length > 0 ? categories[0].id : '',
            unit_id: units.length > 0 ? units[0].id : '',
            purchase_price: '',
            sale_price: '',
            tax_rate: default_tax_rate || 15.00,
            stock_quantity: '0',
            min_stock_level: '5',
            description: '',
            status: 'active',
        });
        setIsAddModalOpen(true);
    };

    const openEditModal = (p) => {
        setEditingProduct(p);
        setData({
            name: p.name,
            sku: p.sku,
            barcode: p.barcode || '',
            category_id: p.category_id || '',
            unit_id: p.unit_id || '',
            purchase_price: p.purchase_price,
            sale_price: p.sale_price,
            tax_rate: p.tax_rate,
            stock_quantity: p.stock_quantity,
            min_stock_level: p.min_stock_level,
            description: p.description || '',
            status: p.status,
        });
        setIsAddModalOpen(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingProduct) {
            put(`/products/${editingProduct.id}`, {
                onSuccess: () => {
                    setIsAddModalOpen(false);
                    reset();
                },
            });
        } else {
            post('/products', {
                onSuccess: () => {
                    setIsAddModalOpen(false);
                    reset();
                },
            });
        }
    };

    const handleDelete = (p) => {
        if (confirm(`هل أنت متأكد من رغبتك في حذف المنتج (${p.name})؟`)) {
            router.delete(`/products/${p.id}`);
        }
    };

    const formatMoney = (val) => {
        return Number(val || 0).toLocaleString('ar-SA', { minimumFractionDigits: 2 }) + ' ر.س';
    };

    return (
        <AppLayout title="إدارة المنتجات والمخزون">
            <div className="space-y-6">
                <div className="page-header">
                    <div>
                        <h1 className="page-title">
                            <Package className="w-7 h-7 text-teal-700" />
                            <span>المنتجات والبضائع</span>
                        </h1>
                        <p className="page-subtitle">
                            إدارة أسعار البيع والشراء، الباركود، والحدود الدنيا للمخزون
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={openAddModal}
                        className="btn btn-primary flex items-center gap-1.5 shadow-sm"
                    >
                        <Plus className="w-5 h-5" />
                        <span>+ إضافة منتج جديد</span>
                    </button>
                </div>

                {/* Filters */}
                <div className="card !p-4 flex flex-col md:flex-row gap-3 items-center justify-between">
                    <form onSubmit={handleFilter} className="flex gap-2 w-full md:w-80">
                        <div className="relative flex-1">
                            <input
                                type="text"
                                className="input pr-9 text-sm"
                                placeholder="بحث بالاسم، SKU، أو الباركود..."
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
                                router.get('/products', { search: searchTerm, category_id: e.target.value, stock_status: selectedStockStatus }, { preserveState: true });
                            }}
                        >
                            <option value="">جميع التصنيفات</option>
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>

                        <select
                            className="input !py-1.5 !px-2.5 text-xs w-36"
                            value={selectedStockStatus}
                            onChange={(e) => {
                                setSelectedStockStatus(e.target.value);
                                router.get('/products', { search: searchTerm, category_id: selectedCategory, stock_status: e.target.value }, { preserveState: true });
                            }}
                        >
                            <option value="">جميع الحالات</option>
                            <option value="low">منخفض المخزون</option>
                            <option value="empty">نفد من المخزون</option>
                        </select>
                    </div>
                </div>

                {/* Products Table */}
                <div className="table-container bg-white shadow-xs">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>المنتج</th>
                                <th>SKU / الباركود</th>
                                <th>التصنيف</th>
                                <th>الكمية الحالية</th>
                                <th>سعر الشراء</th>
                                <th>سعر البيع</th>
                                <th>نسبة الضريبة</th>
                                <th>الحالة</th>
                                <th>الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.data.length === 0 ? (
                                <tr>
                                    <td colSpan="9" className="text-center py-10 text-slate-400">
                                        لا توجد منتجات مسجلة مطابقة للبحث.
                                    </td>
                                </tr>
                            ) : (
                                products.data.map((p) => (
                                    <tr key={p.id}>
                                        <td>
                                            <div className="font-bold text-slate-900">{p.name}</div>
                                            {p.unit && <div className="text-xs text-slate-500">الوحدة: {p.unit.name}</div>}
                                        </td>
                                        <td>
                                            <div className="font-mono text-xs font-bold text-slate-700">{p.sku}</div>
                                            {p.barcode && (
                                                <div className="font-mono text-[11px] text-slate-400 flex items-center gap-1">
                                                    <Barcode className="w-3 h-3" />
                                                    <span>{p.barcode}</span>
                                                </div>
                                            )}
                                        </td>
                                        <td>
                                            {p.category ? (
                                                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                                                    {p.category.name}
                                                </span>
                                            ) : '—'}
                                        </td>
                                        <td>
                                            <div className="font-black text-slate-900 text-sm">
                                                {Number(p.stock_quantity)} {p.unit ? p.unit.name : ''}
                                            </div>
                                            <div className="mt-0.5">
                                                <Badge status={p.stock_status} text={p.stock_status_name} />
                                            </div>
                                        </td>
                                        <td className="text-slate-600 font-bold">{formatMoney(p.purchase_price)}</td>
                                        <td className="text-sky-800 font-bold">{formatMoney(p.sale_price)}</td>
                                        <td>{Number(p.tax_rate)}%</td>
                                        <td>
                                            <span className={`text-xs px-2 py-0.5 rounded font-bold ${p.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                                                {p.status === 'active' ? 'نشط' : 'معطل'}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="flex items-center gap-1.5 justify-center">
                                                <button
                                                    type="button"
                                                    onClick={() => openEditModal(p)}
                                                    className="p-1.5 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100"
                                                    title="تعديل"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDelete(p)}
                                                    className="p-1.5 text-red-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                                                    title="حذف"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            <Modal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                title={editingProduct ? 'تعديل بيانات المنتج' : 'إضافة منتج جديد'}
                maxWidth="lg"
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <label className="label">اسم المنتج *</label>
                            <input
                                type="text"
                                className={`input ${errors.name ? 'input-error' : ''}`}
                                placeholder="مثال: زيت نباتي 1.5 لتر / كابل كهربائي 4 مم"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                required
                            />
                            {errors.name && <div className="field-error">{errors.name}</div>}
                        </div>

                        <div>
                            <label className="label">رمز المنتج (SKU) *</label>
                            <input
                                type="text"
                                className={`input ${errors.sku ? 'input-error' : ''}`}
                                placeholder="PRD-0001"
                                value={data.sku}
                                onChange={(e) => setData('sku', e.target.value)}
                                required
                            />
                            {errors.sku && <div className="field-error">{errors.sku}</div>}
                        </div>

                        <div>
                            <label className="label">الباركود (Barcode)</label>
                            <input
                                type="text"
                                className="input"
                                placeholder="امسح الباركود أو أدخله يدوياً..."
                                value={data.barcode}
                                onChange={(e) => setData('barcode', e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="label">التصنيف</label>
                            <select
                                className="input"
                                value={data.category_id}
                                onChange={(e) => setData('category_id', e.target.value)}
                            >
                                <option value="">بدون تصنيف</option>
                                {categories.map((c) => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="label">وحدة القياس</label>
                            <select
                                className="input"
                                value={data.unit_id}
                                onChange={(e) => setData('unit_id', e.target.value)}
                            >
                                <option value="">اختر الوحدة</option>
                                {units.map((u) => (
                                    <option key={u.id} value={u.id}>{u.name} ({u.short_name})</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="label">سعر الشراء (ر.س) *</label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                className={`input ${errors.purchase_price ? 'input-error' : ''}`}
                                placeholder="0.00"
                                value={data.purchase_price}
                                onChange={(e) => setData('purchase_price', e.target.value)}
                                required
                            />
                        </div>

                        <div>
                            <label className="label">سعر البيع (ر.س) *</label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                className={`input ${errors.sale_price ? 'input-error' : ''}`}
                                placeholder="0.00"
                                value={data.sale_price}
                                onChange={(e) => setData('sale_price', e.target.value)}
                                required
                            />
                        </div>

                        <div>
                            <label className="label">نسبة الضريبة (%)</label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                max="100"
                                className="input"
                                value={data.tax_rate}
                                onChange={(e) => setData('tax_rate', e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="label">الحد الأدنى للتنبيه بالمخزون</label>
                            <input
                                type="number"
                                step="1"
                                min="0"
                                className="input"
                                value={data.min_stock_level}
                                onChange={(e) => setData('min_stock_level', e.target.value)}
                            />
                        </div>

                        {!editingProduct && (
                            <div>
                                <label className="label">رصيد المخزون الافتتاحي</label>
                                <input
                                    type="number"
                                    step="1"
                                    min="0"
                                    className="input"
                                    value={data.stock_quantity}
                                    onChange={(e) => setData('stock_quantity', e.target.value)}
                                />
                            </div>
                        )}

                        <div>
                            <label className="label">الحالة</label>
                            <select
                                className="input"
                                value={data.status}
                                onChange={(e) => setData('status', e.target.value)}
                            >
                                <option value="active">نشط ومتاح للبيع</option>
                                <option value="inactive">معطل مؤقتاً</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="label">وصف المنتج</label>
                        <textarea
                            className="input"
                            rows="2"
                            placeholder="وصف تفصيلي ومواصفات المنتج..."
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                        ></textarea>
                    </div>

                    <div className="modal-footer -mx-6 -mb-6 mt-6">
                        <button type="submit" disabled={processing} className="btn btn-primary">
                            {editingProduct ? 'حفظ التعديلات' : 'إضافة المنتج'}
                        </button>
                        <button type="button" onClick={() => setIsAddModalOpen(false)} className="btn btn-secondary">
                            إلغاء
                        </button>
                    </div>
                </form>
            </Modal>
        </AppLayout>
    );
}
