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

    return (
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
                                مسؤول النظام
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
                                        className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-red-600 hover:bg-red-50 text-right cursor-pointer"
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
    );
}
