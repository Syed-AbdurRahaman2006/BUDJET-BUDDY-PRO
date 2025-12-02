import createContextHook from '@nkzw/create-context-hook';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useCallback, useMemo } from 'react';
import { Expense, ExpenseCategory, MonthlyData } from '@/types/expense';
import { storageUtils } from '@/utils/storage';

export const [ExpenseProvider, useExpenses] = createContextHook(() => {
  const queryClient = useQueryClient();
  const [selectedCategory, setSelectedCategory] = useState<ExpenseCategory | 'All'>('All');

  const expensesQuery = useQuery({
    queryKey: ['expenses'],
    queryFn: storageUtils.getExpenses,
  });

  const addExpenseMutation = useMutation({
    mutationFn: async (expense: Omit<Expense, 'id' | 'createdAt'>) => {
      const expenses = expensesQuery.data || [];
      const newExpense: Expense = {
        ...expense,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
      };
      const updated = [newExpense, ...expenses];
      await storageUtils.saveExpenses(updated);
      return updated;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['expenses'], data);
    },
  });

  const updateExpenseMutation = useMutation({
    mutationFn: async (expense: Expense) => {
      const expenses = expensesQuery.data || [];
      const updated = expenses.map(e => e.id === expense.id ? expense : e);
      await storageUtils.saveExpenses(updated);
      return updated;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['expenses'], data);
    },
  });

  const deleteExpenseMutation = useMutation({
    mutationFn: async (expenseId: string) => {
      const expenses = expensesQuery.data || [];
      const updated = expenses.filter(e => e.id !== expenseId);
      await storageUtils.saveExpenses(updated);
      return updated;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['expenses'], data);
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
