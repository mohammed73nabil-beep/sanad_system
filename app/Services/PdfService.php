<?php

namespace App\Services;

use App\Models\CompanySetting;
use App\Models\Invoice;
use App\Models\ReceiptVoucher;
use Barryvdh\DomPDF\Facade\Pdf;
use Picqer\Barcode\BarcodeGeneratorPNG;

class PdfService
{
    /**
     * Generate base64 barcode image for invoice number.
     */
    public function generateBarcode(string $text): string
    {
        try {
            $generator = new BarcodeGeneratorPNG();
            $png = $generator->getBarcode($text, BarcodeGeneratorPNG::TYPE_CODE_128, 2, 44);
            return 'data:image/png;base64,' . base64_encode($png);
        } catch (\Throwable $e) {
            return '';
        }
    }

    /**
     * Generate Invoice PDF with Arabic Glyphs & ZATCA Barcodes
     */
    public function generateInvoicePdf(Invoice $invoice)
    {
        $invoice->load(['customer', 'items.product.unit', 'payments']);
        $company = CompanySetting::getOrCreate();
        $barcodeBase64 = $this->generateBarcode($invoice->invoice_number);

        $qrService = app(QrCodeService::class);
        $qrCodeBase64 = $qrService->generatePngBase64($invoice);

        // Prepare shaped Arabic data for DomPDF
        $ar = function ($text) {
            return ArabicGlyphService::shape($text);
        };

        $data = [
            'invoice'       => $invoice,
            'company'       => $company,
            'barcodeBase64' => $barcodeBase64,
            'qrCodeBase64'  => $qrCodeBase64,
            'ar'            => $ar,
        ];

        return Pdf::loadView('pdf.invoice', $data)
            ->setPaper('a4', 'portrait')
            ->setOption([
                'isRemoteEnabled'         => false,
                'isHtml5ParserEnabled'    => true,
                'defaultFont'             => 'dejavu sans',
                'isFontSubsettingEnabled' => true,
                'dpi'                     => 96,
            ]);
    }

    /**
     * Generate Receipt Voucher PDF
     */
    public function generateReceiptVoucherPdf(ReceiptVoucher $voucher)
    {
        $voucher->load(['customer', 'invoice', 'payment']);
        $company = CompanySetting::getOrCreate();

        $ar = function ($text) {
            return ArabicGlyphService::shape($text);
        };

        $data = [
            'voucher' => $voucher,
            'company' => $company,
            'ar'      => $ar,
        ];

        return Pdf::loadView('pdf.receipt_voucher', $data)
            ->setPaper('a4', 'portrait')
            ->setOption([
                'isRemoteEnabled'      => false,
                'isHtml5ParserEnabled' => true,
                'defaultFont'          => 'dejavu sans',
                'dpi'                  => 96,
            ]);
    }

    /**
     * Generate Customer Statement of Account PDF
     */
    public function generateCustomerStatementPdf(array $statementData)
    {
        $company = CompanySetting::getOrCreate();
        $statementData['company'] = $company;

        $ar = function ($text) {
            return ArabicGlyphService::shape($text);
        };
        $statementData['ar'] = $ar;

        return Pdf::loadView('pdf.customer_statement', $statementData)
            ->setPaper('a4', 'portrait')
            ->setOption([
                'isRemoteEnabled'      => false,
                'isHtml5ParserEnabled' => true,
                'defaultFont'          => 'dejavu sans',
                'dpi'                  => 96,
            ]);
    }

    /**
     * Generate Accountant Tax & Financial Report PDF
     */
    public function generateAccountantReportPdf(array $reportData)
    {
        $company = CompanySetting::getOrCreate();
        $reportData['company'] = $company;

        $ar = function ($text) {
            return ArabicGlyphService::shape($text);
        };
        $reportData['ar'] = $ar;

        return Pdf::loadView('pdf.accountant_report', $reportData)
            ->setPaper('a4', 'portrait')
            ->setOption([
                'isRemoteEnabled'      => false,
                'isHtml5ParserEnabled' => true,
                'defaultFont'          => 'dejavu sans',
                'dpi'                  => 96,
            ]);
    }
}
