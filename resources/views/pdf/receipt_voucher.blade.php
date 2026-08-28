<!DOCTYPE html>
<html>
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>{{ $voucher->voucher_number }}</title>
    <style>
        @page {
            margin: 12mm 15mm;
            size: a4 portrait;
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'dejavu sans', Arial, sans-serif;
            font-size: 11.5px;
            color: #1e293b;
            line-height: 1.5;
            background: #ffffff;
        }

        .voucher-border {
            border: 2px solid #1B4B6B;
            border-radius: 8px;
            padding: 16px 20px;
            background: #ffffff;
        }

        .header-table {
            width: 100%;
            border-bottom: 2px solid #C8922A;
            padding-bottom: 10px;
            margin-bottom: 15px;
        }

        .header-table td {
            vertical-align: top;
        }

        .logo-col {
            width: 25%;
            text-align: right;
        }

        .logo-img {
            max-width: 130px;
            max-height: 70px;
            object-fit: contain;
        }

        .company-col {
            width: 45%;
            text-align: right;
            padding-right: 10px;
        }

        .company-name {
            font-size: 15px;
            font-weight: bold;
            color: #1B4B6B;
            margin-bottom: 2px;
        }

        .company-detail {
            font-size: 10px;
            color: #475569;
        }

        .voucher-col {
            width: 30%;
            text-align: left;
        }

        .voucher-title {
            font-size: 18px;
            font-weight: bold;
            color: #C8922A;
            margin-bottom: 2px;
        }

        .voucher-num {
            font-size: 13px;
            font-weight: bold;
            color: #1B4B6B;
            margin-bottom: 3px;
        }

        .amount-box {
            background-color: #f8fafc;
            border: 2px solid #1B4B6B;
            border-radius: 6px;
            padding: 8px 14px;
            font-size: 14px;
            font-weight: bold;
            color: #1B4B6B;
            margin-bottom: 16px;
            text-align: left;
        }

        .details-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }

        .details-table td {
            padding: 8px 6px;
            border-bottom: 1px dashed #cbd5e1;
            font-size: 11.5px;
            text-align: right;
        }

        .details-table .label {
            font-weight: bold;
            color: #1B4B6B;
            width: 28%;
        }

        .details-table .value {
            color: #0f172a;
            width: 72%;
        }

        .signatures-table {
            width: 100%;
            margin-top: 30px;
            border-top: 1px solid #e2e8f0;
            padding-top: 15px;
        }

        .signature-box {
            text-align: center;
            width: 50%;
            font-size: 10.5px;
            color: #475569;
        }

        .signature-line {
            margin-top: 35px;
            border-top: 1px dotted #94a3b8;
            width: 60%;
            margin-left: auto;
            margin-right: auto;
        }

        .footer {
            margin-top: 20px;
            text-align: center;
            font-size: 9px;
            color: #94a3b8;
        }
    </style>
</head>
<body>

    <div class="voucher-border">
        <!-- Header -->
        <table class="header-table">
            <tr>
                <td class="logo-col">
                    @if($company->logo_path && file_exists(storage_path('app/public/' . $company->logo_path)))
                        <img src="{{ storage_path('app/public/' . $company->logo_path) }}" class="logo-img" alt="Logo" />
                    @else
                        <div style="width:65px; height:50px; background:#1B4B6B; color:#fff; font-weight:bold; font-size:18px; text-align:center; line-height:50px; border-radius:6px;">سَنَد</div>
                    @endif
                </td>
                <td class="company-col">
                    <div class="company-name">{{ $ar($company->name ?? 'مؤسسة سَنَد للتجارة') }}</div>
                    @if($company->tax_number)
                        <div class="company-detail">{{ $ar('الرقم الضريبي:') }} {{ $company->tax_number }}</div>
                    @endif
                    @if($company->phone)
                        <div class="company-detail">{{ $ar('هاتف:') }} {{ $company->phone }}</div>
                    @endif
                </td>
                <td class="voucher-col">
                    <div class="voucher-title">{{ $ar('سَنَد قَبْض') }}</div>
                    <div class="voucher-num">{{ $voucher->voucher_number }}</div>
                    <div style="font-size: 9.5px; color: #475569;">{{ $ar('التاريخ:') }} {{ $voucher->voucher_date->format('Y-m-d') }}</div>
                </td>
            </tr>
        </table>

        <!-- Amount Highlight -->
        <div class="amount-box">
            <span>{{ $ar('المبلغ المقبوض:') }} </span>
            <span style="font-size: 16px; color: #065f46;">{{ number_format($voucher->amount, 2) }} {{ $ar('ر.س') }}</span>
        </div>

        <!-- Details -->
        <table class="details-table">
            <tr>
                <td class="label">{{ $ar('استلمنا من المكرم / المنشأة:') }}</td>
                <td class="value"><strong>{{ $ar($voucher->customer->name) }}</strong></td>
            </tr>
            <tr>
                <td class="label">{{ $ar('المبلغ كتابةً (تفقيط):') }}</td>
                <td class="value"><strong>{{ $ar($voucher->amount_in_words ?? '') }}</strong></td>
            </tr>
            <tr>
                <td class="label">{{ $ar('طريقة الدفع:') }}</td>
                <td class="value">
                    {{ $ar($voucher->payment_method_name) }}
                    @if($voucher->reference)
                        ({{ $ar('رقم المرجع:') }} {{ $voucher->reference }})
                    @endif
                </td>
            </tr>
            @if($voucher->invoice)
                <tr>
                    <td class="label">{{ $ar('عن سداد الفاتورة:') }}</td>
                    <td class="value">
                        {{ $voucher->invoice->invoice_number }} 
                        ({{ $ar('إجمالي الفاتورة:') }} {{ number_format($voucher->invoice->total_amount, 2) }} {{ $ar('ر.س') }})
                    </td>
                </tr>
            @endif
            @if($voucher->description)
                <tr>
                    <td class="label">{{ $ar('البيان / ملاحظات:') }}</td>
                    <td class="value">{{ $ar($voucher->description) }}</td>
                </tr>
            @endif
        </table>

        <!-- Signatures -->
        <table class="signatures-table">
            <tr>
                <td class="signature-box">
                    <div><strong>{{ $ar('المستلم المسؤول') }}</strong></div>
                    <div style="font-size: 9.5px; color: #64748b; margin-top: 2px;">{{ $ar($voucher->creator->name ?? 'المحاسب') }}</div>
                    <div class="signature-line">{{ $ar('التوقيع') }}</div>
                </td>
                <td class="signature-box">
                    <div><strong>{{ $ar('توقيع المسلم (العميل)') }}</strong></div>
                    <div class="signature-line">{{ $ar('التوقيع') }}</div>
                </td>
            </tr>
        </table>

        <!-- Footer -->
        <div class="footer">
            {{ $ar('تم إصدار هذا السند عبر نظام سَنَد') }} | SANAD &mdash; {{ date('Y') }}
        </div>
    </div>

</body>
</html>
