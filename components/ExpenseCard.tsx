import { CATEGORY_COLORS } from '@/constants/categories';
import Colors from '@/constants/colors';
import { useCurrency } from '@/context/CurrencyContext';
import { useExpenses } from '@/context/ExpenseContext';
import { Expense } from '@/types/expense';
import { Trash2 } from 'lucide-react-native';
import React from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ExpenseCardProps {
  expense: Expense;
}

export function ExpenseCard({ expense }: ExpenseCardProps) {
  const { deleteExpense } = useExpenses();
  const { formatCurrency } = useCurrency();

  const handleDelete = () => {
    Alert.alert(
      'Delete Expense',
      'Are you sure you want to delete this expense?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteExpense(expense.id),
        },
      ]
    );
  };

  const categoryColor = CATEGORY_COLORS[expense.category];

  return (
    <View style={styles.card}>
      <View style={[styles.categoryIndicator, { backgroundColor: categoryColor }]} />

      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.mainInfo}>
            <Text style={styles.storeName}>{expense.storeName}</Text>
            <View style={styles.metaInfo}>
              <View style={[styles.categoryBadge, { backgroundColor: categoryColor + '20' }]}>
                <Text style={[styles.categoryText, { color: categoryColor }]}>
                  {expense.category}
                </Text>
              </View>
              <Text style={styles.date}>{new Date(expense.date).toLocaleDateString()}</Text>
            </View>
          </View>

          <View style={styles.rightSection}>
            <Text style={styles.amount}>{formatCurrency(expense.amount)}</Text>
            <TouchableOpacity
              onPress={handleDelete}
              style={styles.deleteButton}
              accessibilityLabel="Delete expense"
              accessibilityRole="button"
            >
              <Trash2 color={Colors.danger} size={18} />
            </TouchableOpacity>
          </View>
        </View>

        {expense.notes && (
          <Text style={styles.notes} numberOfLines={2}>
            {expense.notes}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryIndicator: {
    height: 4,
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  mainInfo: {
    flex: 1,
    marginRight: 12,
  },
  storeName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 8,
  },
  metaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '600' as const,
  },
  date: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  rightSection: {
    alignItems: 'flex-end',
    gap: 8,
  },
  amount: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  deleteButton: {
    padding: 4,
  },
  notes: {
    marginTop: 12,
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
});
