import { ExpenseCategory } from '@/types/expense';
import { Briefcase, Coffee, CreditCard, Heart, Plane, ShoppingBag, Ticket } from 'lucide-react-native';

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
  Food: '#FF9800',      // Orange
  Travel: '#E91E63',    // Pink
  Bills: '#2196F3',     // Blue
  Shopping: '#9C27B0',  // Purple
  Entertainment: '#FFEB3B', // Yellow
  Healthcare: '#F44336', // Red
  Other: '#9E9E9E',     // Gray
};

export const CATEGORY_ICONS: Record<ExpenseCategory, any> = {
  Food: Coffee,
  Travel: Plane,
  Bills: CreditCard,
  Shopping: ShoppingBag,
  Entertainment: Ticket,
  Healthcare: Heart,
  Other: Briefcase,
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
