import React, { useState } from 'react';
import { Head, Link, usePage, router } from '@inertiajs/react';
import AdminSidebar from './AdminSidebar';
import FlashMessages from '../UI/FlashMessages';
import { Shield, Menu, LogOut, ExternalLink, Bell } from 'lucide-react';

export default function AdminLayout({ title, children }) {
    const { props } = usePage();
    const user = props.auth?.user;

    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('sanad_admin_sidebar_collapsed') === 'true';
        }
        return false;
    });

    const toggleCollapse = () => {
        setSidebarCollapsed((prev) => {
            const next = !prev;
            if (typeof window !== 'undefined') {
                localStorage.setItem('sanad_admin_sidebar_collapsed', String(next));
            }
            return next;
        });
    };

    const handleMenuClick = () => {
        if (window.innerWidth < 1024) {
            setSidebarOpen(true);
        } else {
            toggleCollapse();
        }
    };

    const handleLogout = () => {
        router.post('/logout');
    };

    return (
        <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans antialiased" dir="rtl">
            <Head title={title ? `${title} - لوحة Super Admin` : 'لوحة مالك النظام - سَنَد'} />

            {/* Flash Messages Toast */}
            <FlashMessages />

            {/* Admin Sidebar */}
            <AdminSidebar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
                isCollapsed={sidebarCollapsed}
                onToggleCollapse={toggleCollapse}
            />

            {/* Main Content Area */}
            <div className={`app-main flex flex-col flex-1 ${sidebarCollapsed ? 'collapsed' : ''}`}>
                {/* Admin Header */}
                <header className="header flex items-center justify-between px-4 lg:px-8 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-30">
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={handleMenuClick}
                            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                            title="القائمة"
                        >
                            <Menu className="w-5 h-5" />
                        </button>
                        <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                                <Shield className="w-3.5 h-3.5" />
                                مالك النظام (Super Admin)
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold text-slate-300 hidden sm:inline">
                            {user?.name}
                        </span>

                        <button
                            type="button"
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 transition-colors border border-rose-500/20"
                            title="تسجيل الخروج"
                        >
                            <LogOut className="w-4 h-4" />
                            <span>خروج</span>
                        </button>
                    </div>
                </header>

                {/* Main Content */}
                <main className="page-content flex-1 p-4 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
