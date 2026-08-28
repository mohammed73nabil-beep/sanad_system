import React, { useState } from 'react';
import { useForm, router } from '@inertiajs/react';
import AppLayout from '@/Components/Layout/AppLayout';
import Modal from '@/Components/UI/Modal';
import {
    FolderTree,
    Plus,
    Edit2,
    Trash2,
    Package,
} from 'lucide-react';

export default function CategoriesIndex({ categories }) {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);

    const { data, setData, post, put, processing, errors, reset } = useForm({
        name: '',
        description: '',
        color: '#1B4B6B',
    });

    const openAddModal = () => {
        reset();
        setEditingCategory(null);
        setIsAddModalOpen(true);
    };

    const openEditModal = (c) => {
        setEditingCategory(c);
        setData({
            name: c.name,
            description: c.description || '',
            color: c.color || '#1B4B6B',
        });
        setIsAddModalOpen(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingCategory) {
            put(`/categories/${editingCategory.id}`, {
                onSuccess: () => {
                    setIsAddModalOpen(false);
                    reset();
                },
            });
        } else {
            post('/categories', {
                onSuccess: () => {
                    setIsAddModalOpen(false);
                    reset();
                },
            });
        }
    };

    const handleDelete = (c) => {
        if (confirm(`هل أنت متأكد من رغبتك في حذف التصنيف (${c.name})؟`)) {
            router.delete(`/categories/${c.id}`);
        }
    };

    return (
        <AppLayout title="إدارة تصنيفات المنتجات">
            <div className="space-y-6">
                <div className="page-header">
                    <div>
                        <h1 className="page-title">
                            <FolderTree className="w-7 h-7 text-teal-700" />
                            <span>تصنيفات المنتجات</span>
                        </h1>
                        <p className="page-subtitle">
                            تنظيم وتصنيف المنتجات والبضائع لتسهيل الفلترة وإصدار الفواتير
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={openAddModal}
                        className="btn btn-primary flex items-center gap-1.5 shadow-sm"
                    >
                        <Plus className="w-5 h-5" />
                        <span>+ إضافة تصنيف جديد</span>
                    </button>
                </div>

                {/* Categories Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {categories.length === 0 ? (
                        <div className="col-span-full text-center py-12 text-slate-400">
                            لا توجد تصنيفات مسجلة حتى الآن.
                        </div>
                    ) : (
                        categories.map((c) => (
                            <div key={c.id} className="card flex flex-col justify-between hover:shadow-md transition-shadow">
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2.5">
                                            <div
                                                className="w-4 h-4 rounded-full shrink-0"
                                                style={{ backgroundColor: c.color || '#1B4B6B' }}
                                            />
                                            <div className="font-bold text-base text-slate-900">{c.name}</div>
                                        </div>

                                        <div className="flex items-center gap-1">
                                            <button
                                                type="button"
                                                onClick={() => openEditModal(c)}
                                                className="p-1 text-slate-400 hover:text-slate-700 rounded"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleDelete(c)}
                                                className="p-1 text-red-400 hover:text-red-600 rounded"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    {c.description && (
                                        <p className="text-xs text-slate-500 line-clamp-2 mb-3">
                                            {c.description}
                                        </p>
                                    )}
                                </div>

                                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-semibold">
                                    <span className="flex items-center gap-1">
                                        <Package className="w-3.5 h-3.5 text-slate-400" />
                                        <span>عدد المنتجات:</span>
                                    </span>
                                    <span className="font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md">
                                        {c.products_count || 0}
                                    </span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Modal */}
            <Modal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                title={editingCategory ? 'تعديل التصنيف' : 'إضافة تصنيف جديد'}
                maxWidth="sm"
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="label">اسم التصنيف *</label>
                        <input
                            type="text"
                            className={`input ${errors.name ? 'input-error' : ''}`}
                            placeholder="مثال: مواد غذائية، أدوات كهربائية..."
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            required
                        />
                        {errors.name && <div className="field-error">{errors.name}</div>}
                    </div>

                    <div>
                        <label className="label">لون التمييز</label>
                        <div className="flex items-center gap-2">
                            <input
                                type="color"
                                className="w-10 h-10 rounded cursor-pointer border-0"
                                value={data.color}
                                onChange={(e) => setData('color', e.target.value)}
                            />
                            <input
                                type="text"
                                className="input flex-1 font-mono text-xs"
                                value={data.color}
                                onChange={(e) => setData('color', e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="label">الوصف</label>
                        <textarea
                            className="input"
                            rows="2"
                            placeholder="وصف مختصر للمنتجات التابعة لهذا التصنيف..."
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                        ></textarea>
                    </div>

                    <div className="modal-footer -mx-6 -mb-6 mt-6">
                        <button type="submit" disabled={processing} className="btn btn-primary">
                            {editingCategory ? 'حفظ التعديلات' : 'إضافة التصنيف'}
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
