import { CategoryFilter } from '@/components/CategoryFilter';
import { EditExpenseModal } from '@/components/EditExpenseModal';
import { ExpenseCard } from '@/components/ExpenseCard';
import Colors from '@/constants/colors';
import { useAuth } from '@/context/AuthContext';
import { useCurrency } from '@/context/CurrencyContext';
import { useExpenses } from '@/context/ExpenseContext';
import { useTheme } from '@/context/ThemeContext';
import { Expense } from '@/types/expense';
import { exportToCSV } from '@/utils/csv';
import { useRouter } from 'expo-router';
import { BarChart3, Camera, Download, Plus, Settings2 } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const { colors, isDark } = useTheme();
  const {
    filteredExpenses,
    isLoading,
    getCurrentMonthTotal,
    selectedCategory,
    expenses,
    updateExpense,
    deleteExpense,
  } = useExpenses();
  const { formatCurrency } = useCurrency();
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  // Auth guard: redirect to sign-in if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/sign-in');
    }
  }, [user, authLoading, router]);

  const handleExport = async () => {
    try {
      if (expenses.length === 0) {
        Alert.alert('No Data', 'There are no expenses to export.');
        return;
      }
      await exportToCSV(expenses);
      Alert.alert('Success', 'Expenses exported successfully!');
    } catch (error) {
      console.error('Export error:', error);
      Alert.alert('Error', 'Failed to export expenses. Please try again.');
    }
  };

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);
  };

  const handleDelete = (expense: Expense) => {
    Alert.alert(
      'Delete Expense',
      `Are you sure you want to delete this expense from ${expense.storeName}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteExpense(expense.id),
        },
      ]
    );
  };

  const handleSaveEdit = (expense: Expense) => {
    updateExpense(expense);
    setEditingExpense(null);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading expenses...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const currentExpenses = filteredExpenses();
  const monthTotal = getCurrentMonthTotal();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={[styles.totalCard, { backgroundColor: colors.primary }]}>
            <Text style={styles.totalLabel}>This Month</Text>
            <Text style={styles.totalAmount}>{formatCurrency(monthTotal)}</Text>
          </View>
        </View>

        <CategoryFilter />

        <View style={styles.listContainer}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {selectedCategory === 'All' ? 'All Expenses' : `${selectedCategory} Expenses`}
          </Text>

          {currentExpenses.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={[styles.emptyStateText, { color: colors.text }]}>No expenses yet</Text>
              <Text style={[styles.emptyStateSubtext, { color: colors.textSecondary }]}>
                Tap the camera button to scan a receipt or add an expense manually
              </Text>
            </View>
          ) : (
            <FlatList
              data={currentExpenses}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <ExpenseCard
                  expense={item}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              )}
              scrollEnabled={false}
              ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
            />
          )}
        </View>
      </ScrollView>

      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push('/camera')}
          accessibilityLabel="Scan receipt with camera"
          accessibilityRole="button"
        >
          <Camera color="#fff" size={20} />
          <Text style={styles.actionButtonText}>Scan</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push('/add-expense')}
          accessibilityLabel="Add expense manually"
          accessibilityRole="button"
        >
          <Plus color="#fff" size={20} />
          <Text style={styles.actionButtonText}>Add</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push('/monthly-report')}
          accessibilityLabel="View monthly report"
          accessibilityRole="button"
        >
          <BarChart3 color="#fff" size={20} />
          <Text style={styles.actionButtonText}>Report</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleExport}
          accessibilityLabel="Export expenses to CSV"
          accessibilityRole="button"
        >
          <Download color="#fff" size={20} />
          <Text style={styles.actionButtonText}>Export</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push('/profile')}
          accessibilityLabel="Open settings"
          accessibilityRole="button"
        >
          <Settings2 color="#fff" size={20} />
          <Text style={styles.actionButtonText}>Settings</Text>
        </TouchableOpacity>
      </View>

      <EditExpenseModal
        visible={editingExpense !== null}
        expense={editingExpense}
        onClose={() => setEditingExpense(null)}
        onSave={handleSaveEdit}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: Colors.textSecondary,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  totalCard: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  totalLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500' as const,
    marginBottom: 4,
  },
  totalAmount: {
    fontSize: 36,
    fontWeight: '700' as const,
    color: '#fff',
  },
  actionsContainer: {
    position: 'absolute' as const,
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    paddingBottom: 20,
    gap: 12,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  actionButton: {
    flex: 1,
    backgroundColor: Colors.secondary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600' as const,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: Colors.textLight,
    textAlign: 'center',
    paddingHorizontal: 40,
    lineHeight: 20,
  },
});
