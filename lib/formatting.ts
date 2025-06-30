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