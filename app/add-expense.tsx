import { CATEGORIES, CATEGORY_COLORS } from '@/constants/categories';
import { useCurrency } from '@/context/CurrencyContext';
import { useExpenses } from '@/context/ExpenseContext';
import { useTheme } from '@/context/ThemeContext';
import { ExpenseCategory } from '@/types/expense';
import { CURRENCIES } from '@/utils/currency';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Calendar, Trash2 } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AddExpenseScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { currency } = useCurrency();
  const params = useLocalSearchParams<{
    id?: string;
    amount?: string;
    storeName?: string;
    date?: string;
    category?: ExpenseCategory;
    notes?: string;
  }>();

  const { addExpense, updateExpense, deleteExpense, isAdding, isUpdating, isDeleting, expenses } = useExpenses();

  const isEditing = !!params.id;
  const existingExpense = isEditing ? expenses.find(e => e.id === params.id) : null;

  const [amount, setAmount] = useState(existingExpense?.amount.toString() || params.amount || '');
  const [storeName, setStoreName] = useState(existingExpense?.storeName || params.storeName || '');
  const [date, setDate] = useState(existingExpense?.date || params.date || new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState<ExpenseCategory>(existingExpense?.category || params.category || 'Other');
  const [notes, setNotes] = useState(existingExpense?.notes || params.notes || '');

  useEffect(() => {
    if (isEditing) {
      router.setParams({ title: 'Edit Expense' });
    }
  }, [isEditing]);

  const handleSave = () => {
    if (!amount || !storeName) {
      Alert.alert('Missing Information', 'Please fill in amount and store name.');
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount.');
      return;
    }

    const expenseData = {
      amount: amountNum,
      storeName: storeName.trim(),
      category,
      date,
      notes: notes.trim(),
    };

    if (isEditing && params.id) {
      updateExpense({
        ...expenseData,
        id: params.id,
        createdAt: existingExpense?.createdAt || new Date().toISOString(),
      });
      Alert.alert('Success', 'Expense updated successfully!', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } else {
      addExpense(expenseData);
      Alert.alert('Success', 'Expense added successfully!', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    }
  };

  const handleDelete = () => {
    if (!params.id) return;

    Alert.alert(
      'Delete Expense',
      'Are you sure you want to delete this expense?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteExpense(params.id!);
            router.back();
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['bottom']}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Amount *</Text>
            <View style={[styles.amountInputContainer, { backgroundColor: colors.cardBackground, borderColor: colors.primary }]}>
              <Text style={[styles.currencySymbol, { color: colors.primary }]}>{CURRENCIES[currency].symbol}</Text>
              <TextInput
                style={[styles.amountInput, { color: colors.text }]}
                value={amount}
                onChangeText={setAmount}
                placeholder="0.00"
                placeholderTextColor={colors.textSecondary}
                keyboardType="decimal-pad"
                accessibilityLabel="Expense amount"
                autoFocus={!params.amount}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Store Name *</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.cardBackground, borderColor: colors.border, color: colors.text }]}
              value={storeName}
              onChangeText={setStoreName}
              placeholder="Enter store name"
              placeholderTextColor={colors.textSecondary}
              accessibilityLabel="Store name"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Date</Text>
            <View style={[styles.dateInputContainer, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
              <Calendar color={colors.textSecondary} size={20} />
              <TextInput
                style={[styles.dateInput, { color: colors.text }]}
                value={date}
                onChangeText={setDate}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={colors.textSecondary}
                accessibilityLabel="Expense date"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Category</Text>
            <View style={styles.categoryGrid}>
              {CATEGORIES.map((cat) => {
                const isSelected = category === cat;
                const categoryColor = CATEGORY_COLORS[cat];

                return (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.categoryChip,
                      { backgroundColor: colors.cardBackground, borderColor: colors.border },
                      isSelected && {
                        backgroundColor: categoryColor,
                        borderColor: categoryColor,
                      },
                    ]}
                    onPress={() => setCategory(cat)}
                    accessibilityLabel={`Select ${cat} category`}
                    accessibilityRole="button"
                    accessibilityState={{ selected: isSelected }}
                  >
                    <Text
                      style={[
                        styles.categoryChipText,
                        { color: colors.text },
                        isSelected && styles.categoryChipTextSelected,
                      ]}
                    >
                      {cat}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Notes (Optional)</Text>
            <TextInput
              style={[styles.input, styles.notesInput, { backgroundColor: colors.cardBackground, borderColor: colors.border, color: colors.text }]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Add any notes..."
              placeholderTextColor={colors.textSecondary}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              accessibilityLabel="Expense notes"
            />
          </View>
        </View>
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: colors.cardBackground, borderTopColor: colors.border }]}>
        {isEditing && (
          <TouchableOpacity
            style={[styles.button, styles.deleteButton, { borderColor: colors.danger }]}
            onPress={handleDelete}
            disabled={isDeleting}
            accessibilityLabel="Delete expense"
            accessibilityRole="button"
          >
            {isDeleting ? (
              <ActivityIndicator color={colors.danger} />
            ) : (
              <Trash2 color={colors.danger} size={24} />
            )}
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.button, styles.cancelButton, { backgroundColor: colors.background, borderColor: colors.border }]}
          onPress={() => router.back()}
          accessibilityLabel="Cancel"
          accessibilityRole="button"
        >
          <Text style={[styles.cancelButtonText, { color: colors.text }]}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.saveButton, (isAdding || isUpdating) && styles.buttonDisabled, isEditing && { flex: 2 }]}
          onPress={handleSave}
          disabled={isAdding || isUpdating}
          accessibilityLabel="Save expense"
          accessibilityRole="button"
        >
          {isAdding || isUpdating ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>{isEditing ? 'Update Expense' : 'Save Expense'}</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  form: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 15,
    fontWeight: '700' as const,
    marginBottom: 10,
    letterSpacing: 0.3,
  },
  input: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 16,
    fontSize: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: 16,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  currencySymbol: {
    fontSize: 32,
    fontWeight: '700' as const,
    marginRight: 12,
  },
  amountInput: {
    flex: 1,
    paddingVertical: 20,
    fontSize: 32,
    fontWeight: '700' as const,
  },
  notesInput: {
    minHeight: 120,
    paddingTop: 16,
    borderRadius: 16,
    textAlignVertical: 'top',
  },
  dateInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 18,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  dateInput: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 24,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryChipText: {
    fontSize: 15,
    fontWeight: '700' as const,
  },
  categoryChipTextSelected: {
    color: '#fff',
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  button: {
    flex: 1,
    paddingVertical: 18,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  cancelButton: {
    borderWidth: 1,
  },
  cancelButtonText: {
    fontSize: 17,
    fontWeight: '700' as const,
  },
  saveButton: {
    backgroundColor: '#10B981',
  },
  saveButtonText: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: '#fff',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  deleteButton: {
    borderWidth: 1,
    marginRight: 8,
    width: 56,
    flex: 0,
  },
});
