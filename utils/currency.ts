// Currency utility functions

interface CurrencyInfo {
  code: string;
  symbol: string;
  name: string;
}

export const currencies: CurrencyInfo[] = [
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' },
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham' },
];

export function getCurrencySymbol(currencyCode: string): string {
  const currency = currencies.find(c => c.code === currencyCode);
  return currency ? currency.symbol : '₹'; // Default to INR symbol
}

export function formatCurrency(amount: number, currencyCode: string): string {
  const symbol = getCurrencySymbol(currencyCode);
  return `${symbol}${amount.toFixed(2)}`;
}
