<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\CompanySetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class CompanySettingController extends Controller
{
    public function edit(): Response
    {
        $settings = CompanySetting::getOrCreate();

        return Inertia::render('Settings/Company', [
            'settings' => $settings,
        ]);
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'name'                => 'required|string|max:255',
            'commercial_register' => 'nullable|string|max:100',
            'tax_number'          => 'nullable|string|max:100',
            'phone'               => 'nullable|string|max:50',
            'email'               => 'nullable|email|max:255',
            'address'             => 'nullable|string',
            'city'                => 'nullable|string|max:100',
            'region'              => 'nullable|string|max:100',
            'postal_code'         => 'nullable|string|max:20',
            'additional_number'   => 'nullable|string|max:20',
            'currency'            => 'required|string|max:10',
            'currency_symbol'     => 'required|string|max:10',
            'default_tax_rate'    => 'required|numeric|min:0|max:100',
            'invoice_notes'       => 'nullable|string',
            'invoice_prefix'      => 'required|string|max:10',
            'purchase_prefix'     => 'required|string|max:10',
            'receipt_prefix'      => 'required|string|max:10',
        ], [
            'name.required'             => 'يرجى إدخال اسم المنشأة.',
            'default_tax_rate.required' => 'يرجى تحديد نسبة الضريبة الافتراضية.',
        ]);

        $settings = CompanySetting::getOrCreate();
        $settings->update($validated);

        AuditLog::record('update', 'تم تحديث إعدادات المنشأة والضرائب', $settings);

        return redirect()->back()->with('success', 'تم حفظ إعدادات المنشأة بنجاح.');
    }

    public function uploadLogo(Request $request)
    {
        $request->validate([
            'logo' => 'required|image|mimes:jpeg,png,jpg,webp,svg|max:3072',
        ], [
            'logo.required' => 'يرجى اختيار ملف صورة الشعار.',
            'logo.image'    => 'الملف المرفق يجب أن يكون صورة بصيغة صالحة (PNG, JPG, SVG, WEBP).',
            'logo.mimes'    => 'الصيغ المسموح بها للشعار هي: JPG, JPEG, PNG, WEBP, SVG.',
            'logo.max'      => 'حجم الصورة يجب ألا يتجاوز 3 ميجابايت.',
        ]);

        $settings = CompanySetting::getOrCreate();

        // Delete old logo if exists
        if ($settings->logo_path && Storage::disk('public')->exists($settings->logo_path)) {
            Storage::disk('public')->delete($settings->logo_path);
        }

        $path = $request->file('logo')->store('company', 'public');
        $settings->update(['logo_path' => $path]);

        AuditLog::record('update', 'تم تحديث ورفع شعار المنشأة الجديد', $settings);

        return redirect()->back()->with('success', 'تم رفع وتحديث شعار المنشأة بنجاح.');
    }
}
