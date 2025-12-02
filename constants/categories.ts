import { ExpenseCategory } from '@/types/expense';

export const CATEGORIES: ExpenseCategory[] = [
  'Food',
  'Travel',
  'Bills',
  'Shopping',
  'Entertainment',
  'Healthcare',
  'Other',
];

export const CATEGORY_COLORS: Record<ExpenseCategory, string> = {
  Food: '#FF6B6B',
  Travel: '#4ECDC4',
  Bills: '#45B7D1',
  Shopping: '#FFA07A',
  Entertainment: '#98D8C8',
  Healthcare: '#F7B731',
  Other: '#95A5A6',
};

export const CATEGORY_KEYWORDS: Record<ExpenseCategory, string[]> = {
  Food: ['restaurant', 'cafe', 'food', 'pizza', 'burger', 'coffee', 'grocery', 'supermarket'],
  Travel: ['uber', 'lyft', 'taxi', 'gas', 'fuel', 'hotel', 'flight', 'airline'],
  Bills: ['electric', 'water', 'internet', 'phone', 'utility', 'rent', 'insurance'],
  Shopping: ['amazon', 'mall', 'store', 'shop', 'clothing', 'shoes'],
  Entertainment: ['cinema', 'movie', 'netflix', 'spotify', 'game', 'concert'],
  Healthcare: ['pharmacy', 'hospital', 'doctor', 'clinic', 'medical'],
  Other: [],
};
