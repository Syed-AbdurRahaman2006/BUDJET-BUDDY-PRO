import { AuthProvider } from '@/context/AuthContext';
import { CurrencyProvider } from '@/context/CurrencyContext';
import { ExpenseProvider } from '@/context/ExpenseContext';
import { ThemeProvider, useTheme } from '@/context/ThemeContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  const { colors, isDark } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.cardBackground,
        },
        headerTintColor: colors.text,
        headerTitleStyle: {
          fontWeight: '600' as const,
          color: colors.text,
        },
        headerShadowVisible: false,
        contentStyle: {
          backgroundColor: colors.background,
        },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'Budget Buddy Pro',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="camera"
        options={{
          title: 'Scan Receipt',
          presentation: 'fullScreenModal',
        }}
      />
      <Stack.Screen
        name="add-expense"
        options={{
          title: 'Add Expense',
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="monthly-report"
        options={{
          title: 'Monthly Report',
        }}
      />
      <Stack.Screen
        name="profile"
        options={{
          title: 'Settings',
        }}
      />
      <Stack.Screen
        name="sign-in"
        options={{
          title: 'Sign In',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="sign-up"
        options={{
          title: 'Sign Up',
          headerShown: false,
        }}
      />
    </Stack>
  );
}



export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CurrencyProvider>
          <ExpenseProvider>
            <ThemeProvider>
              <GestureHandlerRootView style={{ flex: 1 }}>
                <RootLayoutNav />
              </GestureHandlerRootView>
            </ThemeProvider>
          </ExpenseProvider>
        </CurrencyProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
