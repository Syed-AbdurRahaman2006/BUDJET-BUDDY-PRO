import { DarkColors, LightColors } from '@/constants/colors';
import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';

type ThemeType = 'light' | 'dark' | 'system';

const THEME_STORAGE_KEY = '@budget_buddy_theme';

export const [ThemeProvider, useTheme] = createContextHook(() => {
    const systemColorScheme = useColorScheme();
    const [themePreference, setThemePreference] = useState<ThemeType>('system');
    const [isLoaded, setIsLoaded] = useState(false);

    // Load saved theme preference
    useEffect(() => {
        const loadTheme = async () => {
            try {
                const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
                if (savedTheme) {
                    setThemePreference(savedTheme as ThemeType);
                }
            } catch (error) {
                console.error('Failed to load theme:', error);
            } finally {
                setIsLoaded(true);
            }
        };
        loadTheme();
    }, []);

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
            setThemePreference(newTheme);
            await AsyncStorage.setItem(THEME_STORAGE_KEY, newTheme);
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
