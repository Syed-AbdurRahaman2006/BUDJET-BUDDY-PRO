import AsyncStorage from '@react-native-async-storage/async-storage';
import { Expense } from '@/types/expense';

const EXPENSES_KEY = '@budget_buddy_expenses';

export const storageUtils = {
  async getExpenses(): Promise<Expense[]> {
    try {
      const data = await AsyncStorage.getItem(EXPENSES_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading expenses:', error);
      return [];
    }
  },

  async saveExpenses(expenses: Expense[]): Promise<void> {
    try {
      await AsyncStorage.setItem(EXPENSES_KEY, JSON.stringify(expenses));
    } catch (error) {
      console.error('Error saving expenses:', error);
      throw error;
    }
  },
};
