// Currency types and utilities
export type Currency = 'INR' | 'USD' | 'EUR' | 'GBP' | 'AED' | 'JPY' | 'CNY';

export interface CurrencyInfo {
    code: Currency;
    symbol: string;
    name: string;
    locale: string;
}

export const CURRENCIES: Record<Currency, CurrencyInfo> = {
    INR: {
        code: 'INR',
        symbol: '₹',
        name: 'Indian Rupee',
        locale: 'en-IN',
    },
    USD: {
        code: 'USD',
        symbol: '$',
        name: 'US Dollar',
        locale: 'en-US',
    },
    EUR: {
        code: 'EUR',
        symbol: '€',
        name: 'Euro',
        locale: 'de-DE',
    },
    GBP: {
        code: 'GBP',
        symbol: '£',
        name: 'British Pound',
        locale: 'en-GB',
    },
    AED: {
        code: 'AED',
        symbol: 'د.إ',
        name: 'UAE Dirham',
        locale: 'ar-AE',
    },
    JPY: {
        code: 'JPY',
        symbol: '¥',
        name: 'Japanese Yen',
        locale: 'ja-JP',
    },
    CNY: {
        code: 'CNY',
        symbol: '¥',
        name: 'Chinese Yuan',
        locale: 'zh-CN',
    },
};

export const DEFAULT_CURRENCY: Currency = 'INR';

/**
 * Format an amount with the given currency
 * @param amount - The numeric amount to format
 * @param currency - The currency code
 * @param showDecimals - Whether to show decimal places (default: true)
 * @returns Formatted currency string (e.g., "₹100.00", "$50.00")
 */
export function formatCurrency(
    amount: number,
    currency: Currency = DEFAULT_CURRENCY,
    showDecimals: boolean = true
): string {
    const currencyInfo = CURRENCIES[currency];
    const formattedAmount = showDecimals
        ? amount.toFixed(2)
        : amount.toFixed(0);

    return `${currencyInfo.symbol}${formattedAmount}`;
}

/**
 * Get all available currencies as an array
 */
export function getAvailableCurrencies(): CurrencyInfo[] {
    return Object.values(CURRENCIES);
}
