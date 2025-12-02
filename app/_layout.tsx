import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { CurrencyProvider } from '../context/CurrencyContext';
import { ExpenseProvider } from '../context/ExpenseContext';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: '#10B981',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: '600' as const,
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
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <CurrencyProvider>
        <ExpenseProvider>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <RootLayoutNav />
          </GestureHandlerRootView>
        </ExpenseProvider>
      </CurrencyProvider>
    </QueryClientProvider>
  );
}
