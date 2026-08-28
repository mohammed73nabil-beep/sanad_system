import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { Lock, Mail, Eye, EyeOff, LogIn } from 'lucide-react';

export default function Login({ status }) {
    const [showPassword, setShowPassword] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();
        post('/login');
    };

    return (
        <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 font-sans antialiased text-slate-800" dir="rtl">
            <Head title="تسجيل الدخول — سَنَد" />

            <div className="w-full max-w-md">
                {/* Brand Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-400 items-center justify-center shadow-xl text-slate-950 text-3xl font-black mb-4">
                        س
                    </div>
                    <h1 className="text-3xl font-black text-white tracking-tight">
                        سَنَد <span className="text-amber-400 text-2xl font-bold">| SANAD</span>
                    </h1>
                    <p className="text-slate-400 text-sm mt-2 font-medium">
                        إدارة فواتيرك ومبيعاتك ومشترياتك بسهولة
                    </p>
                </div>

                {/* Login Card */}
                <div className="bg-white rounded-2xl shadow-2xl p-8 border border-slate-100">
                    {status && (
                        <div className="mb-4 text-sm font-semibold text-emerald-600 bg-emerald-50 p-3 rounded-lg border border-emerald-200">
                            {status}
                        </div>
                    )}

                    <form onSubmit={submit} className="space-y-5">
                        {/* Email */}
                        <div>
                            <label className="label" htmlFor="email">
                                البريد الإلكتروني
                            </label>
                            <div className="relative">
                                <input
                                    id="email"
                                    type="email"
                                    className={`input pr-10 ${errors.email ? 'input-error' : ''}`}
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    placeholder="admin@sanad.sa"
                                    autoComplete="username"
                                    required
                                    autoFocus
                                />
                                <Mail className="w-5 h-5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                            </div>
                            {errors.email && <div className="field-error">{errors.email}</div>}
                        </div>

                        {/* Password */}
                        <div>
                            <label className="label" htmlFor="password">
                                كلمة المرور
                            </label>
                            <div className="relative">
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    className={`input pr-10 pl-10 ${errors.password ? 'input-error' : ''}`}
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    placeholder="••••••••"
                                    autoComplete="current-password"
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

                        {/* Remember Me */}
                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="w-4 h-4 rounded border-slate-300 text-sky-700 focus:ring-sky-600"
                                    checked={data.remember}
                                    onChange={(e) => setData('remember', e.target.checked)}
                                />
                                <span className="text-sm font-medium text-slate-600">تذكرني على هذا الجهاز</span>
                            </label>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={processing}
                            className="btn btn-primary btn-lg w-full justify-center shadow-md font-bold mt-2"
                        >
                            <LogIn className="w-5 h-5" />
                            <span>{processing ? 'جارٍ تسجيل الدخول...' : 'تسجيل الدخول'}</span>
                        </button>
                    </form>
                </div>

                {/* Footer */}
                <div className="text-center mt-6 text-xs text-slate-500">
                    SANAD © 2026 — نظام إدارة الفواتير والمبيعات
                </div>
            </div>
        </div>
    );
}
