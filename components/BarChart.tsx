import { useCurrency } from '@/context/CurrencyContext';
import { useTheme } from '@/context/ThemeContext';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

const CATEGORY_ICONS: { [key: string]: string } = {
  'Healthcare': '🏥',
  'Travel': '✈️',
  'Bills': '🧾',
  'Shopping': '🛍️',
  'Entertainment': '🎭',
  'Food': '🍔',
};

const CHART_HEIGHT = 200;

interface BarChartDataItem {
  label: string;
  value: number;
  color: string;
}

interface BarChartProps {
  data: BarChartDataItem[];
  height?: number;
}

export function BarChart({ data, height = CHART_HEIGHT }: BarChartProps) {
  const { formatCurrency } = useCurrency();
  const { colors } = useTheme();

  if (data.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No data to display</Text>
      </View>
    );
  }

  const maxValue = Math.max(...data.map(d => d.value));

  return (
    <View style={styles.container}>
      <View style={[styles.chart, { height: height + 60 }]}>
        {data.map((item) => {
          const barHeight = (item.value / maxValue) * height;

          return (
            <View key={item.label} style={styles.barContainer}>
              <View style={styles.barWrapper}>
                {CATEGORY_ICONS[item.label] && (
                  <Text style={styles.categoryIcon}>{CATEGORY_ICONS[item.label]}</Text>
                )}
                <Text style={[styles.barValue, { color: colors.text }]}>{formatCurrency(item.value, false)}</Text>
                <View
                  style={[
                    styles.bar,
                    {
                      height: barHeight,
                      backgroundColor: item.color,
                    },
                  ]}
                />
              </View>
              <Text style={[styles.barLabel, { color: colors.textSecondary }]} numberOfLines={1}>
                {item.label}
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
    marginBottom: 2,
  },
  barLabel: {
    fontSize: 11,
    marginTop: 8,
    textAlign: 'center',
    fontWeight: '600' as const,
  },
  categoryIcon: {
    fontSize: 16,
    marginBottom: 4,
  },
  emptyContainer: {
    height: CHART_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
  },
});
