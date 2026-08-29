import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import {
    Lock,
    Mail,
    Eye,
    EyeOff,
    User,
    Building2,
    Phone,
    UserPlus,
    Sparkles,
    CheckCircle2,
} from 'lucide-react';

export default function Register() {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        name: '',
        company_name: '',
        email: '',
        phone: '',
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post('/register');
    };

    return (
        <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 py-10 font-sans antialiased text-slate-800" dir="rtl">
            <Head title="إنشاء حساب عميل جديد — سَنَد" />

            <div className="w-full max-w-lg">
                {/* Brand Header */}
                <div className="text-center mb-6">
                    <div className="inline-flex w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-400 items-center justify-center shadow-xl text-slate-950 text-2xl font-black mb-3">
                        س
                    </div>
                    <h1 className="text-2xl lg:text-3xl font-black text-white tracking-tight">
                        انضم إلى سَنَد <span className="text-amber-400 text-xl font-bold">| SANAD</span>
                    </h1>
                    <p className="text-slate-400 text-sm mt-1.5 font-medium">
                        أنشئ حساب منشأتك وابدأ إصدار الفواتير فوراً مع فترة تجريبية مجانية
                    </p>
                </div>

                {/* Trial Badge */}
                <div className="mb-4 bg-gradient-to-r from-amber-500/10 via-amber-400/20 to-amber-500/10 border border-amber-500/30 rounded-xl p-3 flex items-center gap-2.5 text-amber-200 text-xs font-bold">
                    <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>فترة تجريبية مجانية لمدة 14 يوماً تشمل 50 فاتورة بدون أي رسوم</span>
                </div>

                {/* Register Card */}
                <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 border border-slate-100">
                    <form onSubmit={submit} className="space-y-4">
                        {/* Name & Company Name Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Name */}
                            <div>
                                <label className="label" htmlFor="name">
                                    اسم المسؤول <span className="text-rose-500">*</span>
                                </label>
                                <div className="relative">
                                    <input
                                        id="name"
                                        type="text"
                                        className={`input pr-10 ${errors.name ? 'input-error' : ''}`}
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="محمد أحمد"
                                        required
                                        autoFocus
                                    />
                                    <User className="w-5 h-5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                </div>
                                {errors.name && <div className="field-error">{errors.name}</div>}
                            </div>

                            {/* Company Name */}
                            <div>
                                <label className="label" htmlFor="company_name">
                                    اسم المنشأة / المحل <span className="text-rose-500">*</span>
                                </label>
                                <div className="relative">
                                    <input
                                        id="company_name"
                                        type="text"
                                        className={`input pr-10 ${errors.company_name ? 'input-error' : ''}`}
                                        value={data.company_name}
                                        onChange={(e) => setData('company_name', e.target.value)}
                                        placeholder="مؤسسة التقنية للتجارة"
                                        required
                                    />
                                    <Building2 className="w-5 h-5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                </div>
                                {errors.company_name && <div className="field-error">{errors.company_name}</div>}
                            </div>
                        </div>

                        {/* Email & Phone Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Email */}
                            <div>
                                <label className="label" htmlFor="email">
                                    البريد الإلكتروني <span className="text-rose-500">*</span>
                                </label>
                                <div className="relative">
                                    <input
                                        id="email"
                                        type="email"
                                        className={`input pr-10 ${errors.email ? 'input-error' : ''}`}
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        placeholder="info@example.sa"
                                        autoComplete="username"
                                        required
                                    />
                                    <Mail className="w-5 h-5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                </div>
                                {errors.email && <div className="field-error">{errors.email}</div>}
                            </div>

                            {/* Phone */}
                            <div>
                                <label className="label" htmlFor="phone">
                                    رقم الجوال
                                </label>
                                <div className="relative">
                                    <input
                                        id="phone"
                                        type="tel"
                                        className={`input pr-10 ${errors.phone ? 'input-error' : ''}`}
                                        value={data.phone}
                                        onChange={(e) => setData('phone', e.target.value)}
                                        placeholder="05xxxxxxxx"
                                        dir="ltr"
                                    />
                                    <Phone className="w-5 h-5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                </div>
                                {errors.phone && <div className="field-error">{errors.phone}</div>}
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label className="label" htmlFor="password">
                                كلمة المرور <span className="text-rose-500">*</span>
                            </label>
                            <div className="relative">
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    className={`input pr-10 pl-10 ${errors.password ? 'input-error' : ''}`}
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    placeholder="••••••••"
                                    autoComplete="new-password"
                                    required
                                />
                                <Lock className="w-5 h-5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            {errors.password && <div className="field-error">{errors.password}</div>}
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label className="label" htmlFor="password_confirmation">
                                تأكيد كلمة المرور <span className="text-rose-500">*</span>
                            </label>
                            <div className="relative">
                                <input
                                    id="password_confirmation"
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    className="input pr-10 pl-10"
                                    value={data.password_confirmation}
                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                    placeholder="••••••••"
                                    autoComplete="new-password"
                                    required
                                />
                                <Lock className="w-5 h-5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                                >
                                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={processing}
                            className="btn btn-primary btn-lg w-full justify-center shadow-md font-bold mt-3"
                        >
                            <UserPlus className="w-5 h-5" />
                            <span>{processing ? 'جارٍ إنشاء الحساب...' : 'إنشاء حساب جديد وتفعيل التجربة'}</span>
                        </button>
                    </form>

                    {/* Switch to Login */}
                    <div className="text-center mt-6 pt-4 border-t border-slate-100">
                        <p className="text-sm text-slate-600">
                            لديك حساب مسجل بالفعل؟{' '}
                            <Link href="/login" className="font-bold text-sky-800 hover:text-sky-950 underline mr-1">
                                تسجيل الدخول ←
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center mt-6 text-xs text-slate-500">
                    SANAD © 2026 — نظام إدارة الفواتير والمبيعات
                </div>
            </div>
        </div>
    );
}
