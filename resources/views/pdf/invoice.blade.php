<!DOCTYPE html>
<html dir="rtl">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>{{ $invoice->invoice_number }}</title>
    <style>
        @page {
            size: 210mm 297mm;
            margin: 10mm 12mm 10mm 12mm;
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        html, body {
            width: 100%;
            max-width: 100%;
            font-family: 'dejavu sans', Arial, sans-serif;
            font-size: 11px;
            color: #1e293b;
            line-height: 1.4;
            background: #ffffff;
            direction: rtl;
        }

        /* ===== HEADER ===== */
        .header-table {
            width: 100%;
            table-layout: fixed;
            border-collapse: collapse;
            margin-bottom: 10px;
            border-bottom: 2px solid #1B4B6B;
            padding-bottom: 8px;
            direction: rtl;
        }

        .header-table td {
            vertical-align: top;
        }

        .logo-col {
            width: 25%;
            text-align: right;
        }

        .logo-img {
            max-width: 150px;
            max-height: 75px;
            object-fit: contain;
        }

        .logo-placeholder {
            width: 75px;
            height: 60px;
            background-color: #1B4B6B;
            color: #ffffff;
            border-radius: 6px;
            font-size: 22px;
            font-weight: bold;
            text-align: center;
            line-height: 60px;
        }

        .company-col {
            width: 45%;
            text-align: right;
            padding-right: 12px;
            padding-left: 5px;
        }

        .company-name {
            font-size: 14px;
            font-weight: bold;
            color: #1B4B6B;
            margin-bottom: 3px;
        }

        .company-info {
            font-size: 9.5px;
            color: #475569;
            margin-bottom: 2px;
        }

        .invoice-col {
            width: 30%;
            text-align: left;
        }

        .invoice-title {
            font-size: 17px;
            font-weight: bold;
            color: #C8922A;
            margin-bottom: 2px;
        }

        .invoice-number {
            font-size: 13px;
            font-weight: bold;
            color: #1B4B6B;
            margin-bottom: 3px;
        }

        .meta-line {
            font-size: 9.5px;
            color: #475569;
            margin-bottom: 2px;
        }

        .status-badge {
            display: inline-block;
            padding: 2px 8px;
            border-radius: 4px;
            font-size: 9px;
            font-weight: bold;
            margin-top: 3px;
        }
        .badge-paid { background-color: #d1fae5; color: #065f46; }
        .badge-partial { background-color: #fef3c7; color: #92400e; }
        .badge-unpaid { background-color: #fee2e2; color: #991b1b; }

        /* ===== CUSTOMER BOX TABLE ===== */
        .customer-box-table {
            width: 100%;
            table-layout: fixed;
            border-collapse: collapse;
            background-color: #f8fafc;
            border: 1px solid #cbd5e1;
            border-radius: 5px;
            margin-bottom: 10px;
            direction: rtl;
        }

        .box-title-cell {
            font-size: 10px;
            font-weight: bold;
            color: #1B4B6B;
            border-bottom: 1px solid #e2e8f0;
            padding: 5px 8px;
            text-align: right;
            background-color: #f1f5f9;
        }

        .customer-data-cell {
            font-size: 9.5px;
            padding: 4px 8px;
            text-align: right;
            vertical-align: top;
        }

        /* ===== ITEMS TABLE ===== */
        .items-table {
            width: 100%;
            table-layout: fixed;
            border-collapse: collapse;
            margin-bottom: 10px;
            direction: rtl;
        }

        .items-table th {
            background-color: #1B4B6B;
            color: #ffffff;
            font-size: 9.5px;
            font-weight: bold;
            padding: 6px 4px;
            border: 1px solid #1B4B6B;
            text-align: center;
        }

        .items-table td {
            font-size: 9px;
            padding: 5px 4px;
            border: 1px solid #e2e8f0;
            text-align: center;
            vertical-align: middle;
        }

        .items-table tbody tr:nth-child(even) td {
            background-color: #f8fafc;
        }

        .items-table td.desc-cell {
            text-align: right;
            padding-right: 6px;
        }

        /* ===== TOTALS & NOTES WRAPPER ===== */
        .summary-table {
            width: 100%;
            table-layout: fixed;
            border-collapse: collapse;
            margin-bottom: 8px;
            direction: rtl;
        }

        .summary-table td {
            vertical-align: top;
        }

        .notes-side {
            width: 52%;
            padding-left: 8px;
        }

        .totals-side {
            width: 48%;
        }

        .totals-table {
            width: 100%;
            table-layout: fixed;
            border-collapse: collapse;
            direction: rtl;
        }

        .totals-table td {
            padding: 4px 6px;
            font-size: 9.5px;
            border: 1px solid #e2e8f0;
        }

        .tot-label {
            background-color: #f1f5f9;
            font-weight: bold;
            color: #374151;
            width: 55%;
            text-align: right;
            padding-right: 6px;
        }

        .tot-value {
            text-align: left;
            font-weight: bold;
            color: #0f172a;
            padding-left: 6px;
        }

        .grand-row td {
            background-color: #1B4B6B !important;
            color: #ffffff !important;
            font-size: 10.5px !important;
        }

        .paid-text { color: #065f46; }
        .due-text  { color: #991b1b; }

        /* ===== CODES (BARCODE + QR) ===== */
        .codes-table {
            width: 100%;
            table-layout: fixed;
            border-collapse: collapse;
            margin-top: 8px;
            direction: rtl;
        }

        .codes-table td {
            text-align: center;
            vertical-align: middle;
        }

        .barcode-img {
            max-width: 180px;
            height: 38px;
        }

        .qr-img {
            width: 65px;
            height: 65px;
        }

        .code-caption {
            font-size: 8px;
            color: #64748b;
            margin-top: 2px;
        }

        /* ===== SIGNATURES ===== */
        .sig-table {
            width: 100%;
            table-layout: fixed;
            border-collapse: collapse;
            margin-top: 12px;
            direction: rtl;
        }

        .sig-cell-right {
            width: 50%;
            text-align: right;
            font-size: 9px;
            color: #475569;
        }

        .sig-cell-left {
            width: 50%;
            text-align: left;
            font-size: 9px;
            color: #475569;
        }

        .sig-line {
            width: 120px;
            border-top: 1px dashed #94a3b8;
            padding-top: 3px;
            margin-top: 20px;
        }

        /* ===== FOOTER ===== */
        .footer-bar {
            margin-top: 10px;
            border-top: 1px solid #e2e8f0;
            padding-top: 5px;
            text-align: center;
            font-size: 8px;
            color: #94a3b8;
        }
    </style>
</head>
<body>

    <!-- 1. HEADER -->
    <table class="header-table">
        <tr>
            <!-- Logo -->
            <td class="logo-col">
                @if($company->logo_path && file_exists(storage_path('app/public/' . $company->logo_path)))
                    <img src="{{ storage_path('app/public/' . $company->logo_path) }}" class="logo-img" alt="Logo" />
                @else
                    <div class="logo-placeholder">سَنَد</div>
                @endif
            </td>

            <!-- Company Info -->
            <td class="company-col">
                <div class="company-name">{{ $ar($company->name ?? 'مؤسسة سَنَد للتجارة') }}</div>
                @if($company->commercial_register)
                    <div class="company-info">{{ $ar('السجل التجاري:') }} {{ $company->commercial_register }}</div>
                @endif
                @if($company->tax_number)
                    <div class="company-info">{{ $ar('الرقم الضريبي:') }} {{ $company->tax_number }}</div>
                @endif
                @if($company->address || $company->city)
                    <div class="company-info">{{ $ar($company->city . ($company->address ? ' - ' . $company->address : '')) }}</div>
                @endif
                @if($company->phone)
                    <div class="company-info">{{ $ar('هاتف:') }} {{ $company->phone }}</div>
                @endif
            </td>

            <!-- Invoice Title & Meta -->
            <td class="invoice-col">
                <div class="invoice-title">{{ $ar('فاتورة ضريبية') }}</div>
                <div class="invoice-number">{{ $invoice->invoice_number }}</div>
                <div class="meta-line">{{ $ar('تاريخ الإصدار:') }} {{ $invoice->issue_date->format('Y-m-d') }}</div>
                @if($invoice->due_date)
                    <div class="meta-line">{{ $ar('تاريخ الاستحقاق:') }} {{ $invoice->due_date->format('Y-m-d') }}</div>
                @endif
                <div>
                    @if($invoice->status === 'paid')
                        <span class="status-badge badge-paid">{{ $ar('مدفوعة بالكامل') }}</span>
                    @elseif($invoice->status === 'partially_paid')
                        <span class="status-badge badge-partial">{{ $ar('مدفوعة جزئياً') }}</span>
                    @elseif($invoice->status === 'cancelled')
                        <span class="status-badge badge-unpaid">{{ $ar('ملغاة') }}</span>
                    @else
                        <span class="status-badge badge-unpaid">{{ $ar('غير مدفوعة') }}</span>
                    @endif
                </div>
            </td>
        </tr>
    </table>

    <!-- 2. CUSTOMER INFO TABLE (Zero-Overflow Table Layout) -->
    <table class="customer-box-table">
        <tr>
            <td colspan="2" class="box-title-cell">
                {{ $ar('بيانات العميل / المشتري') }}
            </td>
        </tr>
        <tr>
            <td class="customer-data-cell" style="width: 50%;">
                <strong>{{ $ar('الاسم / المنشأة:') }}</strong> {{ $ar($invoice->customer->name) }}
            </td>
            <td class="customer-data-cell" style="width: 50%;">
                <strong>{{ $ar('الرقم الضريبي:') }}</strong> {{ $invoice->customer->tax_number ?: $ar('غير متوفر') }}
            </td>
        </tr>
        <tr>
            <td class="customer-data-cell">
                <strong>{{ $ar('رقم الجوال:') }}</strong> {{ $invoice->customer->phone ?: '—' }}
            </td>
            <td class="customer-data-cell">
                <strong>{{ $ar('العنوان:') }}</strong> {{ $ar($invoice->customer->city . ($invoice->customer->address ? ' - ' . $invoice->customer->address : '')) }}
            </td>
        </tr>
    </table>

    <!-- 3. ITEMS TABLE (Fixed 100% Width) -->
    <table class="items-table">
        <thead>
            <tr>
                <th style="width: 4%;">#</th>
                <th style="width: 37%;">{{ $ar('المنتج / البيان') }}</th>
                <th style="width: 10%;">{{ $ar('الكمية') }}</th>
                <th style="width: 12%;">{{ $ar('سعر الوحدة') }}</th>
                <th style="width: 10%;">{{ $ar('الخصم') }}</th>
                <th style="width: 10%;">{{ $ar('الضريبة') }} ({{ $company->default_tax_rate }}%)</th>
                <th style="width: 16%;">{{ $ar('الإجمالي شامل الضريبة') }}</th>
            </tr>
        </thead>
        <tbody>
            @foreach($invoice->items as $index => $item)
                <tr>
                    <td>{{ $index + 1 }}</td>
                    <td class="desc-cell">
                        <strong>{{ $ar($item->product_name) }}</strong>
                        @if($item->barcode)
                            <div style="font-size: 8px; color: #64748b;">{{ $item->barcode }}</div>
                        @endif
                    </td>
                    <td>{{ number_format($item->quantity, 2) }} {{ $item->product && $item->product->unit ? $ar($item->product->unit->name) : '' }}</td>
                    <td>{{ number_format($item->unit_price, 2) }} {{ $ar('ر.س') }}</td>
                    <td>{{ $item->discount_amount > 0 ? number_format($item->discount_amount, 2) : '—' }}</td>
                    <td>{{ number_format($item->tax_amount, 2) }} {{ $ar('ر.س') }}</td>
                    <td><strong>{{ number_format($item->total, 2) }} {{ $ar('ر.س') }}</strong></td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <!-- 4. TOTALS, NOTES, AND CODES -->
    <table class="summary-table">
        <tr>
            <!-- Notes & Codes (Left column in LTR flow) -->
            <td class="notes-side">
                @if($invoice->notes)
                    <div style="background-color: #fffbeb; border: 1px solid #fef3c7; border-radius: 4px; padding: 5px 7px; margin-bottom: 5px;">
                        <strong style="color: #92400e; font-size: 9px;">{{ $ar('ملاحظات الفاتورة:') }}</strong>
                        <div style="font-size: 8.5px; color: #475569; margin-top: 1px;">{{ $ar($invoice->notes) }}</div>
                    </div>
                @endif

                @if($company->invoice_notes)
                    <div style="font-size: 8px; color: #64748b; margin-bottom: 6px;">
                        {{ $ar($company->invoice_notes) }}
                    </div>
                @endif

                <!-- Barcode & QR Table -->
                <table class="codes-table">
                    <tr>
                        @if(!empty($barcodeBase64))
                            <td style="width: 65%;">
                                <img src="{{ $barcodeBase64 }}" class="barcode-img" alt="Barcode" />
                                <div class="code-caption">{{ $invoice->invoice_number }}</div>
                            </td>
                        @endif
                        @if(!empty($qrCodeBase64))
                            <td style="width: 35%;">
                                <img src="{{ $qrCodeBase64 }}" class="qr-img" alt="QR Code" />
                                <div class="code-caption">{{ $ar('رمز التحقق الإلكتروني') }}</div>
                            </td>
                        @endif
                    </tr>
                </table>
            </td>

            <!-- Totals (Right column in LTR flow) -->
            <td class="totals-side">
                <table class="totals-table">
                    <tr>
                        <td class="tot-label">{{ $ar('المجموع قبل الضريبة') }}</td>
                        <td class="tot-value">{{ number_format($invoice->subtotal, 2) }} {{ $ar('ر.س') }}</td>
                    </tr>
                    @if($invoice->discount_amount > 0)
                        <tr>
                            <td class="tot-label">{{ $ar('مبلغ الخصم') }}</td>
                            <td class="tot-value">- {{ number_format($invoice->discount_amount, 2) }} {{ $ar('ر.س') }}</td>
                        </tr>
                    @endif
                    <tr>
                        <td class="tot-label">{{ $ar('ضريبة القيمة المضافة') }} ({{ $company->default_tax_rate }}%)</td>
                        <td class="tot-value">{{ number_format($invoice->tax_amount, 2) }} {{ $ar('ر.س') }}</td>
                    </tr>
                    <tr class="grand-row">
                        <td class="tot-label" style="color: #ffffff;">{{ $ar('الإجمالي النهائي المستحق') }}</td>
                        <td class="tot-value" style="color: #ffffff;">{{ number_format($invoice->total_amount, 2) }} {{ $ar('ر.س') }}</td>
                    </tr>
                    <tr>
                        <td class="tot-label">{{ $ar('المبلغ المدفوع') }}</td>
                        <td class="tot-value paid-text">{{ number_format($invoice->paid_amount, 2) }} {{ $ar('ر.س') }}</td>
                    </tr>
                    <tr>
                        <td class="tot-label" style="background-color: {{ $invoice->remaining_amount > 0 ? '#fee2e2' : '#f1f5f9' }};">
                            {{ $ar('المبلغ المتبقي') }}
                        </td>
                        <td class="tot-value {{ $invoice->remaining_amount > 0 ? 'due-text' : 'paid-text' }}">
                            {{ number_format($invoice->remaining_amount, 2) }} {{ $ar('ر.س') }}
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>

    <!-- 5. SIGNATURES -->
    <table class="sig-table">
        <tr>
            <td class="sig-cell-right">
                <div class="sig-line">{{ $ar('توقيع المستلم (العميل)') }}</div>
            </td>
            <td class="sig-cell-left">
                <div class="sig-line" style="margin-left: auto; text-align: left;">{{ $ar('ختم وتوقيع المنشأة البائعة') }}</div>
            </td>
        </tr>
    </table>

    <!-- 6. FOOTER -->
    <div class="footer-bar">
        {{ $ar('تم إصدار هذه الفاتورة الضريبية عبر نظام سَنَد لإدارة الفواتير والمبيعات') }} &mdash; {{ date('Y') }}
    </div>

</body>
</html>