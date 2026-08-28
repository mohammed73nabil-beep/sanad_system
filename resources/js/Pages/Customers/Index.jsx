import React, { useState } from 'react';
import { Link, useForm, router } from '@inertiajs/react';
import AppLayout from '@/Components/Layout/AppLayout';
import Modal from '@/Components/UI/Modal';
import {
    Users,
    Plus,
    Search,
    Filter,
    FileText,
    Phone,
    MapPin,
    Edit2,
    Trash2,
    Eye,
    TrendingUp,
    Wallet,
} from 'lucide-react';

export default function CustomersIndex({ customers, filters, summary }) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState(null);

    const { data, setData, post, put, processing, errors, reset } = useForm({
        name: '',
        type: 'business',
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
        router.get('/customers', { search: searchTerm, with_debt: filters.with_debt }, { preserveState: true });
    };

    const handleDebtFilter = (checked) => {
        router.get('/customers', { search: searchTerm, with_debt: checked ? 1 : null }, { preserveState: true });
    };

    const openAddModal = () => {
        reset();
        setEditingCustomer(null);
        setIsAddModalOpen(true);
    };

    const openEditModal = (c) => {
        setEditingCustomer(c);
        setData({
            name: c.name,
            type: c.type,
            phone: c.phone || '',
            email: c.email || '',
            city: c.city || '',
            address: c.address || '',
            tax_number: c.tax_number || '',
            commercial_register: c.commercial_register || '',
            notes: c.notes || '',
        });
        setIsAddModalOpen(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingCustomer) {
            put(`/customers/${editingCustomer.id}`, {
                onSuccess: () => {
                    setIsAddModalOpen(false);
                    reset();
                },
            });
        } else {
            post('/customers', {
                onSuccess: () => {
                    setIsAddModalOpen(false);
                    reset();
                },
            });
        }
    };

    const handleDelete = (c) => {
        if (confirm(`هل أنت متأكد من رغبتك في حذف العميل (${c.name})؟`)) {
            router.delete(`/customers/${c.id}`);
        }
    };

    const formatMoney = (val) => {
        return Number(val || 0).toLocaleString('ar-SA', { minimumFractionDigits: 2 }) + ' ر.س';
    };

    return (
        <AppLayout title="إدارة العملاء والمحلات">
            <div className="space-y-6">
                {/* Header Title Bar */}
                <div className="page-header">
                    <div>
                        <h1 className="page-title">
                            <Users className="w-7 h-7 text-sky-700" />
                            <span>العملاء والمحلات</span>
                        </h1>
                        <p className="page-subtitle">
                            إدارة بيانات العملاء، أرصدتهم، وكشوف الحسابات
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={openAddModal}
                        className="btn btn-primary flex items-center gap-1.5 shadow-sm"
                    >
                        <Plus className="w-5 h-5" />
                        <span>+ إضافة عميل جديد</span>
                    </button>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="stat-card">
                        <div>
                            <div className="stat-value text-slate-800">{summary.total_customers}</div>
                            <div className="stat-label">إجمالي العملاء المسجلين</div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div>
                            <div className="stat-value text-sky-900">{formatMoney(summary.total_sales)}</div>
                            <div className="stat-label">إجمالي المبيعات للعملاء</div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div>
                            <div className="stat-value text-emerald-700">{formatMoney(summary.total_paid)}</div>
                            <div className="stat-label">إجمالي المبالغ المحصلة</div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div>
                            <div className="stat-value text-red-600">{formatMoney(summary.total_remaining)}</div>
                            <div className="stat-label">إجمالي المبالغ المستحقة المتبقية</div>
                        </div>
                    </div>
                </div>

                {/* Search & Filter Bar */}
                <div className="card !p-4 flex flex-col sm:flex-row gap-4 items-center justify-between">
                    <form onSubmit={handleSearch} className="flex gap-2 w-full sm:w-96">
                        <div className="relative flex-1">
                            <input
                                type="text"
                                className="input pr-9"
                                placeholder="بحث بالاسم، الجوال، أو الرقم الضريبي..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                        <button type="submit" className="btn btn-secondary">
                            بحث
                        </button>
                    </form>

                    <div className="flex items-center gap-4 w-full sm:w-auto justify-end">
                        <label className="flex items-center gap-2 text-sm font-semibold cursor-pointer text-slate-700">
                            <input
                                type="checkbox"
                                className="rounded border-slate-300 text-sky-700 focus:ring-sky-600 w-4 h-4"
                                checked={!!filters.with_debt}
                                onChange={(e) => handleDebtFilter(e.target.checked)}
                            />
                            <span>عرض العملاء الذين عليهم مديونية فقط</span>
                        </label>
                    </div>
                </div>

                {/* Customers Table */}
                <div className="table-container bg-white shadow-xs">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>اسم العميل / المحل</th>
                                <th>النوع</th>
                                <th>الجوال</th>
                                <th>الرقم الضريبي</th>
                                <th>إجمالي المبيعات</th>
                                <th>المدفوع</th>
                                <th>المتبقي (المستحق)</th>
                                <th>الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {customers.data.length === 0 ? (
                                <tr>
                                    <td colspan="8" className="text-center py-10 text-slate-400">
                                        لا يوجد عملاء مطابقين للبحث.
                                    </td>
                                </tr>
                            ) : (
                                customers.data.map((c) => (
                                    <tr key={c.id}>
                                        <td>
                                            <div className="font-bold text-slate-900">{c.name}</div>
                                            {c.city && <div className="text-xs text-slate-500">{c.city} {c.address ? `• ${c.address}` : ''}</div>}
                                        </td>
                                        <td>
                                            <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${c.type === 'business' ? 'bg-blue-50 text-blue-800' : 'bg-slate-100 text-slate-700'}`}>
                                                {c.type_name}
                                            </span>
                                        </td>
                                        <td className="font-mono text-xs">{c.phone || '—'}</td>
                                        <td className="font-mono text-xs">{c.tax_number || '—'}</td>
                                        <td className="font-bold">{formatMoney(c.total_sales)}</td>
                                        <td className="text-emerald-700 font-bold">{formatMoney(c.total_paid)}</td>
                                        <td>
                                            <span className={`font-black ${c.total_remaining > 0 ? 'text-red-600' : 'text-slate-400'}`}>
                                                {formatMoney(c.total_remaining)}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="flex items-center gap-1.5 justify-center">
                                                <Link
                                                    href={`/customers/${c.id}/statement`}
                                                    className="btn btn-sm btn-secondary !py-1 !px-2 text-xs flex items-center gap-1"
                                                    title="كشف الحساب"
                                                >
                                                    <FileText className="w-3.5 h-3.5 text-sky-700" />
                                                    <span>كشف حساب</span>
                                                </Link>
                                                <button
                                                    type="button"
                                                    onClick={() => openEditModal(c)}
                                                    className="p-1.5 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100"
                                                    title="تعديل"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDelete(c)}
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

                {/* Pagination */}
                {customers.links && customers.links.length > 3 && (
                    <div className="flex justify-center gap-1 py-4">
                        {customers.links.map((link, i) => (
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

            {/* Add / Edit Customer Modal */}
            <Modal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                title={editingCustomer ? 'تعديل بيانات العميل' : 'إضافة عميل / محل جديد'}
                maxWidth="md"
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="label">اسم العميل أو المحل التجاري *</label>
                        <input
                            type="text"
                            className={`input ${errors.name ? 'input-error' : ''}`}
                            placeholder="مثال: مؤسسة الأمل التجارية / محل الهدى"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            required
                        />
                        {errors.name && <div className="field-error">{errors.name}</div>}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="label">نوع العميل</label>
                            <select
                                className="input"
                                value={data.type}
                                onChange={(e) => setData('type', e.target.value)}
                            >
                                <option value="business">منشأة تجارية / محل</option>
                                <option value="individual">فرد</option>
                            </select>
                        </div>
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
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="label">الرقم الضريبي (إن وجد)</label>
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
                                placeholder="الرياض، جدة..."
                                value={data.city}
                                onChange={(e) => setData('city', e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="label">البريد الإلكتروني</label>
                            <input
                                type="email"
                                className="input"
                                placeholder="customer@example.com"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="label">العنوان بالتفصيل</label>
                        <input
                            type="text"
                            className="input"
                            placeholder="اسم الشارع، الحي، رقم المبنى..."
                            value={data.address}
                            onChange={(e) => setData('address', e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="label">ملاحظات إضافية</label>
                        <textarea
                            className="input"
                            rows="2"
                            placeholder="أي ملاحظات خاصة بالعميل أو شروط الدفع..."
                            value={data.notes}
                            onChange={(e) => setData('notes', e.target.value)}
                        ></textarea>
                    </div>

                    <div className="modal-footer -mx-6 -mb-6 mt-6">
                        <button type="submit" disabled={processing} className="btn btn-primary">
                            {editingCustomer ? 'حفظ التعديلات' : 'إضافة العميل'}
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
