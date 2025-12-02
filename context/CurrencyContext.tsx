import { Currency, DEFAULT_CURRENCY, formatCurrency as formatCurrencyUtil } from '@/utils/currency';
import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useMemo, useState } from 'react';

const CURRENCY_STORAGE_KEY = '@budget_buddy_currency';

export const [CurrencyProvider, useCurrency] = createContextHook(() => {
    const [selectedCurrency, setSelectedCurrency] = useState<Currency>(DEFAULT_CURRENCY);
    const [isLoading, setIsLoading] = useState(true);

    // Load saved currency on mount
    useEffect(() => {
        const loadCurrency = async () => {
            try {
                const saved = await AsyncStorage.getItem(CURRENCY_STORAGE_KEY);
                if (saved && saved !== '') {
                    setSelectedCurrency(saved as Currency);
                }
            } catch (error) {
                console.error('Failed to load currency preference:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadCurrency();
    }, []);

    // Save currency when it changes
    const setCurrency = useCallback(async (currency: Currency) => {
        try {
            await AsyncStorage.setItem(CURRENCY_STORAGE_KEY, currency);
            setSelectedCurrency(currency);
        } catch (error) {
            console.error('Failed to save currency preference:', error);
        }
    }, []);

    // Format currency using the selected currency
    const formatCurrency = useCallback((amount: number, showDecimals: boolean = true) => {
        return formatCurrencyUtil(amount, selectedCurrency, showDecimals);
    }, [selectedCurrency]);

    return useMemo(() => ({
        currency: selectedCurrency,
        setCurrency,
        formatCurrency,
        isLoading,
    }), [selectedCurrency, setCurrency, formatCurrency, isLoading]);
});
