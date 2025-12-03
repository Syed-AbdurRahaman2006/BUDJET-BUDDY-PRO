import { CATEGORIES, CATEGORY_COLORS } from '@/constants/categories';
import { useExpenses } from '@/context/ExpenseContext';
import { useTheme } from '@/context/ThemeContext';
import { ExpenseCategory } from '@/types/expense';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export function CategoryFilter() {
  const { selectedCategory, setSelectedCategory } = useExpenses();
  const { colors } = useTheme();

  const categories: (ExpenseCategory | 'All')[] = ['All', ...CATEGORIES];

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {categories.map((category) => {
          const isSelected = selectedCategory === category;
          const categoryColor = category === 'All' ? colors.text : CATEGORY_COLORS[category as ExpenseCategory];

          return (
            <TouchableOpacity
              key={category}
              style={[
                styles.chip,
                { backgroundColor: colors.cardBackground, borderColor: colors.border },
                isSelected && { backgroundColor: categoryColor, borderColor: categoryColor },
              ]}
              onPress={() => setSelectedCategory(category as ExpenseCategory | 'All')}
              accessibilityLabel={`Filter by ${category}`}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
            >
              <Text
                style={[
                  styles.chipText,
                  { color: colors.text },
                  isSelected && styles.chipTextSelected,
                ]}
              >
                {category}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  scrollContent: {
    paddingHorizontal: 20,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  chipTextSelected: {
    color: '#fff',
  },
});
