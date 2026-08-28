import React, { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import {
    LayoutDashboard,
    FileText,
    Receipt,
    ShoppingBag,
    Package,
    FolderTree,
    ArrowLeftRight,
    Users,
    Truck,
    BarChart3,
    Settings,
    ChevronDown,
    PlusCircle,
    Building2,
    Percent,
    Sliders,
    X,
    PanelRightClose,
    PanelRightOpen,
} from 'lucide-react';

export default function Sidebar({ isOpen, onClose, isCollapsed, onToggleCollapse }) {
    const { url } = usePage();

    const isActive = (path) => {
        if (path === '/') return url === '/';
        return url.startsWith(path);
    };

    // Submenu states
    const [salesOpen, setSalesOpen] = useState(url.startsWith('/invoices') || url.startsWith('/receipt-vouchers'));
    const [purchasesOpen, setPurchasesOpen] = useState(url.startsWith('/purchases'));
    const [inventoryOpen, setInventoryOpen] = useState(url.startsWith('/products') || url.startsWith('/categories') || url.startsWith('/inventory'));
    const [reportsOpen, setReportsOpen] = useState(url.startsWith('/reports'));

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
                    <Link href="/" className="flex items-center gap-3 text-white no-underline overflow-hidden">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center shadow-md font-black text-slate-900 text-xl tracking-wider shrink-0">
                            س
                        </div>
                        <div className="overflow-hidden">
                            <div className="text-lg font-black tracking-tight text-white flex items-center gap-1.5 whitespace-nowrap">
                                سَنَد <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-white/15 text-amber-300">SANAD</span>
                            </div>
                            <div className="text-[11px] text-slate-300 font-medium whitespace-nowrap">إدارة الفواتير والمبيعات</div>
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

                {/* Navigation Links with Scrollable Nav */}
                <nav className="sidebar-nav">
                    {/* Dashboard */}
                    <Link
                        href="/"
                        className={`sidebar-item ${isActive('/') ? 'active' : ''}`}
                        onClick={() => onClose && onClose()}
                        title="الرئيسية"
                    >
                        <LayoutDashboard className="w-5 h-5 shrink-0" />
                        <span>الرئيسية</span>
                    </Link>

                    {/* Section: Sales */}
                    <div className="sidebar-section-title">المبيعات والفواتير</div>

                    <div>
                        <button
                            type="button"
                            onClick={() => setSalesOpen(!salesOpen)}
                            className={`w-full sidebar-item justify-between ${url.startsWith('/invoices') || url.startsWith('/receipt-vouchers') ? 'text-white' : ''}`}
                            title="المبيعات"
                        >
                            <div className="flex items-center gap-3">
                                <FileText className="w-5 h-5 shrink-0 text-amber-300" />
                                <span>المبيعات</span>
                            </div>
                            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${salesOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {salesOpen && (
                            <div className="sidebar-submenu">
                                <Link
                                    href="/invoices"
                                    className={`sidebar-item ${url === '/invoices' ? 'active' : ''}`}
                                    onClick={() => onClose && onClose()}
                                >
                                    <span>سجل الفواتير</span>
                                </Link>
                                <Link
                                    href="/invoices/create"
                                    className={`sidebar-item ${url === '/invoices/create' ? 'active' : ''}`}
                                    onClick={() => onClose && onClose()}
                                >
                                    <PlusCircle className="w-4 h-4 text-emerald-400" />
                                    <span className="text-emerald-300 font-bold">+ فاتورة جديدة</span>
                                </Link>
                                <Link
                                    href="/receipt-vouchers"
                                    className={`sidebar-item ${url.startsWith('/receipt-vouchers') ? 'active' : ''}`}
                                    onClick={() => onClose && onClose()}
                                >
                                    <Receipt className="w-4 h-4 text-amber-300" />
                                    <span>سندات القبض</span>
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Section: Purchases */}
                    <div className="sidebar-section-title">المشتريات</div>

                    <div>
                        <button
                            type="button"
                            onClick={() => setPurchasesOpen(!purchasesOpen)}
                            className={`w-full sidebar-item justify-between ${url.startsWith('/purchases') ? 'text-white' : ''}`}
                            title="المشتريات"
                        >
                            <div className="flex items-center gap-3">
                                <ShoppingBag className="w-5 h-5 shrink-0 text-blue-300" />
                                <span>المشتريات</span>
                            </div>
                            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${purchasesOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {purchasesOpen && (
                            <div className="sidebar-submenu">
                                <Link
                                    href="/purchases"
                                    className={`sidebar-item ${url === '/purchases' ? 'active' : ''}`}
                                    onClick={() => onClose && onClose()}
                                >
                                    <span>فواتير الشراء</span>
                                </Link>
                                <Link
                                    href="/purchases/create"
                                    className={`sidebar-item ${url === '/purchases/create' ? 'active' : ''}`}
                                    onClick={() => onClose && onClose()}
                                >
                                    <PlusCircle className="w-4 h-4 text-blue-300" />
                                    <span>+ شراء جديد</span>
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Section: Inventory */}
                    <div className="sidebar-section-title">المخزون والمنتجات</div>

                    <div>
                        <button
                            type="button"
                            onClick={() => setInventoryOpen(!inventoryOpen)}
                            className={`w-full sidebar-item justify-between ${url.startsWith('/products') || url.startsWith('/categories') || url.startsWith('/inventory') ? 'text-white' : ''}`}
                            title="المخزون"
                        >
                            <div className="flex items-center gap-3">
                                <Package className="w-5 h-5 shrink-0 text-teal-300" />
                                <span>المخزون</span>
                            </div>
                            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${inventoryOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {inventoryOpen && (
                            <div className="sidebar-submenu">
                                <Link
                                    href="/inventory"
                                    className={`sidebar-item ${url === '/inventory' ? 'active' : ''}`}
                                    onClick={() => onClose && onClose()}
                                >
                                    <span>حالة المخزون</span>
                                </Link>
                                <Link
                                    href="/products"
                                    className={`sidebar-item ${url.startsWith('/products') ? 'active' : ''}`}
                                    onClick={() => onClose && onClose()}
                                >
                                    <span>المنتجات</span>
                                </Link>
                                <Link
                                    href="/categories"
                                    className={`sidebar-item ${url.startsWith('/categories') ? 'active' : ''}`}
                                    onClick={() => onClose && onClose()}
                                >
                                    <span>التصنيفات</span>
                                </Link>
                                <Link
                                    href="/inventory/movements"
                                    className={`sidebar-item ${url.startsWith('/inventory/movements') ? 'active' : ''}`}
                                    onClick={() => onClose && onClose()}
                                >
                                    <ArrowLeftRight className="w-4 h-4" />
                                    <span>حركة المخزون</span>
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Section: Contacts */}
                    <div className="sidebar-section-title">الجهات</div>

                    <Link
                        href="/customers"
                        className={`sidebar-item ${url.startsWith('/customers') ? 'active' : ''}`}
                        onClick={() => onClose && onClose()}
                        title="العملاء والمحلات"
                    >
                        <Users className="w-5 h-5 shrink-0 text-emerald-300" />
                        <span>العملاء والمحلات</span>
                    </Link>

                    <Link
                        href="/suppliers"
                        className={`sidebar-item ${url.startsWith('/suppliers') ? 'active' : ''}`}
                        onClick={() => onClose && onClose()}
                        title="الموردون"
                    >
                        <Truck className="w-5 h-5 shrink-0 text-indigo-300" />
                        <span>الموردون</span>
                    </Link>

                    {/* Section: Reports */}
                    <div className="sidebar-section-title">التقارير والمحاسب</div>

                    <div>
                        <button
                            type="button"
                            onClick={() => setReportsOpen(!reportsOpen)}
                            className={`w-full sidebar-item justify-between ${url.startsWith('/reports') ? 'text-white' : ''}`}
                            title="التقارير"
                        >
                            <div className="flex items-center gap-3">
                                <BarChart3 className="w-5 h-5 shrink-0 text-amber-400" />
                                <span>التقارير</span>
                            </div>
                            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${reportsOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {reportsOpen && (
                            <div className="sidebar-submenu">
                                <Link
                                    href="/reports/accountant"
                                    className={`sidebar-item ${url === '/reports/accountant' ? 'active' : ''}`}
                                    onClick={() => onClose && onClose()}
                                >
                                    <span className="text-amber-300 font-bold">ملف المحاسب والضريبة</span>
                                </Link>
                                <Link
                                    href="/reports/sales"
                                    className={`sidebar-item ${url === '/reports/sales' ? 'active' : ''}`}
                                    onClick={() => onClose && onClose()}
                                >
                                    <span>تقرير المبيعات</span>
                                </Link>
                                <Link
                                    href="/reports/purchases"
                                    className={`sidebar-item ${url === '/reports/purchases' ? 'active' : ''}`}
                                    onClick={() => onClose && onClose()}
                                >
                                    <span>تقرير المشتريات</span>
                                </Link>
                                <Link
                                    href="/reports/tax"
                                    className={`sidebar-item ${url === '/reports/tax' ? 'active' : ''}`}
                                    onClick={() => onClose && onClose()}
                                >
                                    <span>الإقرار الضريبي</span>
                                </Link>
                                <Link
                                    href="/reports/profits"
                                    className={`sidebar-item ${url === '/reports/profits' ? 'active' : ''}`}
                                    onClick={() => onClose && onClose()}
                                >
                                    <span>الأرباح التقديرية</span>
                                </Link>
                                <Link
                                    href="/reports/inventory"
                                    className={`sidebar-item ${url === '/reports/inventory' ? 'active' : ''}`}
                                    onClick={() => onClose && onClose()}
                                >
                                    <span>تقييم المخزون</span>
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Section: Settings */}
                    <div className="sidebar-section-title">الإعدادات</div>

                    <Link
                        href="/settings/company"
                        className={`sidebar-item ${url.startsWith('/settings') ? 'active' : ''}`}
                        onClick={() => onClose && onClose()}
                        title="بيانات المنشأة والضريبة"
                    >
                        <Settings className="w-5 h-5 shrink-0 text-slate-400" />
                        <span>بيانات المنشأة والضريبة</span>
                    </Link>
                </nav>

                {/* Footer collapse button & info */}
                <div className="sidebar-footer flex items-center justify-between">
                    <span className="font-semibold">SANAD © 2026</span>
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
