import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useExpenses } from '@/context/ExpenseContext';
import { CATEGORIES, CATEGORY_COLORS } from '@/constants/categories';
import { ExpenseCategory } from '@/types/expense';
import Colors from '@/constants/colors';

export function CategoryFilter() {
  const { selectedCategory, setSelectedCategory } = useExpenses();

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
          const categoryColor = category === 'All' ? Colors.text : CATEGORY_COLORS[category as ExpenseCategory];

          return (
            <TouchableOpacity
              key={category}
              style={[
                styles.chip,
                isSelected && { backgroundColor: categoryColor },
              ]}
              onPress={() => setSelectedCategory(category as ExpenseCategory | 'All')}
              accessibilityLabel={`Filter by ${category}`}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
            >
              <Text
                style={[
                  styles.chipText,
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
    backgroundColor: Colors.cardBackground,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  chipTextSelected: {
    color: '#fff',
  },
});
