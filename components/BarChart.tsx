import { CATEGORY_COLORS } from '@/constants/categories';
import Colors from '@/constants/colors';
import { useCurrency } from '@/context/CurrencyContext';
import { ExpenseCategory } from '@/types/expense';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

const CHART_HEIGHT = 200;

interface BarChartData {
  category: ExpenseCategory;
  amount: number;
  percentage: number;
}

interface BarChartProps {
  data: BarChartData[];
}

export function BarChart({ data }: BarChartProps) {
  const { formatCurrency } = useCurrency();

  if (data.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No data to display</Text>
      </View>
    );
  }

  const maxAmount = Math.max(...data.map(d => d.amount));

  return (
    <View style={styles.container}>
      <View style={styles.chart}>
        {data.map((item) => {
          const barHeight = (item.amount / maxAmount) * CHART_HEIGHT;
          const color = CATEGORY_COLORS[item.category];

          return (
            <View key={item.category} style={styles.barContainer}>
              <View style={styles.barWrapper}>
                <Text style={styles.barValue}>{formatCurrency(item.amount, false)}</Text>
                <View
                  style={[
                    styles.bar,
                    {
                      height: barHeight,
                      backgroundColor: color,
                    },
                  ]}
                />
              </View>
              <Text style={styles.barLabel} numberOfLines={1}>
                {item.category}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  chart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    height: CHART_HEIGHT + 60,
    paddingTop: 20,
  },
  barContainer: {
    alignItems: 'center',
    flex: 1,
    maxWidth: 60,
  },
  barWrapper: {
    alignItems: 'center',
    width: '100%',
  },
  bar: {
    width: '80%',
    minHeight: 4,
    borderRadius: 4,
    marginTop: 4,
  },
  barValue: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 2,
  },
  barLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
    fontWeight: '600' as const,
  },
  emptyContainer: {
    height: CHART_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
});
