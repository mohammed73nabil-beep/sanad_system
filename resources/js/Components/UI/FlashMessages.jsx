import React, { useState, useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export default function FlashMessages() {
    const { flash } = usePage().props;
    const [visible, setVisible] = useState(true);

    const message = flash?.success || flash?.error || flash?.warning || flash?.info;
    const type = flash?.success ? 'success' : flash?.error ? 'error' : flash?.warning ? 'warning' : 'info';

    useEffect(() => {
        if (message) {
            setVisible(true);
            const timer = setTimeout(() => setVisible(false), 5000);
            return () => clearTimeout(timer);
        }
    }, [flash]);

    if (!message || !visible) return null;

    const styles = {
        success: 'bg-emerald-50 text-emerald-900 border-emerald-300',
        error: 'bg-red-50 text-red-900 border-red-300',
        warning: 'bg-amber-50 text-amber-900 border-amber-300',
        info: 'bg-blue-50 text-blue-900 border-blue-300',
    }[type];

    const Icon = {
        success: CheckCircle2,
        error: AlertCircle,
        warning: AlertTriangle,
        info: Info,
    }[type];

    return (
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl border shadow-lg transition-all ${styles}`}>
            <Icon className="w-5 h-5 shrink-0" />
            <span className="text-sm font-semibold">{message}</span>
            <button
                type="button"
                onClick={() => setVisible(false)}
                className="p-1 -mr-2 rounded-lg opacity-70 hover:opacity-100 transition-opacity"
            >
                <X className="w-4 h-4" />
            </button>
        </div>
    );
}
