import { DarkColors, LightColors } from '@/constants/colors';
import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';
import { useAuth } from './AuthContext';

type ThemeType = 'light' | 'dark' | 'system';

const THEME_KEY_PREFIX = '@budget_buddy_theme_';

export const [ThemeProvider, useTheme] = createContextHook(() => {
    const systemColorScheme = useColorScheme();
    const { user } = useAuth();
    const [themePreference, setThemePreference] = useState<ThemeType>('system');
    const [isLoaded, setIsLoaded] = useState(false);

    // Get user-specific storage key
    const getThemeKey = useCallback((userId?: string) => {
        return `${THEME_KEY_PREFIX}${userId || 'default'}`;
    }, []);

    // Load saved theme preference when user changes
    useEffect(() => {
        const loadTheme = async () => {
            try {
                setIsLoaded(false);
                if (!user?.id) {
                    setThemePreference('system');
                    return;
                }

                const key = getThemeKey(user.id);
                const savedTheme = await AsyncStorage.getItem(key);
                if (savedTheme) {
                    setThemePreference(savedTheme as ThemeType);
                } else {
                    setThemePreference('system');
                }
            } catch (error) {
                console.error('Failed to load theme:', error);
            } finally {
                setIsLoaded(true);
            }
        };
        loadTheme();
    }, [user?.id, getThemeKey]);

    // Determine active theme
    const activeTheme = useMemo(() => {
        if (themePreference === 'system') {
            return systemColorScheme === 'dark' ? 'dark' : 'light';
        }
        return themePreference;
    }, [themePreference, systemColorScheme]);

    // Get current colors
    const colors = useMemo(() => {
        return activeTheme === 'dark' ? DarkColors : LightColors;
    }, [activeTheme]);

    // Update theme preference
    const setTheme = async (newTheme: ThemeType) => {
        try {
            if (!user?.id) return;

            setThemePreference(newTheme);
            const key = getThemeKey(user.id);
            await AsyncStorage.setItem(key, newTheme);
        } catch (error) {
            console.error('Failed to save theme:', error);
        }
    };

    return useMemo(() => ({
        theme: themePreference,
        activeTheme,
        colors,
        setTheme,
        isLoaded,
        isDark: activeTheme === 'dark',
    }), [themePreference, activeTheme, colors, isLoaded]);
});
