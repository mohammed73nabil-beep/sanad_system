<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="utf-8">
    <title>طباعة فاتورة - {{ $invoice->invoice_number }}</title>
    <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&display=swap" rel="stylesheet">
    <style>
        body {
            font-family: 'Cairo', sans-serif;
            direction: rtl;
            background-color: #f1f4f7;
            margin: 0;
            padding: 20px;
            color: #1e293b;
        }
        .page {
            max-width: 800px;
            margin: 0 auto;
            background: #ffffff;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
        }
        .no-print-bar {
            max-width: 800px;
            margin: 0 auto 20px auto;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .btn-print {
            background-color: #1B4B6B;
            color: white;
            padding: 8px 18px;
            border: none;
            border-radius: 6px;
            font-family: 'Cairo', sans-serif;
            font-size: 14px;
            font-weight: bold;
            cursor: pointer;
        }
        .btn-back {
            background-color: #ffffff;
            color: #475569;
            padding: 8px 18px;
            border: 1px solid #cbd5e1;
            border-radius: 6px;
            text-decoration: none;
            font-size: 14px;
            font-weight: 600;
        }
        .header {
            display: flex;
            justify-content: space-between;
            border-bottom: 2px solid #1B4B6B;
            padding-bottom: 15px;
            margin-bottom: 20px;
        }
        .company-title {
            font-size: 22px;
            font-weight: 800;
            color: #1B4B6B;
        }
        .invoice-badge {
            font-size: 20px;
            font-weight: 800;
            color: #C8922A;
            text-align: left;
        }
        .grid-2 {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 20px;
        }
        .card-box {
            background-color: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            padding: 12px 16px;
        }
        .card-box h4 {
            margin: 0 0 8px 0;
            color: #1B4B6B;
            font-size: 14px;
            border-bottom: 1px solid #e2e8f0;
            padding-bottom: 6px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        th {
            background-color: #1B4B6B;
            color: white;
            padding: 8px 10px;
            font-size: 13px;
            font-weight: 700;
            text-align: center;
        }
        td {
            padding: 8px 10px;
            border: 1px solid #e2e8f0;
            font-size: 13px;
            text-align: center;
        }
        td.text-right { text-align: right; }
        .totals-table {
            width: 320px;
            margin-right: auto;
        }
        .totals-table td {
            padding: 6px 12px;
            font-size: 13px;
        }
        .totals-table .label {
            background-color: #f8fafc;
            font-weight: bold;
            color: #475569;
            text-align: right;
        }
        .totals-table .amount {
            text-align: left;
            font-weight: bold;
        }
        .grand-row {
            background-color: #1B4B6B !important;
            color: white !important;
        }
        .grand-row td {
            color: white !important;
            font-size: 15px !important;
        }
        @media print {
            body { background: white; padding: 0; }
            .page { box-shadow: none; padding: 0; max-width: 100%; }
            .no-print { display: none !important; }
        }
    </style>
</head>
<body>

    <div class="no-print-bar no-print">
        <a href="javascript:window.history.back()" class="btn-back">← العودة للنظام</a>
        <button onclick="window.print()" class="btn-print">🖨️ طباعة الفاتورة (A4)</button>
    </div>

    <div class="page">
        <div class="header">
            <div>
                <div class="company-title">{{ $company->name ?? 'سَنَد للتجارة' }}</div>
                @if($company->tax_number)
                    <div style="font-size: 13px; margin-top: 4px;">الرقم الضريبي: <strong>{{ $company->tax_number }}</strong></div>
                @endif
                @if($company->commercial_register)
                    <div style="font-size: 13px;">س.ت: {{ $company->commercial_register }}</div>
                @endif
                <div style="font-size: 13px;">{{ $company->city }} {{ $company->address ? ' - ' . $company->address : '' }}</div>
                @if($company->phone)
                    <div style="font-size: 13px;">هاتف: {{ $company->phone }}</div>
                @endif
            </div>
            <div style="text-align: left;">
                <div class="invoice-badge">فاتورة ضريبية</div>
                <div style="font-size: 15px; font-weight: bold; color: #1B4B6B; margin-top: 4px;">{{ $invoice->invoice_number }}</div>
                <div style="font-size: 13px; margin-top: 4px;">تاريخ الإصدار: {{ $invoice->issue_date->format('Y-m-d') }}</div>
                @if($invoice->due_date)
                    <div style="font-size: 13px;">تاريخ الاستحقاق: {{ $invoice->due_date->format('Y-m-d') }}</div>
                @endif
            </div>
        </div>

        <div class="card-box" style="margin-bottom: 20px;">
            <h4>بيانات العميل / المشتري</h4>
            <div style="display: flex; justify-content: space-between; font-size: 13px;">
                <div><strong>الاسم / المحل:</strong> {{ $invoice->customer->name }}</div>
                <div><strong>الرقم الضريبي:</strong> {{ $invoice->customer->tax_number ?: '—' }}</div>
                <div><strong>الجوال:</strong> {{ $invoice->customer->phone ?: '—' }}</div>
            </div>
        </div>

        <table>
            <thead>
                <tr>
                    <th style="width: 5%;">#</th>
                    <th style="width: 40%; text-align: right;">المنتج</th>
                    <th style="width: 12%;">الكمية</th>
                    <th style="width: 13%;">السعر</th>
                    <th style="width: 10%;">الخصم</th>
                    <th style="width: 20%;">الإجمالي شامل الضريبة</th>
                </tr>
            </thead>
            <tbody>
                @foreach($invoice->items as $idx => $item)
                    <tr>
                        <td>{{ $idx + 1 }}</td>
                        <td class="text-right">
                            <strong>{{ $item->product_name }}</strong>
                            @if($item->barcode)
                                <span style="font-size: 11px; color: #64748b;">({{ $item->barcode }})</span>
                            @endif
                        </td>
                        <td>{{ number_format($item->quantity, 2) }}</td>
                        <td>{{ number_format($item->unit_price, 2) }} ر.س</td>
                        <td>{{ $item->discount_amount > 0 ? number_format($item->discount_amount, 2) . ' ر.س' : '—' }}</td>
                        <td><strong>{{ number_format($item->total, 2) }} ر.س</strong></td>
                    </tr>
                @endforeach
            </tbody>
        </table>

        <div style="display: flex; justify-content: space-between;">
            <div style="width: 45%;">
                @if($invoice->notes)
                    <div class="card-box">
                        <strong style="color: #1B4B6B; font-size: 13px;">ملاحظات:</strong>
                        <p style="margin: 4px 0 0 0; font-size: 12px; color: #475569;">{{ $invoice->notes }}</p>
                    </div>
                @endif
            </div>
            <div>
                <table class="totals-table">
                    <tr>
                        <td class="label">المجموع الفرعي</td>
                        <td class="amount">{{ number_format($invoice->subtotal, 2) }} ر.س</td>
                    </tr>
                    @if($invoice->discount_amount > 0)
                        <tr>
                            <td class="label">الخصم</td>
                            <td class="amount">-{{ number_format($invoice->discount_amount, 2) }} ر.س</td>
                        </tr>
                    @endif
                    <tr>
                        <td class="label">ضريبة القيمة المضافة</td>
                        <td class="amount">{{ number_format($invoice->tax_amount, 2) }} ر.س</td>
                    </tr>
                    <tr class="grand-row">
                        <td class="label" style="background-color: #1B4B6B;">الإجمالي النهائي</td>
                        <td class="amount">{{ number_format($invoice->total_amount, 2) }} ر.س</td>
                    </tr>
                    <tr>
                        <td class="label">المدفوع</td>
                        <td class="amount" style="color: #16a34a;">{{ number_format($invoice->paid_amount, 2) }} ر.س</td>
                    </tr>
                    <tr>
                        <td class="label">المتبقي</td>
                        <td class="amount" style="color: {{ $invoice->remaining_amount > 0 ? '#dc2626' : '#16a34a' }};">
                            {{ number_format($invoice->remaining_amount, 2) }} ر.س
                        </td>
                    </tr>
                </table>
            </div>
        </div>

        <div style="text-align: center; margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 10px; font-size: 12px; color: #94a3b8;">
            نظام سَنَد | SANAD — إدارة فواتيرك ومبيعاتك بسهولة
        </div>
    </div>

</body>
</html>
