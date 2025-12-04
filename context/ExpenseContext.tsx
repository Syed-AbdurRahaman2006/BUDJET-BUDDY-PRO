import { Expense, ExpenseCategory, MonthlyData } from '@/types/expense';
import { storageUtils } from '@/utils/storage';
import createContextHook from '@nkzw/create-context-hook';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from './AuthContext';

export const [ExpenseProvider, useExpenses] = createContextHook(() => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<ExpenseCategory | 'All'>('All');

  // Query configuration with proper refetch settings
  const expensesQuery = useQuery({
    queryKey: ['expenses', user?.id],
    queryFn: () => storageUtils.getExpenses(user?.id),
    enabled: !!user?.id,
    staleTime: 0, // Always refetch to ensure fresh data
    refetchOnMount: true, // Refetch when component mounts
    refetchOnWindowFocus: false, // Don't refetch on window focus (mobile app)
  });

  // Refetch expenses when user changes (login/logout)
  useEffect(() => {
    if (user?.id) {
      // User logged in - refetch their data
      queryClient.invalidateQueries({ queryKey: ['expenses', user.id] });
    } else {
      // User logged out - clear all expense queries
      queryClient.removeQueries({ queryKey: ['expenses'] });
    }
  }, [user?.id, queryClient]);

  const addExpenseMutation = useMutation({
    mutationFn: async (expense: Omit<Expense, 'id' | 'createdAt'>) => {
      if (!user?.id) throw new Error('User not authenticated');
      const expenses = expensesQuery.data || [];
      const newExpense: Expense = {
        ...expense,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
      };
      const updated = [newExpense, ...expenses];
      await storageUtils.saveExpenses(updated, user.id);
      return updated;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['expenses', user?.id], data);
    },
  });

  const updateExpenseMutation = useMutation({
    mutationFn: async (expense: Expense) => {
      if (!user?.id) throw new Error('User not authenticated');
      const expenses = expensesQuery.data || [];
      const updated = expenses.map(e => e.id === expense.id ? expense : e);
      await storageUtils.saveExpenses(updated, user.id);
      return updated;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['expenses', user?.id], data);
    },
  });

  const deleteExpenseMutation = useMutation({
    mutationFn: async (expenseId: string) => {
      if (!user?.id) throw new Error('User not authenticated');
      const expenses = expensesQuery.data || [];
      const updated = expenses.filter(e => e.id !== expenseId);
      await storageUtils.saveExpenses(updated, user.id);
      return updated;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['expenses', user?.id], data);
    },
  });

  const filteredExpenses = useCallback(() => {
    const expenses = expensesQuery.data || [];
    if (selectedCategory === 'All') {
      return expenses;
    }
    return expenses.filter(e => e.category === selectedCategory);
  }, [expensesQuery.data, selectedCategory]);

  const getMonthlyData = useCallback((): MonthlyData[] => {
    const expenses = expensesQuery.data || [];
    const monthlyMap = new Map<string, MonthlyData>();

    expenses.forEach(expense => {
      const monthKey = expense.date.substring(0, 7);

      if (!monthlyMap.has(monthKey)) {
        monthlyMap.set(monthKey, {
          month: monthKey,
          total: 0,
          byCategory: {
            Food: 0,
            Travel: 0,
            Bills: 0,
            Shopping: 0,
            Entertainment: 0,
            Healthcare: 0,
            Other: 0,
          },
        });
      }

      const monthData = monthlyMap.get(monthKey)!;
      monthData.total += expense.amount;
      monthData.byCategory[expense.category] += expense.amount;
    });

    return Array.from(monthlyMap.values()).sort((a, b) =>
      b.month.localeCompare(a.month)
    );
  }, [expensesQuery.data]);

  const getCurrentMonthTotal = useCallback(() => {
    const expenses = expensesQuery.data || [];
    const currentMonth = new Date().toISOString().substring(0, 7);
    return expenses
      .filter(e => e.date.substring(0, 7) === currentMonth)
      .reduce((sum, e) => sum + e.amount, 0);
  }, [expensesQuery.data]);

  return useMemo(() => ({
    expenses: expensesQuery.data || [],
    isLoading: expensesQuery.isLoading,
    error: expensesQuery.error,
    addExpense: addExpenseMutation.mutate,
    updateExpense: updateExpenseMutation.mutate,
    deleteExpense: deleteExpenseMutation.mutate,
    isAdding: addExpenseMutation.isPending,
    isUpdating: updateExpenseMutation.isPending,
    isDeleting: deleteExpenseMutation.isPending,
    filteredExpenses,
    selectedCategory,
    setSelectedCategory,
    getMonthlyData,
    getCurrentMonthTotal,
  }), [
    expensesQuery.data,
    expensesQuery.isLoading,
    expensesQuery.error,
    addExpenseMutation.mutate,
    addExpenseMutation.isPending,
    updateExpenseMutation.mutate,
    updateExpenseMutation.isPending,
    deleteExpenseMutation.mutate,
    deleteExpenseMutation.isPending,
    filteredExpenses,
    selectedCategory,
    setSelectedCategory,
    getMonthlyData,
    getCurrentMonthTotal,
  ]);
});
