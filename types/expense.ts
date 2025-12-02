export type ExpenseCategory = 
  | 'Food' 
  | 'Travel' 
  | 'Bills' 
  | 'Shopping' 
  | 'Entertainment' 
  | 'Healthcare' 
  | 'Other';

export interface Expense {
  id: string;
  amount: number;
  storeName: string;
  category: ExpenseCategory;
  date: string;
  notes?: string;
  receiptImage?: string;
  createdAt: string;
}

export interface MonthlyData {
  month: string;
  total: number;
  byCategory: Record<ExpenseCategory, number>;
}
