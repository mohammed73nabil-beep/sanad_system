<!DOCTYPE html>
<html>
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>{{ $ar('ملف المحاسب والإقرار الضريبي') }}</title>
    <style>
        @page { margin: 10mm 12mm; size: a4 portrait; }
        body { font-family: 'dejavu sans', Arial, sans-serif; font-size: 10px; color: #1e293b; line-height: 1.4; background: #fff; }
        .header-table { width: 100%; border-bottom: 2px solid #1B4B6B; padding-bottom: 8px; margin-bottom: 10px; }
        .company-name { font-size: 15px; font-weight: bold; color: #1B4B6B; }
        .report-title { font-size: 16px; font-weight: bold; color: #C8922A; text-align: left; }
        .section-title { font-size: 11px; font-weight: bold; color: #1B4B6B; margin: 10px 0 5px 0; border-bottom: 1px solid #cbd5e1; padding-bottom: 3px; }
        .tax-table { width: 100%; border-collapse: collapse; margin-bottom: 10px; }
        .tax-table td { padding: 6px; border: 1px solid #cbd5e1; text-align: center; }
        .tax-table th { background-color: #1B4B6B; color: #fff; padding: 6px; font-size: 10px; border: 1px solid #1B4B6B; }
        .table { width: 100%; border-collapse: collapse; margin-bottom: 10px; }
        .table th { background-color: #f1f5f9; color: #1e293b; padding: 5px; font-size: 9.5px; border: 1px solid #cbd5e1; text-align: center; }
        .table td { padding: 4px; border: 1px solid #e2e8f0; font-size: 9px; text-align: center; }
        .footer { margin-top: 15px; border-top: 1px solid #e2e8f0; padding-top: 4px; text-align: center; font-size: 8px; color: #94a3b8; }
    </style>
</head>
<body>

    <table class="header-table">
        <tr>
            <td style="width: 50%;">
                <div class="company-name">{{ $ar($company->name ?? 'مؤسسة سَنَد للتجارة') }}</div>
                @if($company->tax_number) <div style="font-size:9.5px; color:#475569;">{{ $ar('الرقم الضريبي:') }} {{ $company->tax_number }}</div> @endif
            </td>
            <td style="width: 50%; text-align: left;">
                <div class="report-title">{{ $ar('ملف المحاسب والإقرار الضريبي') }}</div>
                <div style="font-size:9px; color:#64748b;">{{ $ar('الفترة: من') }} {{ $from_date ?: 'البداية' }} {{ $ar('إلى') }} {{ $to_date ?: date('Y-m-d') }}</div>
            </td>
        </tr>
    </table>

    <div class="section-title">{{ $ar('1. ملخص ضريبة القيمة المضافة (VAT Breakdown)') }}</div>
    <table class="tax-table">
        <thead>
            <tr>
                <th>{{ $ar('البيان') }}</th>
                <th>{{ $ar('المبلغ الخاضع للضريبة') }}</th>
                <th>{{ $ar('مبلغ الضريبة') }}</th>
                <th>{{ $ar('الإجمالي شامل الضريبة') }}</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td><strong>{{ $ar('المبيعات (ضريبة المخرجات)') }}</strong></td>
                <td>{{ number_format($tax['sales_taxable'], 2) }} {{ $ar('ر.س') }}</td>
                <td style="color:#0284c7; font-weight:bold;">{{ number_format($tax['sales_tax'], 2) }} {{ $ar('ر.س') }}</td>
                <td>{{ number_format($tax['sales_total'], 2) }} {{ $ar('ر.س') }}</td>
            </tr>
            <tr>
                <td><strong>{{ $ar('المشتريات (ضريبة المدخلات)') }}</strong></td>
                <td>{{ number_format($tax['purchases_taxable'], 2) }} {{ $ar('ر.س') }}</td>
                <td style="color:#4338ca; font-weight:bold;">{{ number_format($tax['purchases_tax'], 2) }} {{ $ar('ر.س') }}</td>
                <td>{{ number_format($tax['purchases_total'], 2) }} {{ $ar('ر.س') }}</td>
            </tr>
            <tr style="background-color:#f8fafc;">
                <td colspan="2"><strong>{{ $ar('صافي الضريبة المستحقة للهيئة (الفارق):') }}</strong></td>
                <td colspan="2" style="font-size:12px; font-weight:bold; color:#b45309;">
                    {{ number_format($tax['net_tax_due'], 2) }} {{ $ar('ر.س') }}
                </td>
            </tr>
        </tbody>
    </table>

    <div class="section-title">{{ $ar('2. فواتير المبيعات الصادرة خلال الفترة') }} ({{ $sales['count'] }})</div>
    <table class="table">
        <thead>
            <tr>
                <th>{{ $ar('رقم الفاتورة') }}</th>
                <th>{{ $ar('العميل') }}</th>
                <th>{{ $ar('التاريخ') }}</th>
                <th>{{ $ar('المجموع') }}</th>
                <th>{{ $ar('الضريبة') }}</th>
                <th>{{ $ar('الإجمالي') }}</th>
                <th>{{ $ar('المدفوع') }}</th>
                <th>{{ $ar('المتبقي') }}</th>
            </tr>
        </thead>
        <tbody>
            @foreach($sales['invoices'] as $inv)
                <tr>
                    <td>{{ $inv->invoice_number }}</td>
                    <td>{{ $ar($inv->customer ? $inv->customer->name : '—') }}</td>
                    <td>{{ $inv->issue_date->format('Y-m-d') }}</td>
                    <td>{{ number_format($inv->subtotal, 2) }}</td>
                    <td>{{ number_format($inv->tax_amount, 2) }}</td>
                    <td><strong>{{ number_format($inv->total_amount, 2) }}</strong></td>
                    <td>{{ number_format($inv->paid_amount, 2) }}</td>
                    <td>{{ number_format($inv->remaining_amount, 2) }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <div class="footer">
        {{ $ar('تم تصدير ملف المحاسب عبر نظام سَنَد') }} | SANAD &mdash; {{ date('Y') }}
    </div>

</body>
</html>
