import React from 'react';
import { Link, useForm } from '@inertiajs/react';
import AdminLayout from '@/Components/Layout/AdminLayout';
import { Users, Building2, Save, ArrowRight, UserPlus, Shield } from 'lucide-react';

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        phone: '',
        password: '',
        // Company
        company_name: '',
        commercial_register: '',
        tax_number: '',
        city: '',
        address: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/admin/customers');
    };

    return (
        <AdminLayout title="إضافة عميل ومنشأة جديدة">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-2xl font-black text-white flex items-center gap-2">
                            <UserPlus className="w-6 h-6 text-emerald-400" />
                            <span>إضافة عميل ومنشأة جديدة</span>
                        </h1>
                        <p className="text-xs text-slate-400 mt-1">
                            تسجيل حساب عميل مالك منشأة وتعيين بيانات الدخول وبيانات المنشأة التجارية
                        </p>
                    </div>
                    <Link
                        href="/admin/customers"
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors border border-slate-700"
                    >
                        <ArrowRight className="w-4 h-4" />
                        <span>عودة للقائمة</span>
                    </Link>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Section 1: User Account Credentials */}
                    <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 shadow-sm">
                        <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2 border-b border-slate-700 pb-3">
                            <Users className="w-5 h-5 text-purple-400" />
                            <span>1. بيانات المستخدم وكلمة المرور</span>
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-300 mb-1">
                                    الاسم الكامل للمستخدم <span className="text-rose-400">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="مثال: عبدالله محمد الغامدي"
                                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                                />
                                {errors.name && <div className="text-xs text-rose-400 mt-1">{errors.name}</div>}
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-300 mb-1">
                                    البريد الإلكتروني (اسم المستخدم) <span className="text-rose-400">*</span>
                                </label>
                                <input
                                    type="email"
                                    required
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    placeholder="example@company.sa"
                                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 font-mono"
                                />
                                {errors.email && <div className="text-xs text-rose-400 mt-1">{errors.email}</div>}
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-300 mb-1">
                                    رقم الجوال
                                </label>
                                <input
                                    type="text"
                                    value={data.phone}
                                    onChange={(e) => setData('phone', e.target.value)}
                                    placeholder="05XXXXXXXX"
                                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 font-mono"
                                />
                                {errors.phone && <div className="text-xs text-rose-400 mt-1">{errors.phone}</div>}
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-300 mb-1">
                                    كلمة المرور المؤقتة <span className="text-rose-400">*</span>
                                </label>
                                <input
                                    type="password"
                                    required
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    placeholder="8 خانات على الأقل..."
                                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                                />
                                {errors.password && <div className="text-xs text-rose-400 mt-1">{errors.password}</div>}
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Company Data */}
                    <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 shadow-sm">
                        <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2 border-b border-slate-700 pb-3">
                            <Building2 className="w-5 h-5 text-emerald-400" />
                            <span>2. بيانات المنشأة التجارية (اختياري، يمكن تعبئتها لاحقاً)</span>
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <label className="block text-xs font-bold text-slate-300 mb-1">
                                    اسم المنشأة / المحل التجاري
                                </label>
                                <input
                                    type="text"
                                    value={data.company_name}
                                    onChange={(e) => setData('company_name', e.target.value)}
                                    placeholder="مثال: مؤسسة الفجر للتجارة والتوريدات"
                                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                                />
                                {errors.company_name && <div className="text-xs text-rose-400 mt-1">{errors.company_name}</div>}
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-300 mb-1">
                                    رقم السجل التجاري
                                </label>
                                <input
                                    type="text"
                                    value={data.commercial_register}
                                    onChange={(e) => setData('commercial_register', e.target.value)}
                                    placeholder="1010XXXXXX"
                                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 font-mono"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-300 mb-1">
                                    الرقم الضريبي (VAT)
                                </label>
                                <input
                                    type="text"
                                    value={data.tax_number}
                                    onChange={(e) => setData('tax_number', e.target.value)}
                                    placeholder="3XXXXXXXXXXXXX3 (15 رقماً)"
                                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 font-mono"
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
                                    placeholder="الرياض، جدة، الدمام..."
                                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-300 mb-1">
                                    العنوان التفصيلي
                                </label>
                                <input
                                    type="text"
                                    value={data.address}
                                    onChange={(e) => setData('address', e.target.value)}
                                    placeholder="الحي، اسم الشارع..."
                                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Submit Bar */}
                    <div className="flex items-center justify-end gap-3">
                        <Link
                            href="/admin/customers"
                            className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs transition-colors"
                        >
                            إلغاء
                        </Link>
                        <button
                            type="submit"
                            disabled={processing}
                            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg transition-colors disabled:opacity-50"
                        >
                            <Save className="w-4 h-4" />
                            <span>{processing ? 'جاري الحفظ...' : 'حفظ وإنشاء العميل'}</span>
                        </button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
