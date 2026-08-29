import React, { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import AdminLayout from '@/Components/Layout/AdminLayout';
import {
    History,
    Search,
    Calendar,
    Filter,
    Activity,
    Shield,
} from 'lucide-react';

export default function Index({ logs, available_actions, filters }) {
    const [action, setAction] = useState(filters.action || '');
    const [fromDate, setFromDate] = useState(filters.from_date || '');
    const [toDate, setToDate] = useState(filters.to_date || '');

    const handleSearch = (e) => {
        e.preventDefault();
        router.get('/admin/activity-log', {
            action,
            from_date: fromDate,
            to_date: toDate,
        }, { preserveState: true });
    };

    const handleReset = () => {
        setAction('');
        setFromDate('');
        setToDate('');
        router.get('/admin/activity-log');
    };

    return (
        <AdminLayout title="سجل نشاطات النظام">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-black text-white flex items-center gap-2">
                        <History className="w-6 h-6 text-slate-300" />
                        <span>سجل نشاطات وعمليات المشرفين</span>
                    </h1>
                    <p className="text-xs text-slate-400 mt-1">
                        سجل تدقيق كامل لجميع إجراءات الإنشاء، التعديل، التفعيل، والتمديد لضمان الأمان والشفافية
                    </p>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 mb-6">
                <form onSubmit={handleSearch} className="flex flex-wrap items-center gap-3">
                    <div className="min-w-[200px]">
                        <select
                            value={action}
                            onChange={(e) => setAction(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                        >
                            <option value="">جميع أنواع الإجراءات</option>
                            {available_actions.map((act) => (
                                <option key={act} value={act}>{act}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex items-center gap-2">
                        <input
                            type="date"
                            value={fromDate}
                            onChange={(e) => setFromDate(e.target.value)}
                            className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white font-mono"
                        />
                        <span className="text-slate-400 text-xs">إلى</span>
                        <input
                            type="date"
                            value={toDate}
                            onChange={(e) => setToDate(e.target.value)}
                            className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white font-mono"
                        />
                    </div>

                    <button
                        type="submit"
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl transition-colors"
                    >
                        تصفية
                    </button>

                    {(action || fromDate || toDate) && (
                        <button
                            type="button"
                            onClick={handleReset}
                            className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs font-bold rounded-xl transition-colors"
                        >
                            إلغاء التصفية
                        </button>
                    )}
                </form>
            </div>

            {/* Logs Table */}
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-right text-xs">
                        <thead>
                            <tr className="border-b border-slate-700 bg-slate-900/60 text-slate-400 font-bold">
                                <th className="p-4">الوقت والتاريخ</th>
                                <th className="p-4">المستخدم</th>
                                <th className="p-4">نوع الإجراء</th>
                                <th className="p-4">تفاصيل العملية</th>
                                <th className="p-4">عنوان IP</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700/50">
                            {logs.data.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="text-center py-10 text-slate-400">
                                        لا توجد نشاطات مسجلة
                                    </td>
                                </tr>
                            ) : (
                                logs.data.map((log) => (
                                    <tr key={log.id} className="hover:bg-slate-750/40">
                                        <td className="p-4 font-mono text-slate-300 whitespace-nowrap">
                                            {log.created_at?.substring(0, 16).replace('T', ' ')}
                                        </td>
                                        <td className="p-4 font-bold text-white">
                                            {log.user?.name || <span className="text-slate-500">النظام</span>}
                                        </td>
                                        <td className="p-4">
                                            <span className="px-2 py-0.5 rounded font-mono text-[10px] bg-slate-900 border border-slate-700 text-purple-300">
                                                {log.action}
                                            </span>
                                        </td>
                                        <td className="p-4 text-slate-200 font-medium">
                                            {log.description}
                                        </td>
                                        <td className="p-4 font-mono text-slate-400 text-[11px]">
                                            {log.ip_address || '—'}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {logs.links && logs.links.length > 3 && (
                    <div className="p-4 border-t border-slate-700/80 flex items-center justify-between text-xs text-slate-400">
                        <div>
                            عرض {logs.from} إلى {logs.to} من أصل {logs.total} نشاط
                        </div>
                        <div className="flex items-center gap-1">
                            {logs.links.map((link, idx) => (
                                <Link
                                    key={idx}
                                    href={link.url || '#'}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                    className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
                                        link.active
                                            ? 'bg-purple-600 text-white'
                                            : link.url
                                            ? 'bg-slate-700 hover:bg-slate-600 text-slate-200'
                                            : 'opacity-50 cursor-not-allowed text-slate-500'
                                    }`}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
