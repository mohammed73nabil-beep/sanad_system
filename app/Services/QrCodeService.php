<?php

namespace App\Services;

use App\Models\CompanySetting;
use App\Models\Invoice;
use Endroid\QrCode\QrCode;
use Endroid\QrCode\Writer\PngWriter;
use Throwable;

class QrCodeService
{
    /**
     * Generate QR payload for an invoice.
     * Generates ZATCA-compatible TLV Base64 payload.
     */
    public function generateForInvoice(Invoice $invoice): string
    {
        $settings = CompanySetting::getOrCreate();
        $sellerName = $settings->name ?? 'SANAD';
        $vatNumber = $settings->tax_number ?? '';
        $timestamp = $invoice->created_at ? $invoice->created_at->toIso8601String() : now()->toIso8601String();
        $invoiceTotal = number_format((float) $invoice->total_amount, 2, '.', '');
        $vatTotal = number_format((float) $invoice->tax_amount, 2, '.', '');

        // Generate ZATCA Phase 1 standard TLV (Tag-Length-Value) format
        return $this->toTlvBase64([
            1 => $sellerName,
            2 => $vatNumber,
            3 => $timestamp,
            4 => $invoiceTotal,
            5 => $vatTotal,
        ]);
    }

    /**
     * Generate base64 PNG data URI of the QR code image for PDF/HTML display.
     */
    public function generatePngBase64(Invoice $invoice): string
    {
        try {
            $tlvString = $this->generateForInvoice($invoice);
            $qrCode = new QrCode($tlvString);
            $writer = new PngWriter();
            $result = $writer->write($qrCode);
            return $result->getDataUri();
        } catch (Throwable $e) {
            return '';
        }
    }

    /**
     * Encode array of tags into TLV Base64 string (ZATCA specification standard)
     */
    protected function toTlvBase64(array $tags): string
    {
        $tlv = '';
        foreach ($tags as $tag => $value) {
            $value = (string) $value;
            $length = strlen($value);
            $tlv .= pack('C', $tag) . pack('C', $length) . $value;
        }
        return base64_encode($tlv);
    }
}
