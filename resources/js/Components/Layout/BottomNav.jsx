import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import {
    LayoutDashboard,
    FileText,
    PlusCircle,
    Receipt,
    Users,
} from 'lucide-react';

export default function BottomNav() {
    const { url } = usePage();

    const isActive = (path) => {
        if (path === '/') return url === '/';
        return url.startsWith(path);
    };

    return (
        <nav className="bottom-nav">
            <Link
                href="/"
                className={`bottom-nav-item ${isActive('/') ? 'active' : ''}`}
            >
                <LayoutDashboard className="w-5 h-5" />
                <span>الرئيسية</span>
            </Link>

            <Link
                href="/invoices"
                className={`bottom-nav-item ${url.startsWith('/invoices') && url !== '/invoices/create' ? 'active' : ''}`}
            >
                <FileText className="w-5 h-5" />
                <span>الفواتير</span>
            </Link>

            {/* Quick Create Invoice Primary Action */}
            <Link
                href="/invoices/create"
                className="flex flex-col items-center justify-center -mt-5 bg-gradient-to-tr from-amber-500 to-amber-400 text-slate-900 w-13 h-13 rounded-full shadow-lg border-2 border-white hover:scale-105 active:scale-95 transition-all text-xs font-bold text-center"
            >
                <PlusCircle className="w-6 h-6" />
            </Link>

            <Link
                href="/receipt-vouchers"
                className={`bottom-nav-item ${url.startsWith('/receipt-vouchers') ? 'active' : ''}`}
            >
                <Receipt className="w-5 h-5" />
                <span>سند قبض</span>
            </Link>

            <Link
                href="/customers"
                className={`bottom-nav-item ${url.startsWith('/customers') ? 'active' : ''}`}
            >
                <Users className="w-5 h-5" />
                <span>العملاء</span>
            </Link>
        </nav>
    );
}
