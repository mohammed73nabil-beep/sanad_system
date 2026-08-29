import React, { useState } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import {
    Menu,
    PlusCircle,
    User,
    LogOut,
    Building2,
    FileText,
    Receipt,
    ShoppingBag,
} from 'lucide-react';

export default function Header({ onMenuClick, isSidebarCollapsed }) {
    const { auth } = usePage().props;
    const [userDropdownOpen, setUserDropdownOpen] = useState(false);

    const handleLogout = () => {
        router.post('/logout');
    };

    const handleStopImpersonating = () => {
        router.post('/admin/stop-impersonating');
    };

    const sub = auth?.subscription;

    return (
        <>
            {/* Super Admin Impersonation Top Warning Banner */}
            {auth?.is_impersonating && (
                <div className="bg-gradient-to-r from-purple-700 via-indigo-700 to-purple-800 text-white px-4 py-2 flex items-center justify-between shadow-md z-40 text-xs font-bold">
                    <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse"></span>
                        <span>أنت تعمل الآن بوضع إدارة حساب العميل (Super Admin Impersonation)</span>
                    </div>
                    <button
                        type="button"
                        onClick={handleStopImpersonating}
                        className="px-3 py-1 bg-white text-purple-900 rounded-lg text-xs font-bold hover:bg-purple-100 transition-colors shadow-sm cursor-pointer"
                    >
                        إنهاء الجلسة والعودة للوحة الإدارة ✕
                    </button>
                </div>
            )}

            <header className="app-header justify-between">
                {/* Right side: Menu Toggle Button & Quick Actions */}
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={onMenuClick}
                        className="p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors flex items-center justify-center cursor-pointer"
                        title={isSidebarCollapsed ? 'توسيع القائمة الجانبية' : 'طي القائمة الجانبية'}
                    >
                        <Menu className="w-5 h-5" />
                    </button>

                    <div className="hidden sm:flex items-center gap-2">
                        <Link
                            href="/invoices/create"
                            className="btn btn-sm btn-primary flex items-center gap-1.5 shadow-sm"
                        >
                            <PlusCircle className="w-4 h-4" />
                            <span>فاتورة بيع</span>
                        </Link>

                        <Link
                            href="/purchases/create"
                            className="btn btn-sm btn-secondary flex items-center gap-1.5"
                        >
                            <ShoppingBag className="w-4 h-4 text-slate-500" />
                            <span>شراء</span>
                        </Link>
                    </div>

                    {/* Subscription Quick Badge for Customer */}
                    {sub && (
                        <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-xl bg-slate-100 border border-slate-200 text-xs">
                            <span className="font-bold text-slate-700">{sub.plan_name}</span>
                            <span className="text-slate-400">•</span>
                            <span className={`font-bold ${
                                sub.status === 'active' ? 'text-emerald-600' :
                                sub.status === 'trial' ? 'text-amber-600' : 'text-rose-600'
                            }`}>
                                {sub.status_label}
                            </span>
                            <span className="text-slate-400 font-mono">({sub.invoices_used}/{sub.invoice_limit} فاتورة)</span>
                        </div>
                    )}
                </div>

                {/* Left side: User profile dropdown & quick info */}
                <div className="flex items-center gap-3 relative">
                    <div className="relative">
                        <button
                            type="button"
                            onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                            className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 transition-colors text-right"
                        >
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-700 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                                {auth?.user?.name ? auth.user.name.charAt(0) : 'م'}
                            </div>
                            <div className="hidden md:block text-right">
                                <div className="text-sm font-bold text-slate-800 leading-tight">
                                    {auth?.user?.name || 'المدير'}
                                </div>
                                <div className="text-xs text-slate-500 font-medium">
                                    {auth?.user?.is_super_admin ? 'مالك النظام' : 'مسؤول المنشأة'}
                                </div>
                            </div>
                        </button>

                        {/* Dropdown Menu */}
                        {userDropdownOpen && (
                            <>
                                <div
                                    className="fixed inset-0 z-20"
                                    onClick={() => setUserDropdownOpen(false)}
                                />
                                <div className="absolute left-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-30 divide-y divide-slate-100">
                                    <div className="px-4 py-2.5">
                                        <div className="text-sm font-bold text-slate-800">{auth?.user?.name}</div>
                                        <div className="text-xs text-slate-500 truncate">{auth?.user?.email}</div>
                                    </div>

                                    {/* Super Admin Dashboard Link if user has role */}
                                    {auth?.user?.is_super_admin && (
                                        <div className="py-1">
                                            <Link
                                                href="/admin"
                                                className="flex items-center gap-2.5 px-4 py-2 text-sm text-purple-700 bg-purple-50 hover:bg-purple-100 font-bold"
                                                onClick={() => setUserDropdownOpen(false)}
                                            >
                                                <span>لوحة Super Admin ←</span>
                                            </Link>
                                        </div>
                                    )}

                                    <div className="py-1">
                                        <Link
                                            href="/settings/company"
                                            className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                                            onClick={() => setUserDropdownOpen(false)}
                                        >
                                            <Building2 className="w-4 h-4 text-slate-400" />
                                            <span>إعدادات المنشأة</span>
                                        </Link>
                                    </div>

                                    <div className="py-1">
                                        <button
                                            type="button"
                                            onClick={handleLogout}
                                            className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 font-medium text-right"
                                        >
                                            <LogOut className="w-4 h-4" />
                                            <span>تسجيل الخروج</span>
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </header>
        </>
    );
}
