// Currency symbols and formats for different countries
const CURRENCY_FORMATS: Record<string, { symbol: string; code: string; locale: string }> = {
  IN: { symbol: '₹', code: 'INR', locale: 'en-IN' },
  PK: { symbol: '₨', code: 'PKR', locale: 'en-PK' },
  US: { symbol: '$', code: 'USD', locale: 'en-US' },
  GB: { symbol: '£', code: 'GBP', locale: 'en-GB' },
  AE: { symbol: 'د.إ', code: 'AED', locale: 'ar-AE' },
  SA: { symbol: '﷼', code: 'SAR', locale: 'ar-SA' },
  SG: { symbol: 'S$', code: 'SGD', locale: 'en-SG' },
  AU: { symbol: 'A$', code: 'AUD', locale: 'en-AU' },
  CA: { symbol: 'C$', code: 'CAD', locale: 'en-CA' },
  EU: { symbol: '€', code: 'EUR', locale: 'en-EU' },
};

// Default currency format (USD)
const DEFAULT_CURRENCY = CURRENCY_FORMATS.US;

/**
 * Format a number as currency based on country code
 * @param amount The amount to format
 * @param countryCode The country code (e.g., 'IN', 'PK', 'US')
 * @param options Additional formatting options
 * @returns Formatted currency string
 */
export function formatCurrency(
  amount: number,
  countryCode: string = 'US',
  options: {
    showSymbol?: boolean;
    showCode?: boolean;
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
  } = {}
): string {
  const {
    showSymbol = true,
    showCode = false,
    minimumFractionDigits = 0,
    maximumFractionDigits = 2,
  } = options;

  const currencyFormat = CURRENCY_FORMATS[countryCode] || DEFAULT_CURRENCY;

  try {
    const formattedAmount = new Intl.NumberFormat(currencyFormat.locale, {
      style: 'currency',
      currency: currencyFormat.code,
      minimumFractionDigits,
      maximumFractionDigits,
    }).format(amount);

    // If we don't want to show the symbol, remove it
    if (!showSymbol) {
      return formattedAmount.replace(currencyFormat.symbol, '').trim();
    }

    // If we want to show the code, add it
    if (showCode) {
      return `${formattedAmount} ${currencyFormat.code}`;
    }

    return formattedAmount;
  } catch (error) {
    console.error('Error formatting currency:', error);
    // Fallback to simple formatting
    return `${currencyFormat.symbol}${amount.toFixed(maximumFractionDigits)}`;
  }
}

/**
 * Get currency information for a country
 * @param countryCode The country code
 * @returns Currency information including symbol and code
 */
export function getCurrencyInfo(countryCode: string = 'US') {
  return CURRENCY_FORMATS[countryCode] || DEFAULT_CURRENCY;
}

/**
 * Parse a currency string to a number
 * @param currencyString The currency string to parse
 * @param countryCode The country code
 * @returns The parsed number
 */
export function parseCurrency(currencyString: string, countryCode: string = 'US'): number {
  const currencyFormat = CURRENCY_FORMATS[countryCode] || DEFAULT_CURRENCY;
  
  // Remove currency symbol and any non-numeric characters except decimal point
  const numericString = currencyString
    .replace(currencyFormat.symbol, '')
    .replace(/[^\d.-]/g, '')
    .trim();

  return parseFloat(numericString) || 0;
} 