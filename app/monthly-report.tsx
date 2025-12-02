import { BarChart } from '@/components/BarChart';
import { CATEGORY_COLORS } from '@/constants/categories';
import Colors from '@/constants/colors';
import { useCurrency } from '@/context/CurrencyContext';
import { useExpenses } from '@/context/ExpenseContext';
import { ExpenseCategory } from '@/types/expense';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function MonthlyReportScreen() {
  const { getMonthlyData } = useExpenses();
  const { formatCurrency } = useCurrency();
  const monthlyData = getMonthlyData();

  const currentMonthData = monthlyData[0];

  if (!currentMonthData || currentMonthData.total === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No data available</Text>
          <Text style={styles.emptyStateSubtext}>
            Start adding expenses to see your monthly report
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const categoryData = Object.entries(currentMonthData.byCategory)
    .filter(([_, amount]) => amount > 0)
    .map(([category, amount]) => ({
      category: category as ExpenseCategory,
      amount,
      percentage: (amount / currentMonthData.total) * 100,
    }))
    .sort((a, b) => b.amount - a.amount);

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>
            {new Date(currentMonthData.month).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
            })}
          </Text>
          <View style={styles.totalCard}>
            <Text style={styles.totalLabel}>Total Spending</Text>
            <Text style={styles.totalAmount}>
              {formatCurrency(currentMonthData.total)}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Spending by Category</Text>
          <View style={styles.chartContainer}>
            <BarChart data={categoryData} />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Category Breakdown</Text>
          {categoryData.map((item) => {
            const color = CATEGORY_COLORS[item.category];
            return (
              <View key={item.category} style={styles.categoryRow}>
                <View style={styles.categoryInfo}>
                  <View
                    style={[styles.categoryDot, { backgroundColor: color }]}
                  />
                  <Text style={styles.categoryName}>{item.category}</Text>
                </View>
                <View style={styles.categoryStats}>
                  <Text style={styles.categoryAmount}>
                    {formatCurrency(item.amount)}
                  </Text>
                  <Text style={styles.categoryPercentage}>
                    {item.percentage.toFixed(1)}%
                  </Text>
                </View>
              </View>
            );
          })}
        </View>

        {monthlyData.length > 1 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Months</Text>
            {monthlyData.slice(1, 6).map((month) => (
              <View key={month.month} style={styles.monthRow}>
                <Text style={styles.monthName}>
                  {new Date(month.month).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                  })}
                </Text>
                <Text style={styles.monthAmount}>
                  {formatCurrency(month.total)}
                </Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
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
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 16,
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
  section: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 16,
  },
  chartContainer: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 16,
    padding: 20,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.cardBackground,
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  categoryStats: {
    alignItems: 'flex-end',
  },
  categoryAmount: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 2,
  },
  categoryPercentage: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  monthRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.cardBackground,
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  monthName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  monthAmount: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
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
    lineHeight: 20,
  },
});
