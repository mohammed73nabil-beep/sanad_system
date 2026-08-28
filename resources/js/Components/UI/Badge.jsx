import React from 'react';

export default function Badge({ status, text, type = 'status' }) {
    const getBadgeClass = () => {
        switch (status) {
            case 'draft':
                return 'badge-draft';
            case 'issued':
                return 'badge-issued';
            case 'partially_paid':
                return 'badge-partially-paid';
            case 'paid':
                return 'badge-paid';
            case 'overdue':
                return 'badge-overdue';
            case 'cancelled':
                return 'badge-cancelled';
            case 'available':
                return 'badge-available';
            case 'low':
                return 'badge-low';
            case 'empty':
                return 'badge-empty';
            case 'individual':
                return 'bg-slate-100 text-slate-700';
            case 'business':
                return 'bg-blue-50 text-blue-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <span className={`badge ${getBadgeClass()}`}>
            {text || status}
        </span>
    );
}
