import { Currency, DEFAULT_CURRENCY, formatCurrency as formatCurrencyUtil } from '@/utils/currency';
import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from './AuthContext';

const CURRENCY_KEY_PREFIX = '@budget_buddy_currency_';

export const [CurrencyProvider, useCurrency] = createContextHook(() => {
    const { user } = useAuth();
    const [selectedCurrency, setSelectedCurrency] = useState<Currency>(DEFAULT_CURRENCY);
    const [isLoading, setIsLoading] = useState(true);

    // Get user-specific storage key
    const getCurrencyKey = useCallback((userId?: string) => {
        return `${CURRENCY_KEY_PREFIX}${userId || 'default'}`;
    }, []);

    // Load saved currency when user changes
    useEffect(() => {
        const loadCurrency = async () => {
            try {
                setIsLoading(true);
                if (!user?.id) {
                    setSelectedCurrency(DEFAULT_CURRENCY);
                    return;
                }

                const key = getCurrencyKey(user.id);
                const saved = await AsyncStorage.getItem(key);
                if (saved && saved !== '') {
                    setSelectedCurrency(saved as Currency);
                } else {
                    setSelectedCurrency(DEFAULT_CURRENCY);
                }
            } catch (error) {
                console.error('Failed to load currency preference:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadCurrency();
    }, [user?.id, getCurrencyKey]);

    // Save currency when it changes
    const setCurrency = useCallback(async (currency: Currency) => {
        try {
            if (!user?.id) return;

            const key = getCurrencyKey(user.id);
            await AsyncStorage.setItem(key, currency);
            setSelectedCurrency(currency);
        } catch (error) {
            console.error('Failed to save currency preference:', error);
        }
    }, [user?.id, getCurrencyKey]);

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
