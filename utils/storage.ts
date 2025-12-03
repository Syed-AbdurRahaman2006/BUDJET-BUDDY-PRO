import { Expense } from '@/types/expense';
import AsyncStorage from '@react-native-async-storage/async-storage';

const EXPENSES_KEY_PREFIX = '@budget_buddy_expenses_';

// Get user-specific storage key
const getExpensesKey = (userId: string) => `${EXPENSES_KEY_PREFIX}${userId}`;

export const storageUtils = {
  async getExpenses(userId?: string): Promise<Expense[]> {
    try {
      if (!userId) {
        console.warn('No user ID provided for getExpenses');
        return [];
      }
      const key = getExpensesKey(userId);
      const data = await AsyncStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading expenses:', error);
      return [];
    }
  },

  async saveExpenses(expenses: Expense[], userId?: string): Promise<void> {
    try {
      if (!userId) {
        console.warn('No user ID provided for saveExpenses');
        return;
      }
      const key = getExpensesKey(userId);
      await AsyncStorage.setItem(key, JSON.stringify(expenses));
    } catch (error) {
      console.error('Error saving expenses:', error);
      throw error;
    }
  },
};
