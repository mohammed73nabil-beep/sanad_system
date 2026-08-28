import React, { useState } from 'react';
import { Link, useForm, router } from '@inertiajs/react';
import AppLayout from '@/Components/Layout/AppLayout';
import Modal from '@/Components/UI/Modal';
import {
    Truck,
    Plus,
    Search,
    Edit2,
    Trash2,
    ShoppingBag,
} from 'lucide-react';

export default function SuppliersIndex({ suppliers, filters, summary }) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingSupplier, setEditingSupplier] = useState(null);

    const { data, setData, post, put, processing, errors, reset } = useForm({
        name: '',
        phone: '',
        email: '',
        city: '',
        address: '',
        tax_number: '',
        commercial_register: '',
        notes: '',
    });

    const handleSearch = (e) => {
        e.preventDefault();
        router.get('/suppliers', { search: searchTerm }, { preserveState: true });
    };

    const openAddModal = () => {
        reset();
        setEditingSupplier(null);
        setIsAddModalOpen(true);
    };

    const openEditModal = (s) => {
        setEditingSupplier(s);
        setData({
            name: s.name,
            phone: s.phone || '',
            email: s.email || '',
            city: s.city || '',
            address: s.address || '',
            tax_number: s.tax_number || '',
            commercial_register: s.commercial_register || '',
            notes: s.notes || '',
        });
        setIsAddModalOpen(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingSupplier) {
            put(`/suppliers/${editingSupplier.id}`, {
                onSuccess: () => {
                    setIsAddModalOpen(false);
                    reset();
                },
            });
        } else {
            post('/suppliers', {
                onSuccess: () => {
                    setIsAddModalOpen(false);
                    reset();
                },
            });
        }
    };

    const handleDelete = (s) => {
        if (confirm(`هل أنت متأكد من رغبتك في حذف المورد (${s.name})؟`)) {
            router.delete(`/suppliers/${s.id}`);
        }
    };

    const formatMoney = (val) => {
        return Number(val || 0).toLocaleString('ar-SA', { minimumFractionDigits: 2 }) + ' ر.س';
    };

    return (
        <AppLayout title="إدارة الموردين">
            <div className="space-y-6">
                <div className="page-header">
                    <div>
                        <h1 className="page-title">
                            <Truck className="w-7 h-7 text-indigo-700" />
                            <span>الموردون</span>
                        </h1>
                        <p className="page-subtitle">
                            إدارة بيانات الموردين، مشتريات البضائع، ومستحقات الدفع
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={openAddModal}
                        className="btn btn-primary flex items-center gap-1.5 shadow-sm"
                    >
                        <Plus className="w-5 h-5" />
                        <span>+ إضافة مورد جديد</span>
                    </button>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="stat-card">
                        <div>
                            <div className="stat-value text-slate-800">{summary.total_suppliers}</div>
                            <div className="stat-label">إجمالي الموردين</div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div>
                            <div className="stat-value text-indigo-900">{formatMoney(summary.total_purchases)}</div>
                            <div className="stat-label">إجمالي المشتريات من الموردين</div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div>
                            <div className="stat-value text-emerald-700">{formatMoney(summary.total_paid)}</div>
                            <div className="stat-label">إجمالي المسدد للموردين</div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div>
                            <div className="stat-value text-red-600">{formatMoney(summary.total_remaining)}</div>
                            <div className="stat-label">إجمالي المستحق للموردين (متبقي)</div>
                        </div>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="card !p-4">
                    <form onSubmit={handleSearch} className="flex gap-2 max-w-md">
                        <div className="relative flex-1">
                            <input
                                type="text"
                                className="input pr-9"
                                placeholder="بحث باسم المورد، الجوال، أو الرقم الضريبي..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                        <button type="submit" className="btn btn-secondary">
                            بحث
                        </button>
                    </form>
                </div>

                {/* Suppliers Table */}
                <div className="table-container bg-white shadow-xs">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>اسم المورد</th>
                                <th>الجوال</th>
                                <th>الرقم الضريبي</th>
                                <th>إجمالي المشتريات</th>
                                <th>المسدد له</th>
                                <th>المتبقي له</th>
                                <th>الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {suppliers.data.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="text-center py-10 text-slate-400">
                                        لا يوجد موردون مسجلون حتى الآن.
                                    </td>
                                </tr>
                            ) : (
                                suppliers.data.map((s) => (
                                    <tr key={s.id}>
                                        <td>
                                            <div className="font-bold text-slate-900">{s.name}</div>
                                            {s.city && <div className="text-xs text-slate-500">{s.city}</div>}
                                        </td>
                                        <td className="font-mono text-xs">{s.phone || '—'}</td>
                                        <td className="font-mono text-xs">{s.tax_number || '—'}</td>
                                        <td className="font-bold">{formatMoney(s.total_purchases)}</td>
                                        <td className="text-emerald-700 font-bold">{formatMoney(s.total_paid)}</td>
                                        <td className="font-black text-red-600">{formatMoney(s.total_remaining)}</td>
                                        <td>
                                            <div className="flex items-center gap-1.5 justify-center">
                                                <button
                                                    type="button"
                                                    onClick={() => openEditModal(s)}
                                                    className="p-1.5 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100"
                                                    title="تعديل"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDelete(s)}
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
                title={editingSupplier ? 'تعديل بيانات المورد' : 'إضافة مورد جديد'}
                maxWidth="md"
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="label">اسم المورد / الشركة *</label>
                        <input
                            type="text"
                            className={`input ${errors.name ? 'input-error' : ''}`}
                            placeholder="مثال: شركة التوريدات المتحدة"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            required
                        />
                        {errors.name && <div className="field-error">{errors.name}</div>}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="label">رقم الجوال</label>
                            <input
                                type="text"
                                className="input"
                                placeholder="05XXXXXXXX"
                                value={data.phone}
                                onChange={(e) => setData('phone', e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="label">البريد الإلكتروني</label>
                            <input
                                type="email"
                                className="input"
                                placeholder="supplier@example.com"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="label">الرقم الضريبي</label>
                            <input
                                type="text"
                                className="input"
                                placeholder="3XXXXXXXXXXXXXX"
                                value={data.tax_number}
                                onChange={(e) => setData('tax_number', e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="label">السجل التجاري</label>
                            <input
                                type="text"
                                className="input"
                                placeholder="1010XXXXXX"
                                value={data.commercial_register}
                                onChange={(e) => setData('commercial_register', e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="label">المدينة</label>
                            <input
                                type="text"
                                className="input"
                                placeholder="الرياض، الدمام..."
                                value={data.city}
                                onChange={(e) => setData('city', e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="label">العنوان</label>
                            <input
                                type="text"
                                className="input"
                                placeholder="الحي، الشارع..."
                                value={data.address}
                                onChange={(e) => setData('address', e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="label">ملاحظات</label>
                        <textarea
                            className="input"
                            rows="2"
                            placeholder="أي ملاحظات حول المورد..."
                            value={data.notes}
                            onChange={(e) => setData('notes', e.target.value)}
                        ></textarea>
                    </div>

                    <div className="modal-footer -mx-6 -mb-6 mt-6">
                        <button type="submit" disabled={processing} className="btn btn-primary">
                            {editingSupplier ? 'حفظ التعديلات' : 'إضافة المورد'}
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
