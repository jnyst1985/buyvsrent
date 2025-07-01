// Utility functions for consistent formatting across server and client

export const formatCurrency = (value: number, currency: string): string => {
  // Always use 'en-US' locale to ensure consistent formatting
  // between server and client rendering
  try {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
    return formatter.format(value);
  } catch (error) {
    // Fallback for unsupported currencies
    return `${currency} ${value.toLocaleString('en-US')}`;
  }
};

export const formatPercent = (value: number): string => {
  return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
};

export const formatNumber = (value: number): string => {
  // Use consistent locale for number formatting
  return value.toLocaleString('en-US');
};

export const formatCurrencyCompact = (value: number, currency: string): string => {
  try {
    const absValue = Math.abs(value);
    const isNegative = value < 0;
    
    let compactValue: number;
    let suffix: string;
    
    if (absValue >= 1000000000) {
      compactValue = absValue / 1000000000;
      suffix = 'B';
    } else if (absValue >= 1000000) {
      compactValue = absValue / 1000000;
      suffix = 'M';
    } else if (absValue >= 1000) {
      compactValue = absValue / 1000;
      suffix = 'K';
    } else {
      // For values under 1000, use regular formatting
      return formatCurrency(value, currency);
    }
    
    // Format to 1 decimal place if needed, otherwise whole number
    const formattedNumber = compactValue % 1 === 0 
      ? compactValue.toFixed(0) 
      : compactValue.toFixed(1);
    
    const sign = isNegative ? '-' : '';
    
    // Get currency symbol
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
    const currencySymbol = formatter.format(0).replace('0', '');
    
    return `${sign}${currencySymbol}${formattedNumber}${suffix}`;
  } catch (error) {
    // Fallback for unsupported currencies
    return formatCurrency(value, currency);
  }
};