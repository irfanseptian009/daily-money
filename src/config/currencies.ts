export interface CurrencyInfo {
  code: string;
  symbol: string;
  name: string;
  locale: string;
}

export const CURRENCIES: CurrencyInfo[] = [
  { code: "IDR", symbol: "Rp", name: "Indonesian Rupiah", locale: "id-ID" },
  { code: "USD", symbol: "$", name: "US Dollar", locale: "en-US" },
  { code: "EUR", symbol: "€", name: "Euro", locale: "de-DE" },
  { code: "GBP", symbol: "£", name: "British Pound", locale: "en-GB" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen", locale: "ja-JP" },
  { code: "KRW", symbol: "₩", name: "Korean Won", locale: "ko-KR" },
  { code: "CNY", symbol: "¥", name: "Chinese Yuan", locale: "zh-CN" },
  { code: "SGD", symbol: "S$", name: "Singapore Dollar", locale: "en-SG" },
  { code: "MYR", symbol: "RM", name: "Malaysian Ringgit", locale: "ms-MY" },
  { code: "THB", symbol: "฿", name: "Thai Baht", locale: "th-TH" },
  { code: "PHP", symbol: "₱", name: "Philippine Peso", locale: "en-PH" },
  { code: "VND", symbol: "₫", name: "Vietnamese Dong", locale: "vi-VN" },
  { code: "INR", symbol: "₹", name: "Indian Rupee", locale: "en-IN" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar", locale: "en-AU" },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar", locale: "en-CA" },
  { code: "CHF", symbol: "CHF", name: "Swiss Franc", locale: "de-CH" },
  { code: "HKD", symbol: "HK$", name: "Hong Kong Dollar", locale: "zh-HK" },
  { code: "TWD", symbol: "NT$", name: "Taiwan Dollar", locale: "zh-TW" },
  { code: "NZD", symbol: "NZ$", name: "New Zealand Dollar", locale: "en-NZ" },
  { code: "SEK", symbol: "kr", name: "Swedish Krona", locale: "sv-SE" },
  { code: "NOK", symbol: "kr", name: "Norwegian Krone", locale: "nb-NO" },
  { code: "DKK", symbol: "kr", name: "Danish Krone", locale: "da-DK" },
  { code: "PLN", symbol: "zł", name: "Polish Zloty", locale: "pl-PL" },
  { code: "CZK", symbol: "Kč", name: "Czech Koruna", locale: "cs-CZ" },
  { code: "HUF", symbol: "Ft", name: "Hungarian Forint", locale: "hu-HU" },
  { code: "TRY", symbol: "₺", name: "Turkish Lira", locale: "tr-TR" },
  { code: "ZAR", symbol: "R", name: "South African Rand", locale: "en-ZA" },
  { code: "BRL", symbol: "R$", name: "Brazilian Real", locale: "pt-BR" },
  { code: "MXN", symbol: "MX$", name: "Mexican Peso", locale: "es-MX" },
  { code: "ARS", symbol: "AR$", name: "Argentine Peso", locale: "es-AR" },
  { code: "CLP", symbol: "CL$", name: "Chilean Peso", locale: "es-CL" },
  { code: "COP", symbol: "COL$", name: "Colombian Peso", locale: "es-CO" },
  { code: "PEN", symbol: "S/", name: "Peruvian Sol", locale: "es-PE" },
  { code: "AED", symbol: "د.إ", name: "UAE Dirham", locale: "ar-AE" },
  { code: "SAR", symbol: "﷼", name: "Saudi Riyal", locale: "ar-SA" },
  { code: "QAR", symbol: "﷼", name: "Qatari Riyal", locale: "ar-QA" },
  { code: "KWD", symbol: "د.ك", name: "Kuwaiti Dinar", locale: "ar-KW" },
  { code: "EGP", symbol: "E£", name: "Egyptian Pound", locale: "ar-EG" },
  { code: "NGN", symbol: "₦", name: "Nigerian Naira", locale: "en-NG" },
  { code: "KES", symbol: "KSh", name: "Kenyan Shilling", locale: "en-KE" },
  { code: "RUB", symbol: "₽", name: "Russian Ruble", locale: "ru-RU" },
  { code: "UAH", symbol: "₴", name: "Ukrainian Hryvnia", locale: "uk-UA" },
  { code: "RON", symbol: "lei", name: "Romanian Leu", locale: "ro-RO" },
  { code: "BGN", symbol: "лв", name: "Bulgarian Lev", locale: "bg-BG" },
  { code: "HRK", symbol: "kn", name: "Croatian Kuna", locale: "hr-HR" },
  { code: "ISK", symbol: "kr", name: "Icelandic Krona", locale: "is-IS" },
  { code: "PKR", symbol: "₨", name: "Pakistani Rupee", locale: "ur-PK" },
  { code: "BDT", symbol: "৳", name: "Bangladeshi Taka", locale: "bn-BD" },
  { code: "LKR", symbol: "Rs", name: "Sri Lankan Rupee", locale: "si-LK" },
  { code: "MMK", symbol: "K", name: "Myanmar Kyat", locale: "my-MM" },
];

export const getCurrencyByCode = (code: string): CurrencyInfo => {
  return CURRENCIES.find((c) => c.code === code) || CURRENCIES[0];
};

export const formatCurrency = (
  amount: number,
  currencyCode: string = "IDR"
): string => {
  const currency = getCurrencyByCode(currencyCode);
  try {
    return new Intl.NumberFormat(currency.locale, {
      style: "currency",
      currency: currency.code,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${currency.symbol}${amount.toLocaleString()}`;
  }
};
