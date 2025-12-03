import { useTheme } from '@/context/ThemeContext';
import { Expense, ExpenseCategory } from '@/types/expense';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Calendar, X } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

interface EditExpenseModalProps {
    visible: boolean;
    expense: Expense | null;
    onClose: () => void;
    onSave: (expense: Expense) => void;
}

const CATEGORIES: ExpenseCategory[] = [
    'Food',
    'Travel',
    'Bills',
    'Shopping',
    'Entertainment',
    'Healthcare',
    'Other',
];

export const EditExpenseModal: React.FC<EditExpenseModalProps> = ({
    visible,
    expense,
    onClose,
    onSave,
}) => {
    const { colors } = useTheme();
    const [amount, setAmount] = useState('');
    const [storeName, setStoreName] = useState('');
    const [category, setCategory] = useState<ExpenseCategory>('Other');
    const [notes, setNotes] = useState('');
    const [date, setDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);

    useEffect(() => {
        if (expense) {
            setAmount(expense.amount.toString());
            setStoreName(expense.storeName);
            setCategory(expense.category);
            setNotes(expense.notes || '');
            setDate(new Date(expense.date));
        }
    }, [expense]);

    const handleSave = () => {
        const parsedAmount = parseFloat(amount);

        if (!storeName.trim()) {
            Alert.alert('Error', 'Please enter a store name');
            return;
        }

        if (isNaN(parsedAmount) || parsedAmount <= 0) {
            Alert.alert('Error', 'Please enter a valid amount');
            return;
        }

        if (!expense) return;

        const updatedExpense: Expense = {
            ...expense,
            amount: parsedAmount,
            storeName: storeName.trim(),
            category,
            notes: notes.trim(),
            date: date.toISOString().split('T')[0],
        };

        onSave(updatedExpense);
    };

    const handleDateChange = (event: any, selectedDate?: Date) => {
        setShowDatePicker(Platform.OS === 'ios');
        if (selectedDate) {
            setDate(selectedDate);
        }
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={[styles.title, { color: colors.text }]}>Edit Expense</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <X size={24} color={colors.text} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                        {/* Amount Input */}
                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: colors.text }]}>Amount *</Text>
                            <TextInput
                                style={[
                                    styles.input,
                                    {
                                        backgroundColor: colors.cardBackground,
                                        color: colors.text,
                                        borderColor: colors.border,
                                    },
                                ]}
                                value={amount}
                                onChangeText={setAmount}
                                placeholder="0.00"
                                placeholderTextColor={colors.textSecondary}
                                keyboardType="decimal-pad"
                            />
                        </View>

                        {/* Store Name Input */}
                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: colors.text }]}>Store Name *</Text>
                            <TextInput
                                style={[
                                    styles.input,
                                    {
                                        backgroundColor: colors.cardBackground,
                                        color: colors.text,
                                        borderColor: colors.border,
                                    },
                                ]}
                                value={storeName}
                                onChangeText={setStoreName}
                                placeholder="Enter store name"
                                placeholderTextColor={colors.textSecondary}
                            />
                        </View>

                        {/* Category Picker */}
                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: colors.text }]}>Category</Text>
                            <View style={styles.categoryGrid}>
                                {CATEGORIES.map((cat) => (
                                    <TouchableOpacity
                                        key={cat}
                                        style={[
                                            styles.categoryChip,
                                            {
                                                backgroundColor:
                                                    category === cat ? colors.primary : colors.cardBackground,
                                                borderColor: colors.border,
                                            },
                                        ]}
                                        onPress={() => setCategory(cat)}
                                    >
                                        <Text
                                            style={[
                                                styles.categoryText,
                                                {
                                                    color: category === cat ? '#fff' : colors.text,
                                                },
                                            ]}
                                        >
                                            {cat}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {/* Date Picker */}
                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: colors.text }]}>Date</Text>
                            <TouchableOpacity
                                style={[
                                    styles.dateButton,
                                    {
                                        backgroundColor: colors.cardBackground,
                                        borderColor: colors.border,
                                    },
                                ]}
                                onPress={() => setShowDatePicker(true)}
                            >
                                <Calendar size={20} color={colors.text} />
                                <Text style={[styles.dateText, { color: colors.text }]}>
                                    {date.toLocaleDateString()}
                                </Text>
                            </TouchableOpacity>

                            {showDatePicker && (
                                <DateTimePicker
                                    value={date}
                                    mode="date"
                                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                    onChange={handleDateChange}
                                    maximumDate={new Date()}
                                />
                            )}
                        </View>

                        {/* Notes Input */}
                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: colors.text }]}>Notes (Optional)</Text>
                            <TextInput
                                style={[
                                    styles.input,
                                    styles.notesInput,
                                    {
                                        backgroundColor: colors.cardBackground,
                                        color: colors.text,
                                        borderColor: colors.border,
                                    },
                                ]}
                                value={notes}
                                onChangeText={setNotes}
                                placeholder="Add notes..."
                                placeholderTextColor={colors.textSecondary}
                                multiline
                                numberOfLines={3}
                                textAlignVertical="top"
                            />
                        </View>
                    </ScrollView>

                    {/* Action Buttons */}
                    <View style={styles.footer}>
                        <TouchableOpacity
                            style={[styles.button, styles.cancelButton, { borderColor: colors.border }]}
                            onPress={onClose}
                        >
                            <Text style={[styles.buttonText, { color: colors.text }]}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.button, styles.saveButton, { backgroundColor: colors.primary }]}
                            onPress={handleSave}
                        >
                            <Text style={[styles.buttonText, styles.saveButtonText]}>Save Changes</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContainer: {
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        maxHeight: '90%',
        paddingBottom: Platform.OS === 'ios' ? 34 : 16,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0, 0, 0, 0.1)',
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
    },
    closeButton: {
        padding: 4,
    },
    content: {
        padding: 20,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
    },
    input: {
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        borderWidth: 1,
    },
    notesInput: {
        minHeight: 80,
    },
    categoryGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    categoryChip: {
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 20,
        borderWidth: 1,
    },
    categoryText: {
        fontSize: 14,
        fontWeight: '600',
    },
    dateButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        gap: 12,
    },
    dateText: {
        fontSize: 16,
    },
    footer: {
        flexDirection: 'row',
        padding: 20,
        gap: 12,
    },
    button: {
        flex: 1,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    cancelButton: {
        borderWidth: 1,
    },
    saveButton: {
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    buttonText: {
        fontSize: 16,
        fontWeight: '600',
    },
    saveButtonText: {
        color: '#fff',
    },
});
