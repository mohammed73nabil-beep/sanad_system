import React, { useState, useRef } from 'react';
import { useForm, router } from '@inertiajs/react';
import AppLayout from '@/Components/Layout/AppLayout';
import {
    Building2,
    Save,
    Upload,
    Percent,
    Settings,
    FileText,
    CheckCircle2,
    Image as ImageIcon,
    Trash2,
} from 'lucide-react';

export default function CompanySettings({ settings }) {
    // Form for General Settings
    const { data, setData, put, processing, errors } = useForm({
        name: settings.name || '',
        commercial_register: settings.commercial_register || '',
        tax_number: settings.tax_number || '',
        phone: settings.phone || '',
        email: settings.email || '',
        address: settings.address || '',
        city: settings.city || '',
        region: settings.region || '',
        postal_code: settings.postal_code || '',
        additional_number: settings.additional_number || '',
        currency: settings.currency || 'SAR',
        currency_symbol: settings.currency_symbol || 'ر.س',
        default_tax_rate: settings.default_tax_rate || 15.00,
        invoice_notes: settings.invoice_notes || '',
        invoice_prefix: settings.invoice_prefix || 'INV',
        purchase_prefix: settings.purchase_prefix || 'PUR',
        receipt_prefix: settings.receipt_prefix || 'RCV',
    });

    // Dedicated Inertia useForm for Logo Upload
    const {
        data: logoData,
        setData: setLogoData,
        post: postLogo,
        processing: uploadingLogo,
        errors: logoErrors,
        reset: resetLogo,
    } = useForm({
        logo: null,
    });

    const [previewUrl, setPreviewUrl] = useState(null);
    const fileInputRef = useRef(null);

    const handleSubmit = (e) => {
        e.preventDefault();
        put('/settings/company');
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setLogoData('logo', file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleLogoUpload = (e) => {
        e.preventDefault();
        if (!logoData.logo) return;

        postLogo('/settings/company/logo', {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                setPreviewUrl(null);
                resetLogo();
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
            },
        });
    };

    const cancelPreview = () => {
        setPreviewUrl(null);
        setLogoData('logo', null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <AppLayout title="إعدادات المنشأة والضرائب">
            <div className="space-y-6">
                <div className="page-header">
                    <div>
                        <h1 className="page-title">
                            <Settings className="w-7 h-7 text-slate-700" />
                            <span>إعدادات المنشأة والضرائب والفواتير</span>
                        </h1>
                        <p className="page-subtitle">
                            تخصيص البيانات الرسمية التي تظهر على الفواتير المطبوعة وسندات القبض
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Settings Form */}
                    <div className="lg:col-span-2 space-y-6">
                        <form onSubmit={handleSubmit} className="card space-y-6">
                            {/* General Company Information */}
                            <div>
                                <h3 className="font-bold text-base text-slate-900 border-b pb-2 mb-4 flex items-center gap-2">
                                    <Building2 className="w-5 h-5 text-sky-700" />
                                    <span>البيانات الأساسية للمنشأة</span>
                                </h3>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="sm:col-span-2">
                                        <label className="label">اسم المنشأة / المحل التجاري *</label>
                                        <input
                                            type="text"
                                            className={`input ${errors.name ? 'input-error' : ''}`}
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            required
                                        />
                                        {errors.name && <div className="field-error">{errors.name}</div>}
                                    </div>

                                    <div>
                                        <label className="label">الرقم الضريبي (VAT Number)</label>
                                        <input
                                            type="text"
                                            className="input font-mono"
                                            placeholder="300000000000003"
                                            value={data.tax_number}
                                            onChange={(e) => setData('tax_number', e.target.value)}
                                        />
                                    </div>

                                    <div>
                                        <label className="label">رقم السجل التجاري (CR)</label>
                                        <input
                                            type="text"
                                            className="input font-mono"
                                            placeholder="1010000000"
                                            value={data.commercial_register}
                                            onChange={(e) => setData('commercial_register', e.target.value)}
                                        />
                                    </div>

                                    <div>
                                        <label className="label">رقم الهاتف / الجوال</label>
                                        <input
                                            type="text"
                                            className="input"
                                            placeholder="05XXXXXXXX"
                                            value={data.phone}
                                            onChange={(e) => setData('phone', e.target.value)}
                                        />
                                    </div>

                                    <div>
                                        <label className="label">البريد الإلكتروني</label>
                                        <input
                                            type="email"
                                            className="input"
                                            placeholder="info@company.com"
                                            value={data.email}
                                            onChange={(e) => setData('email', e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Address Details */}
                            <div>
                                <h3 className="font-bold text-base text-slate-900 border-b pb-2 mb-4">
                                    العنوان الوطني والتفصيلي
                                </h3>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="label">المدينة</label>
                                        <input
                                            type="text"
                                            className="input"
                                            placeholder="الرياض"
                                            value={data.city}
                                            onChange={(e) => setData('city', e.target.value)}
                                        />
                                    </div>

                                    <div>
                                        <label className="label">المنطقة</label>
                                        <input
                                            type="text"
                                            className="input"
                                            placeholder="منطقة الرياض"
                                            value={data.region}
                                            onChange={(e) => setData('region', e.target.value)}
                                        />
                                    </div>

                                    <div className="sm:col-span-2">
                                        <label className="label">العنوان بالتفصيل (اسم الشارع، الحي، رقم المبنى)</label>
                                        <input
                                            type="text"
                                            className="input"
                                            placeholder="شارع الملك فهد، حي العليا..."
                                            value={data.address}
                                            onChange={(e) => setData('address', e.target.value)}
                                        />
                                    </div>

                                    <div>
                                        <label className="label">الرمز البريدي</label>
                                        <input
                                            type="text"
                                            className="input font-mono"
                                            placeholder="12345"
                                            value={data.postal_code}
                                            onChange={(e) => setData('postal_code', e.target.value)}
                                        />
                                    </div>

                                    <div>
                                        <label className="label">الرقم الإضافي</label>
                                        <input
                                            type="text"
                                            className="input font-mono"
                                            placeholder="6789"
                                            value={data.additional_number}
                                            onChange={(e) => setData('additional_number', e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Tax & Prefixes Settings */}
                            <div>
                                <h3 className="font-bold text-base text-slate-900 border-b pb-2 mb-4 flex items-center gap-2">
                                    <Percent className="w-5 h-5 text-amber-500" />
                                    <span>الضرائب وترقيم المستندات</span>
                                </h3>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div>
                                        <label className="label">نسبة الضريبة الافتراضية (%)</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            max="100"
                                            className="input font-mono font-bold text-amber-900"
                                            value={data.default_tax_rate}
                                            onChange={(e) => setData('default_tax_rate', e.target.value)}
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="label">بادئة رقم الفاتورة</label>
                                        <input
                                            type="text"
                                            className="input font-mono"
                                            placeholder="INV"
                                            value={data.invoice_prefix}
                                            onChange={(e) => setData('invoice_prefix', e.target.value)}
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="label">بادئة سند القبض</label>
                                        <input
                                            type="text"
                                            className="input font-mono"
                                            placeholder="RCV"
                                            value={data.receipt_prefix}
                                            onChange={(e) => setData('receipt_prefix', e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Print Notes */}
                            <div>
                                <label className="label">ملاحظات وشروط تظهر في أسفل الفاتورة المطبوعة</label>
                                <textarea
                                    className="input text-xs"
                                    rows="3"
                                    placeholder="مثال: البضاعة المباعة لا ترد ولا تستبدل بعد 3 أيام / شكراً لتعاملكم معنا..."
                                    value={data.invoice_notes}
                                    onChange={(e) => setData('invoice_notes', e.target.value)}
                                ></textarea>
                            </div>

                            <button
                                type="submit"
                                disabled={processing}
                                className="btn btn-primary btn-lg flex items-center gap-2 shadow-md font-bold"
                            >
                                <Save className="w-5 h-5" />
                                <span>حفظ إعدادات المنشأة</span>
                            </button>
                        </form>
                    </div>

                    {/* Right Column: Logo Upload */}
                    <div className="space-y-6">
                        <div className="card space-y-4">
                            <h3 className="font-bold text-base text-slate-900 border-b pb-2 flex items-center gap-2">
                                <ImageIcon className="w-5 h-5 text-sky-700" />
                                <span>شعار المنشأة (Logo)</span>
                            </h3>

                            {/* Preview or Current Logo */}
                            <div className="text-center p-6 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50 relative">
                                {previewUrl ? (
                                    <div className="space-y-3">
                                        <img
                                            src={previewUrl}
                                            alt="معاينة الشعار الجديد"
                                            className="max-h-32 mx-auto object-contain rounded-lg border bg-white p-2 shadow-xs"
                                        />
                                        <div className="text-xs text-amber-700 font-bold">
                                            معاينة الشعار الجديد (اضغط حفظ الشعار لتثبيته)
                                        </div>
                                    </div>
                                ) : settings.logo_path ? (
                                    <div className="space-y-3">
                                        <img
                                            src={`/storage/${settings.logo_path}`}
                                            alt="شعار المنشأة الحالي"
                                            className="max-h-32 mx-auto object-contain rounded-lg border bg-white p-2 shadow-xs"
                                        />
                                        <div className="text-xs text-emerald-600 font-semibold flex items-center justify-center gap-1">
                                            <CheckCircle2 className="w-4 h-4" />
                                            <span>الشعار الحالي معتمد</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-slate-400 text-xs py-4">
                                        <Building2 className="w-12 h-12 mx-auto mb-2 opacity-40 text-slate-400" />
                                        <span>لم يتم رفع شعار للمنشأة بعد</span>
                                        <p className="text-[11px] text-slate-400 mt-1">يظهر الشعار أعلى الفواتير وسندات القبض المطبوعة</p>
                                    </div>
                                )}
                            </div>

                            {/* Upload Form */}
                            <form onSubmit={handleLogoUpload} className="space-y-3">
                                <div>
                                    <label className="label text-xs">اختر صورة الشعار</label>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml"
                                        className="input text-xs"
                                        onChange={handleFileChange}
                                        required
                                    />
                                    {logoErrors.logo && <div className="field-error mt-1">{logoErrors.logo}</div>}
                                    <div className="text-[11px] text-slate-400 mt-1">
                                        الصيغ المدعومة: PNG, JPG, WEBP, SVG حتى 3 ميجابايت
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        type="submit"
                                        disabled={!logoData.logo || uploadingLogo}
                                        className="btn btn-primary flex-1 justify-center text-xs font-bold shadow-xs disabled:opacity-50"
                                    >
                                        <Upload className="w-4 h-4" />
                                        <span>{uploadingLogo ? 'جارٍ الرفع...' : 'حفظ وتحديث الشعار'}</span>
                                    </button>

                                    {previewUrl && (
                                        <button
                                            type="button"
                                            onClick={cancelPreview}
                                            className="btn btn-secondary text-xs"
                                            title="إلغاء المعاينة"
                                        >
                                            إلغاء
                                        </button>
                                    )}
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
