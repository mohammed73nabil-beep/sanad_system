import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import {
    LayoutDashboard,
    Users,
    CreditCard,
    Package,
    DollarSign,
    History,
    LogOut,
    ExternalLink,
    Shield,
    X,
    PanelRightClose,
    PanelRightOpen,
} from 'lucide-react';

export default function AdminSidebar({ isOpen, onClose, isCollapsed, onToggleCollapse }) {
    const { url, props } = usePage();
    const user = props.auth?.user;

    const isActive = (path) => {
        if (path === '/admin') return url === '/admin';
        return url.startsWith(path);
    };

    return (
        <>
            {/* Mobile backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/60 z-40 lg:hidden backdrop-blur-xs"
                    onClick={onClose}
                />
            )}

            <aside className={`sidebar ${isOpen ? 'open' : ''} ${isCollapsed ? 'collapsed' : ''}`}>
                {/* Logo & Brand Header */}
                <div className="sidebar-logo flex items-center justify-between">
                    <Link href="/admin" className="flex items-center gap-3 text-white no-underline overflow-hidden">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center shadow-md font-black text-white text-xl tracking-wider shrink-0">
                            <Shield className="w-5 h-5" />
                        </div>
                        <div className="overflow-hidden">
                            <div className="text-lg font-black tracking-tight text-white flex items-center gap-1.5 whitespace-nowrap">
                                سَنَد <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-500/30 text-purple-300 border border-purple-400/30">SUPER ADMIN</span>
                            </div>
                            <div className="text-[11px] text-purple-200/80 font-medium whitespace-nowrap">لوحة مالك النظام</div>
                        </div>
                    </Link>

                    {/* Close button on mobile */}
                    <button
                        type="button"
                        onClick={onClose}
                        className="lg:hidden text-white/70 hover:text-white p-1 rounded-lg hover:bg-white/10"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Navigation Links */}
                <nav className="sidebar-nav">
                    {/* Dashboard */}
                    <Link
                        href="/admin"
                        className={`sidebar-item ${isActive('/admin') ? 'active' : ''}`}
                        onClick={() => onClose && onClose()}
                        title="الرئيسية"
                    >
                        <LayoutDashboard className="w-5 h-5 shrink-0 text-purple-300" />
                        <span>لوحة التحكم</span>
                    </Link>

                    {/* Section: Management */}
                    <div className="sidebar-section-title">إدارة المشتركين</div>

                    {/* Customers */}
                    <Link
                        href="/admin/customers"
                        className={`sidebar-item ${isActive('/admin/customers') ? 'active' : ''}`}
                        onClick={() => onClose && onClose()}
                        title="العملاء والمنشآت"
                    >
                        <Users className="w-5 h-5 shrink-0 text-emerald-300" />
                        <span>العملاء والمنشآت</span>
                    </Link>

                    {/* Subscriptions */}
                    <Link
                        href="/admin/subscriptions"
                        className={`sidebar-item ${isActive('/admin/subscriptions') ? 'active' : ''}`}
                        onClick={() => onClose && onClose()}
                        title="الاشتراكات"
                    >
                        <CreditCard className="w-5 h-5 shrink-0 text-amber-300" />
                        <span>الاشتراكات</span>
                    </Link>

                    {/* Plans */}
                    <Link
                        href="/admin/plans"
                        className={`sidebar-item ${isActive('/admin/plans') ? 'active' : ''}`}
                        onClick={() => onClose && onClose()}
                        title="الباقات والأسعار"
                    >
                        <Package className="w-5 h-5 shrink-0 text-blue-300" />
                        <span>الباقات والأسعار</span>
                    </Link>

                    {/* Payments */}
                    <Link
                        href="/admin/payments"
                        className={`sidebar-item ${isActive('/admin/payments') ? 'active' : ''}`}
                        onClick={() => onClose && onClose()}
                        title="المدفوعات والإيرادات"
                    >
                        <DollarSign className="w-5 h-5 shrink-0 text-teal-300" />
                        <span>سجل المدفوعات</span>
                    </Link>

                    {/* Section: System */}
                    <div className="sidebar-section-title">النظام والعمليات</div>

                    {/* Activity Log */}
                    <Link
                        href="/admin/activity-log"
                        className={`sidebar-item ${isActive('/admin/activity-log') ? 'active' : ''}`}
                        onClick={() => onClose && onClose()}
                        title="سجل النشاطات"
                    >
                        <History className="w-5 h-5 shrink-0 text-slate-300" />
                        <span>سجل النشاطات</span>
                    </Link>
                </nav>

                {/* Footer */}
                <div className="sidebar-footer flex items-center justify-between">
                    <div className="flex items-center gap-2 overflow-hidden text-xs text-white/80">
                        <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                        <span className="truncate font-semibold">{user?.name || 'Super Admin'}</span>
                    </div>
                    {onToggleCollapse && (
                        <button
                            type="button"
                            onClick={onToggleCollapse}
                            className="hidden lg:flex p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                            title={isCollapsed ? 'توسيع القائمة' : 'تصغير القائمة'}
                        >
                            {isCollapsed ? <PanelRightOpen className="w-4 h-4" /> : <PanelRightClose className="w-4 h-4" />}
                        </button>
                    )}
                </div>
            </aside>
        </>
    );
}
