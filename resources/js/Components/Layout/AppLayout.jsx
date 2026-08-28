import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import Sidebar from './Sidebar';
import Header from './Header';
import BottomNav from './BottomNav';
import FlashMessages from '../UI/FlashMessages';

export default function AppLayout({ title, children }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('sanad_sidebar_collapsed') === 'true';
        }
        return false;
    });

    const toggleCollapse = () => {
        setSidebarCollapsed((prev) => {
            const next = !prev;
            if (typeof window !== 'undefined') {
                localStorage.setItem('sanad_sidebar_collapsed', String(next));
            }
            return next;
        });
    };

    const handleMenuClick = () => {
        // On mobile: opens drawer; on desktop: toggles collapse
        if (window.innerWidth < 1024) {
            setSidebarOpen(true);
        } else {
            toggleCollapse();
        }
    };

    return (
        <div className="min-h-screen bg-slate-100 flex flex-col font-sans antialiased text-slate-800" dir="rtl">
            <Head title={title} />

            {/* Flash Messages Toast */}
            <FlashMessages />

            {/* Sidebar */}
            <Sidebar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
                isCollapsed={sidebarCollapsed}
                onToggleCollapse={toggleCollapse}
            />

            {/* Main Content Container */}
            <div className={`app-main flex flex-col flex-1 ${sidebarCollapsed ? 'collapsed' : ''}`}>
                <Header onMenuClick={handleMenuClick} isSidebarCollapsed={sidebarCollapsed} />

                <main className="page-content flex-1">
                    {children}
                </main>
            </div>

            {/* Mobile Bottom Navigation */}
            <BottomNav />
        </div>
    );
}
