import React from 'react';
import { Link, useForm } from '@inertiajs/react';
import AdminLayout from '@/Components/Layout/AdminLayout';
import { Users, Building2, Save, ArrowRight } from 'lucide-react';

export default function Edit({ customer }) {
    const company = customer.company_setting || {};

    const { data, setData, put, processing, errors } = useForm({
        name: customer.name || '',
        email: customer.email || '',
        phone: customer.phone || '',
        company_name: company.name || '',
        commercial_register: company.commercial_register || '',
        tax_number: company.tax_number || '',
        city: company.city || '',
        address: company.address || '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        put(`/admin/customers/${customer.id}`);
    };

    return (
        <AdminLayout title={`تعديل العميل: ${customer.name}`}>
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-2xl font-black text-white flex items-center gap-2">
                            <span>تعديل بيانات العميل: {customer.name}</span>
                        </h1>
                        <p className="text-xs text-slate-400 mt-1">
                            تحديث معلومات المستخدم وبيانات المنشأة التجارية
                        </p>
                    </div>
                    <Link
                        href={`/admin/customers/${customer.id}`}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors border border-slate-700"
                    >
                        <ArrowRight className="w-4 h-4" />
                        <span>عودة للعميل</span>
                    </Link>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* User Credentials */}
                    <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 shadow-sm">
                        <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2 border-b border-slate-700 pb-3">
                            <Users className="w-5 h-5 text-purple-400" />
                            <span>1. بيانات المستخدم</span>
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-300 mb-1">
                                    اسم المستخدم <span className="text-rose-400">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
                                />
                                {errors.name && <div className="text-xs text-rose-400 mt-1">{errors.name}</div>}
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-300 mb-1">
                                    البريد الإلكتروني <span className="text-rose-400">*</span>
                                </label>
                                <input
                                    type="email"
                                    required
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500 font-mono"
                                />
                                {errors.email && <div className="text-xs text-rose-400 mt-1">{errors.email}</div>}
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-xs font-bold text-slate-300 mb-1">
                                    رقم الجوال
                                </label>
                                <input
                                    type="text"
                                    value={data.phone}
                                    onChange={(e) => setData('phone', e.target.value)}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500 font-mono"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Company Details */}
                    <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 shadow-sm">
                        <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2 border-b border-slate-700 pb-3">
                            <Building2 className="w-5 h-5 text-emerald-400" />
                            <span>2. بيانات المنشأة</span>
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <label className="block text-xs font-bold text-slate-300 mb-1">
                                    اسم المنشأة
                                </label>
                                <input
                                    type="text"
                                    value={data.company_name}
                                    onChange={(e) => setData('company_name', e.target.value)}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-300 mb-1">
                                    السجل التجاري
                                </label>
                                <input
                                    type="text"
                                    value={data.commercial_register}
                                    onChange={(e) => setData('commercial_register', e.target.value)}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500 font-mono"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-300 mb-1">
                                    الرقم الضريبي
                                </label>
                                <input
                                    type="text"
                                    value={data.tax_number}
                                    onChange={(e) => setData('tax_number', e.target.value)}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500 font-mono"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-300 mb-1">
                                    المدينة
                                </label>
                                <input
                                    type="text"
                                    value={data.city}
                                    onChange={(e) => setData('city', e.target.value)}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-300 mb-1">
                                    العنوان
                                </label>
                                <input
                                    type="text"
                                    value={data.address}
                                    onChange={(e) => setData('address', e.target.value)}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Submit Bar */}
                    <div className="flex items-center justify-end gap-3">
                        <Link
                            href={`/admin/customers/${customer.id}`}
                            className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs transition-colors"
                        >
                            إلغاء
                        </Link>
                        <button
                            type="submit"
                            disabled={processing}
                            className="px-6 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg transition-colors disabled:opacity-50"
                        >
                            <Save className="w-4 h-4" />
                            <span>{processing ? 'جاري التحديث...' : 'حفظ التعديلات'}</span>
                        </button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
