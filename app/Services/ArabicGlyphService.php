<?php

namespace App\Services;

class ArabicGlyphService
{
    /**
     * Arabic letters and their forms: [Isolated, Final, Initial, Medial]
     */
    protected static array $glyphs = [
        // Hamza
        0x0621 => [0xFE80, 0xFE80, 0xFE80, 0xFE80], // ء
        0x0622 => [0xFE81, 0xFE82, 0xFE81, 0xFE82], // آ
        0x0623 => [0xFE83, 0xFE84, 0xFE83, 0xFE84], // أ
        0x0624 => [0xFE85, 0xFE86, 0xFE85, 0xFE86], // ؤ
        0x0625 => [0xFE87, 0xFE88, 0xFE87, 0xFE88], // إ
        0x0626 => [0xFE89, 0xFE8A, 0xFE8B, 0xFE8C], // ئ
        0x0627 => [0xFE8D, 0xFE8E, 0xFE8D, 0xFE8E], // ا
        0x0628 => [0xFE8F, 0xFE90, 0xFE91, 0xFE92], // ب
        0x0629 => [0xFE93, 0xFE94, 0xFE93, 0xFE94], // ة
        0x062A => [0xFE95, 0xFE96, 0xFE97, 0xFE98], // ت
        0x062B => [0xFE99, 0xFE9A, 0xFE9B, 0xFE9C], // ث
        0x062C => [0xFE9D, 0xFE9E, 0xFE9F, 0xFEA0], // ج
        0x062D => [0xFEA1, 0xFEA2, 0xFEA3, 0xFEA4], // ح
        0x062E => [0xFEA5, 0xFEA6, 0xFEA7, 0xFEA8], // خ
        0x062F => [0xFEA9, 0xFEAA, 0xFEA9, 0xFEAA], // د
        0x0630 => [0xFEAB, 0xFEAC, 0xFEAB, 0xFEAC], // ذ
        0x0631 => [0xFEAD, 0xFEAE, 0xFEAD, 0xFEAE], // ر
        0x0632 => [0xFEAF, 0xFEB0, 0xFEAF, 0xFEB0], // ز
        0x0633 => [0xFEB1, 0xFEB2, 0xFEB3, 0xFEB4], // س
        0x0634 => [0xFEB5, 0xFEB6, 0xFEB7, 0xFEB8], // ش
        0x0635 => [0xFEB9, 0xFEBA, 0xFEBB, 0xFEBC], // ص
        0x0636 => [0xFEBD, 0xFEBE, 0xFEBF, 0xFEC0], // ض
        0x0637 => [0xFEC1, 0xFEC2, 0xFEC3, 0xFEC4], // ط
        0x0638 => [0xFEC5, 0xFEC6, 0xFEC7, 0xFEC8], // ظ
        0x0639 => [0xFEC9, 0xFECA, 0xFECB, 0xFECC], // ع
        0x063A => [0xFECD, 0xFECE, 0xFECF, 0xFED0], // غ
        0x0641 => [0xFED1, 0xFED2, 0xFED3, 0xFED4], // ف
        0x0642 => [0xFED5, 0xFED6, 0xFED7, 0xFED8], // ق
        0x0643 => [0xFED9, 0xFEDA, 0xFEDB, 0xFEDC], // ك
        0x0644 => [0xFEDD, 0xFEDE, 0xFEDF, 0xFEE0], // ل
        0x0645 => [0xFEE1, 0xFEE2, 0xFEE3, 0xFEE4], // م
        0x0646 => [0xFEE5, 0xFEE6, 0xFEE7, 0xFEE8], // ن
        0x0647 => [0xFEE9, 0xFEEA, 0xFEEB, 0xFEEC], // ه
        0x0648 => [0xFEED, 0xFEEE, 0xFEED, 0xFEEE], // و
        0x0649 => [0xFEEF, 0xFEF0, 0xFEEF, 0xFEF0], // ى
        0x064A => [0xFEF1, 0xFEF2, 0xFEF3, 0xFEF4], // ي
    ];

