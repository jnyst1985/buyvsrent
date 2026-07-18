const SYMBOL_LOCALE: Record<string, string> = {
  USD: 'en-US',
  EUR: 'de-DE',
  GBP: 'en-GB',
  CAD: 'en-CA',
  AUD: 'en-AU',
  JPY: 'ja-JP',
  CNY: 'zh-CN',
  INR: 'en-IN',
};

export function formatCurrency(value: number, currency = 'USD'): string {
  const locale = SYMBOL_LOCALE[currency] ?? 'en-US';
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(Math.round(value));
}

/** Compact form for chart axes and tight UI: $1.2M, $450K, ¥1,200万 handled via compact notation. */
export function formatCompact(value: number, currency = 'USD'): string {
  const locale = SYMBOL_LOCALE[currency] ?? 'en-US';
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value);
}

export function formatPercent(value: number, digits = 1): string {
  return `${value.toFixed(digits)}%`;
}

/** Plain number with thousands separators (for inputs display). */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(value);
}
