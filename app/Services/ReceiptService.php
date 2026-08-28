<?php

namespace App\Services;

use App\Models\Payment;
use App\Models\ReceiptVoucher;
use Illuminate\Support\Facades\DB;

class ReceiptService
{
    protected NumberGeneratorService $numberGenerator;

    public function __construct(NumberGeneratorService $numberGenerator)
    {
        $this->numberGenerator = $numberGenerator;
    }

    /**
     * Create receipt voucher automatically from a payment
     */
    public function createFromPayment(Payment $payment): ReceiptVoucher
    {
        return DB::transaction(function () use ($payment) {
            $voucherNumber = $this->numberGenerator->generateReceiptNumber();
            $amountInWords = $this->amountToArabicWords((float) $payment->amount);

            $description = "سداد دفعة عن الفاتورة رقم " . ($payment->invoice ? $payment->invoice->invoice_number : '—');
            if ($payment->notes) {
                $description .= ' - ' . $payment->notes;
            }

            return ReceiptVoucher::create([
                'voucher_number'  => $voucherNumber,
                'customer_id'     => $payment->customer_id,
                'invoice_id'      => $payment->invoice_id,
                'payment_id'      => $payment->id,
                'amount'          => $payment->amount,
                'payment_method'  => $payment->payment_method,
                'voucher_date'    => $payment->payment_date,
                'amount_in_words' => $amountInWords,
                'reference'       => $payment->reference,
                'description'     => $description,
                'created_by'      => $payment->created_by ?? auth()->id(),
            ]);
        });
    }

    /**
     * Convert decimal amount to Arabic words (Tafqeet)
     */
    public function amountToArabicWords(float $amount, string $currency = 'ريال سعودي', string $subCurrency = 'هللة'): string
    {
        $integerPart = (int) floor($amount);
        $fractionPart = (int) round(($amount - $integerPart) * 100);

        $words = $this->numberToWordsArabic($integerPart) . ' ' . $currency;

        if ($fractionPart > 0) {
            $words .= ' و ' . $this->numberToWordsArabic($fractionPart) . ' ' . $subCurrency;
        }

        return 'فقط ' . $words . ' لا غير';
    }

    private function numberToWordsArabic(int $number): string
    {
        if ($number === 0) {
            return 'صفر';
        }

        $ones = ['', 'واحد', 'اثنان', 'ثلاثة', 'أربعة', 'خمسة', 'ستة', 'سبعة', 'ثمانية', 'تسعة', 'عشرة', 'أحد عشر', 'اثنا عشر', 'ثلاثة عشر', 'أربعة عشر', 'خمسة عشر', 'ستة عشر', 'سبعة عشر', 'ثمانية عشر', 'تسعة عشر'];
        $tens = ['', '', 'عشرون', 'ثلاثون', 'أربعون', 'خمسون', 'ستون', 'سبعون', 'ثمانون', 'تسعون'];
        $hundreds = ['', 'مائة', 'مائتان', 'ثلاثمائة', 'أربعمائة', 'خمسمائة', 'ستمائة', 'سبعمائة', 'ثمانمائة', 'تسعمائة'];

        if ($number < 20) {
            return $ones[$number];
        }

        if ($number < 100) {
            $rem = $number % 10;
            return ($rem > 0 ? $ones[$rem] . ' و ' : '') . $tens[(int)($number / 10)];
        }

        if ($number < 1000) {
            $h = (int)($number / 100);
            $rem = $number % 100;
            return $hundreds[$h] . ($rem > 0 ? ' و ' . $this->numberToWordsArabic($rem) : '');
        }

        if ($number < 1000000) {
            $th = (int)($number / 1000);
            $rem = $number % 1000;
            
            $thWord = match ($th) {
                1 => 'ألف',
                2 => 'ألفان',
                3, 4, 5, 6, 7, 8, 9, 10 => $this->numberToWordsArabic($th) . ' آلاف',
                default => $this->numberToWordsArabic($th) . ' ألفاً',
            };

            return $thWord . ($rem > 0 ? ' و ' . $this->numberToWordsArabic($rem) : '');
        }

        if ($number < 1000000000) {
            $mil = (int)($number / 1000000);
            $rem = $number % 1000000;

            $milWord = match ($mil) {
                1 => 'مليون',
                2 => 'مليونان',
                3, 4, 5, 6, 7, 8, 9, 10 => $this->numberToWordsArabic($mil) . ' ملايين',
                default => $this->numberToWordsArabic($mil) . ' مليوناً',
            };

            return $milWord . ($rem > 0 ? ' و ' . $this->numberToWordsArabic($rem) : '');
        }

        return (string) $number;
    }
}
