<!DOCTYPE html>
<html>
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>{{ $customer->name }}</title>
    <style>
        @page { margin: 12mm 15mm; size: a4 portrait; }
        body { font-family: 'dejavu sans', Arial, sans-serif; font-size: 11px; color: #1e293b; line-height: 1.4; background: #fff; }
        .header-table { width: 100%; border-bottom: 2px solid #1B4B6B; padding-bottom: 8px; margin-bottom: 12px; }
        .company-name { font-size: 15px; font-weight: bold; color: #1B4B6B; }
        .statement-title { font-size: 17px; font-weight: bold; color: #C8922A; text-align: left; }
        .summary-box { background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 6px; padding: 8px; margin-bottom: 12px; }
        .table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
        .table th { background-color: #1B4B6B; color: white; padding: 6px 5px; font-size: 10px; text-align: center; border: 1px solid #1B4B6B; }
        .table td { padding: 5px; border: 1px solid #e2e8f0; font-size: 9.5px; text-align: center; }
        .table td.text-right { text-align: right; }
        .table tr:nth-child(even) td { background-color: #f8fafc; }
        .footer { margin-top: 15px; border-top: 1px solid #e2e8f0; padding-top: 6px; text-align: center; font-size: 8.5px; color: #94a3b8; }
    </style>
</head>
<body>

    <table class="header-table">
        <tr>
            <td style="width: 50%;">
                <div class="company-name">{{ $ar($company->name ?? 'مؤسسة سَنَد للتجارة') }}</div>
                @if($company->tax_number) <div style="font-size:10px; color:#475569;">{{ $ar('الرقم الضريبي:') }} {{ $company->tax_number }}</div> @endif
                @if($company->phone) <div style="font-size:10px; color:#475569;">{{ $ar('هاتف:') }} {{ $company->phone }}</div> @endif
            </td>
            <td style="width: 50%; text-align: left;">
                <div class="statement-title">{{ $ar('كشف حساب عميل') }}</div>
                <div style="font-size:10px;">{{ $ar('العميل:') }} <strong>{{ $ar($customer->name) }}</strong></div>
                <div style="font-size:9.5px; color:#64748b;">{{ $ar('الفترة: من') }} {{ $from_date ?: 'البداية' }} {{ $ar('إلى') }} {{ $to_date ?: date('Y-m-d') }}</div>
            </td>
        </tr>
    </table>

    <div class="summary-box">
        <table style="width: 100%; text-align: center; font-size: 10px;">
            <tr>
                <td>{{ $ar('الرصيد السابق:') }} <strong>{{ number_format($opening_balance, 2) }} {{ $ar('ر.س') }}</strong></td>
                <td>{{ $ar('إجمالي المبيعات:') }} <strong>{{ number_format($period_sales, 2) }} {{ $ar('ر.س') }}</strong></td>
                <td>{{ $ar('إجمالي المسدد:') }} <strong>{{ number_format($period_paid, 2) }} {{ $ar('ر.س') }}</strong></td>
                <td>{{ $ar('الرصيد النهائي المستحق:') }} <strong style="color: {{ $closing_balance > 0 ? '#b91c1c' : '#15803d' }};">{{ number_format($closing_balance, 2) }} {{ $ar('ر.س') }}</strong></td>
            </tr>
        </table>
    </div>

    <table class="table">
        <thead>
            <tr>
                <th style="width: 12%;">{{ $ar('التاريخ') }}</th>
                <th style="width: 15%;">{{ $ar('المرجع') }}</th>
                <th style="width: 33%;">{{ $ar('البيان / الحركة') }}</th>
                <th style="width: 13%;">{{ $ar('مدين (+)') }}</th>
                <th style="width: 13%;">{{ $ar('دائن (-)') }}</th>
                <th style="width: 14%;">{{ $ar('الرصيد التراكمي') }}</th>
            </tr>
        </thead>
        <tbody>
            @foreach($transactions as $m)
                <tr>
                    <td>{{ $m['date'] }}</td>
                    <td>{{ $m['reference'] }}</td>
                    <td class="text-right">{{ $ar($m['description']) }}</td>
                    <td>{{ $m['debit'] > 0 ? number_format($m['debit'], 2) : '—' }}</td>
                    <td>{{ $m['credit'] > 0 ? number_format($m['credit'], 2) : '—' }}</td>
                    <td><strong>{{ number_format($m['balance'], 2) }}</strong></td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <div class="footer">
        {{ $ar('تم إصدار كشف الحساب عبر نظام سَنَد') }} | SANAD &mdash; {{ date('Y') }}
    </div>

</body>
</html>
