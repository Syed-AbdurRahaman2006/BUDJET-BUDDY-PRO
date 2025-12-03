import { useCurrency } from '@/context/CurrencyContext';
import { useTheme } from '@/context/ThemeContext';
import { Expense } from '@/types/expense';
import { format } from 'date-fns';
import { Edit2, Trash2 } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ExpenseCardProps {
  expense: Expense;
  onPress?: () => void;
  onEdit?: (expense: Expense) => void;
  onDelete?: (expense: Expense) => void;
}

export const ExpenseCard = ({ expense, onPress, onEdit, onDelete }: ExpenseCardProps) => {
  const { formatCurrency } = useCurrency();
  const { colors } = useTheme();

  const handleEdit = (e: any) => {
    e.stopPropagation();
    onEdit?.(expense);
  };

  const handleDelete = (e: any) => {
    e.stopPropagation();
    onDelete?.(expense);
  };

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.cardBackground }]}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={!onPress}
    >
      <View style={styles.content}>
        <View style={styles.mainInfo}>
          <View style={styles.headerRow}>
            <Text style={[styles.merchant, { color: colors.text }]} numberOfLines={1}>
              {expense.storeName}
            </Text>
            <Text style={[styles.amount, { color: colors.text }]}>{formatCurrency(expense.amount)}</Text>
          </View>

          <View style={styles.detailsRow}>
            <Text style={[styles.category, { color: colors.textSecondary }]}>{expense.category}</Text>
            <Text style={[styles.date, { color: colors.textSecondary }]}>
              {format(new Date(expense.date), 'MMM d, yyyy')}
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        {(onEdit || onDelete) && (
          <View style={styles.actionButtons}>
            {onEdit && (
              <TouchableOpacity
                onPress={handleEdit}
                style={[styles.actionButton, { backgroundColor: colors.primary + '20' }]}
                activeOpacity={0.7}
              >
                <Edit2 size={18} color={colors.primary} />
              </TouchableOpacity>
            )}
            {onDelete && (
              <TouchableOpacity
                onPress={handleDelete}
                style={[styles.actionButton, { backgroundColor: '#FF453A20' }]}
                activeOpacity={0.7}
              >
                <Trash2 size={18} color="#FF453A" />
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 12,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mainInfo: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  merchant: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  amount: {
    fontSize: 16,
    fontWeight: '700',
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  category: {
    fontSize: 14,
  },
  date: {
    fontSize: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
    marginLeft: 12,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