    /**
     * Letters that only connect to the right (never to the left).
     */
    protected static array $rightOnly = [
        0x0621, // ء
        0x0622, // آ
        0x0623, // أ
        0x0624, // ؤ
        0x0625, // إ
        0x0627, // ا
        0x0629, // ة
        0x062F, // د
        0x0630, // ذ
        0x0631, // ر
        0x0632, // ز
        0x0648, // و
        0x0649, // ى
    ];

    /**
     * Shape and reverse Arabic text for PDF engines without HarfBuzz.
     */
    public static function shape(?string $text): string
    {
        if (empty($text)) {
            return '';
        }

        // Split text by lines
        $lines = preg_split('/\r\n|\r|\n/', $text);
        $shapedLines = [];

        foreach ($lines as $line) {
            $shapedLines[] = self::shapeLine($line);
        }

        return implode("\n", $shapedLines);
    }

    /**
     * Shape a single line of mixed text (Arabic + English + numbers).
     */
    protected static function shapeLine(string $line): string
    {
        if (trim($line) === '') {
            return '';
        }

        // Tokenize line into segments (Arabic words, Numbers/English words, spaces, punctuation)
        preg_match_all('/[\x{0600}-\x{06FF}\x{0750}-\x{077F}\x{FB50}-\x{FDFF}\x{FE70}-\x{FEFF}]+|[a-zA-Z0-9\.\,\:\-\+\%\(\)\#\/]+|\s+|[^\s\w]/u', $line, $matches);
        
        $tokens = $matches[0] ?? [$line];
        $shapedTokens = [];

        foreach ($tokens as $token) {
            if (self::isArabic($token)) {
                $shapedTokens[] = self::shapeArabicWord($token);
            } elseif ($token === '(') {
                $shapedTokens[] = ')';
            } elseif ($token === ')') {
                $shapedTokens[] = '(';
            } elseif ($token === '[') {
                $shapedTokens[] = ']';
            } elseif ($token === ']') {
                $shapedTokens[] = '[';
            } elseif ($token === '{') {
                $shapedTokens[] = '}';
            } elseif ($token === '}') {
                $shapedTokens[] = '{';
            } elseif ($token === '«') {
                $shapedTokens[] = '»';
            } elseif ($token === '»') {
                $shapedTokens[] = '«';
            } else {
                $shapedTokens[] = $token;
            }
        }

        // For visual PDF RTL display: reverse the token stream so right-to-left reads correctly
        // while keeping numbers & English in LTR order!
        return implode('', array_reverse($shapedTokens));
    }

    /**
     * Check if a token contains Arabic characters.
     */
    protected static function isArabic(string $token): bool
    {
        return (bool) preg_match('/[\x{0600}-\x{06FF}]/u', $token);
    }

    /**
     * Shape an Arabic word: replace nominal characters with joined glyph forms and reverse letters.
     */
    protected static function shapeArabicWord(string $word): string
    {
        // Decode UTF-8 string to unicode code points
        $chars = self::utf8ToCodePoints($word);
        $len = count($chars);
        $shaped = [];

        for ($i = 0; $i < $len; $i++) {
            $curr = $chars[$i];

            // Handle Lam-Alef ligatures
            if ($curr === 0x0644 && $i + 1 < $len) {
                $next = $chars[$i + 1];
                $prev = $i > 0 ? $chars[$i - 1] : null;
                $prevConnects = $prev !== null && isset(self::$glyphs[$prev]) && !in_array($prev, self::$rightOnly, true);

                $ligature = null;
                if ($next === 0x0622) { // ل + آ
                    $ligature = $prevConnects ? 0xFEF6 : 0xFEF5;
                } elseif ($next === 0x0623) { // ل + أ
                    $ligature = $prevConnects ? 0xFEF8 : 0xFEF7;
                } elseif ($next === 0x0625) { // ل + إ
                    $ligature = $prevConnects ? 0xFEFA : 0xFEF9;
                } elseif ($next === 0x0627) { // ل + ا
                    $ligature = $prevConnects ? 0xFEFC : 0xFEFB;
                }

                if ($ligature !== null) {
                    $shaped[] = $ligature;
                    $i++; // skip next alef
                    continue;
                }
            }

            if (!isset(self::$glyphs[$curr])) {
                $shaped[] = $curr;
                continue;
            }

            $prev = $i > 0 ? $chars[$i - 1] : null;
            $next = $i + 1 < $len ? $chars[$i + 1] : null;

            $prevConnects = $prev !== null && isset(self::$glyphs[$prev]) && !in_array($prev, self::$rightOnly, true);
            $isRightOnly = in_array($curr, self::$rightOnly, true);
            $nextConnects = !$isRightOnly && $next !== null && isset(self::$glyphs[$next]);

            // Determine form: 0 = Isolated, 1 = Final, 2 = Initial, 3 = Medial
            if ($prevConnects && $nextConnects) {
                $form = 3; // Medial
            } elseif ($prevConnects) {
                $form = 1; // Final
            } elseif ($nextConnects) {
                $form = 2; // Initial
            } else {
                $form = 0; // Isolated
            }

            $glyphCode = self::$glyphs[$curr][$form] ?? $curr;
            $shaped[] = $glyphCode;
        }

        // Reverse shaped Arabic characters for visual LTR stream
        $reversed = array_reverse($shaped);

        return self::codePointsToUtf8($reversed);
    }

    /**
     * Convert UTF-8 string to array of code points.
     */
    protected static function utf8ToCodePoints(string $str): array
    {
        $codePoints = [];
        $len = strlen($str);
        for ($i = 0; $i < $len;) {
            $byte = ord($str[$i]);
            if ($byte <= 0x7F) {
                $codePoints[] = $byte;
                $i += 1;
            } elseif ($byte >= 0xC0 && $byte <= 0xDF) {
                $codePoints[] = (($byte & 0x1F) << 6) | (ord($str[$i + 1]) & 0x3F);
                $i += 2;
            } elseif ($byte >= 0xE0 && $byte <= 0xEF) {
                $codePoints[] = (($byte & 0x0F) << 12) | ((ord($str[$i + 1]) & 0x3F) << 6) | (ord($str[$i + 2]) & 0x3F);
                $i += 3;
            } elseif ($byte >= 0xF0 && $byte <= 0xF7) {
                $codePoints[] = (($byte & 0x07) << 18) | ((ord($str[$i + 1]) & 0x3F) << 12) | ((ord($str[$i + 2]) & 0x3F) << 6) | (ord($str[$i + 3]) & 0x3F);
                $i += 4;
            } else {
                $i += 1;
            }
        }
        return $codePoints;
    }

    /**
     * Convert array of code points back to UTF-8 string.
     */
    protected static function codePointsToUtf8(array $codePoints): string
    {
        $str = '';
        foreach ($codePoints as $cp) {
            if ($cp <= 0x7F) {
                $str .= chr($cp);
            } elseif ($cp <= 0x7FF) {
                $str .= chr(0xC0 | ($cp >> 6)) . chr(0x80 | ($cp & 0x3F));
            } elseif ($cp <= 0xFFFF) {
                $str .= chr(0xE0 | ($cp >> 12)) . chr(0x80 | (($cp >> 6) & 0x3F)) . chr(0x80 | ($cp & 0x3F));
            } else {
                $str .= chr(0xF0 | ($cp >> 18)) . chr(0x80 | (($cp >> 12) & 0x3F)) . chr(0x80 | (($cp >> 6) & 0x3F)) . chr(0x80 | ($cp & 0x3F));
            }
        }
        return $str;
    }
}
