import { CATEGORY_COLORS, CATEGORY_ICONS } from '@/constants/categories';
import { useAuth } from '@/context/AuthContext';
import { useCurrency } from '@/context/CurrencyContext';
import { useExpenses } from '@/context/ExpenseContext';
import { useTheme } from '@/context/ThemeContext';
import { ExpenseCategory } from '@/types/expense';
import { exportToCSV } from '@/utils/csv';
import { formatCurrency } from '@/utils/currency';
import { LinearGradient } from 'expo-linear-gradient';
import { Redirect, useRouter } from 'expo-router';
import { BarChart3, Camera, Download, Edit2, FileText, Plus, Settings, Trash2, User, Wallet } from 'lucide-react-native';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
    const router = useRouter();
    const { isAuthenticated, isLoading: authLoading } = useAuth();
    const { expenses, isLoading, selectedCategory, setSelectedCategory, filteredExpenses, getCurrentMonthTotal, deleteExpense } = useExpenses();
    const { currency } = useCurrency();
    const { colors } = useTheme();
    const [isExporting, setIsExporting] = useState(false);

    // Redirect if not authenticated
    if (!authLoading && !isAuthenticated) {
        return <Redirect href="/sign-in" />;
    }

    const categories: Array<ExpenseCategory | 'All'> = [
        'All',
        'Food',
        'Travel',
        'Bills',
        'Shopping',
        'Entertainment',
        'Healthcare',
        'Other',
    ];

    const CATEGORY_EMOJIS: Record<string, string> = {
        'All': '♾️',
        'Food': '🍔',
        'Travel': '✈️',
        'Bills': '🧾',
        'Shopping': '🛍',
        'Entertainment': '🎭',
        'Healthcare': '🏥',
        'Other': '📦',
    };

    const handleCategorySelect = (category: ExpenseCategory | 'All') => {
        setSelectedCategory(category);
    };

    const handleAddManual = () => {
        router.push('/add-expense');
    };

    const handleScanReceipt = () => {
        router.push('/camera');
    };

    const handleViewReports = () => {
        router.push('/monthly-report');
    };

    const handleSettings = () => {
        router.push('/profile');
    };

    const handleExportCSV = async () => {
        if (expenses.length === 0) {
            Alert.alert('No Data', 'There are no expenses to export');
            return;
        }

        setIsExporting(true);
        try {
            await exportToCSV(expenses);
            Alert.alert('Success', 'Expenses exported successfully!');
        } catch (error) {
            console.error('Export error:', error);
            Alert.alert('Error', 'Failed to export expenses');
        } finally {
            setIsExporting(false);
        }
    };

    const handleDeleteExpense = (id: string) => {
        Alert.alert(
            'Delete Expense',
            'Are you sure you want to delete this expense?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => deleteExpense(id),
                },
            ]
        );
    };

    const renderExpenseItem = ({ item }: any) => {
        const CategoryIcon = CATEGORY_ICONS[item.category];
        const categoryColor = CATEGORY_COLORS[item.category];

        return (
            <View style={[styles.expenseCard, { backgroundColor: colors.cardBackground }]}>
                <View style={styles.expenseContent}>
                    <View style={styles.expenseLeft}>
                        <Text style={[styles.storeName, { color: colors.text }]}>{item.storeName}</Text>
                        <Text style={[styles.category, { color: CATEGORY_COLORS[item.category] }]}>
                            {CATEGORY_EMOJIS[item.category]} {item.category}
                        </Text>
                    </View>
                    <View style={styles.expenseRight}>
                        <Text style={[styles.amount, { color: colors.text }]}>
                            {formatCurrency(item.amount, currency)}
                        </Text>
                        <Text style={[styles.expenseDate, { color: colors.textSecondary }]}>
                            {new Date(item.date).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                            })}
                        </Text>
                    </View>
                </View>

                <View style={styles.actionButtons}>
                    <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: colors.background }]}
                        activeOpacity={0.7}
                        onPress={() => router.push({
                            pathname: '/add-expense',
                            params: {
                                id: item.id,
                                amount: item.amount.toString(),
                                storeName: item.storeName,
                                date: item.date,
                                category: item.category,
                                notes: item.notes
                            }
                        })}
                    >
                        <Edit2 size={18} color="#8B5CF6" />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: colors.background }]}
                        activeOpacity={0.7}
                        onPress={() => handleDeleteExpense(item.id)}
                    >
                        <Trash2 size={18} color="#EF4444" />
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    const renderEmptyState = () => (
        <View style={styles.emptyState}>
            <View style={[styles.emptyIconContainer, { backgroundColor: colors.cardBackground }]}>
                <FileText color={colors.textSecondary} size={48} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No Expenses Yet</Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                Start tracking your expenses by adding one manually or scanning a receipt
            </Text>
        </View>
    );

    if (authLoading || isLoading) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    const currentExpenses = filteredExpenses();
    const monthlyTotal = getCurrentMonthTotal();

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
            <LinearGradient
                colors={[colors.background, colors.cardBackground]}
                style={[StyleSheet.absoluteFill, { opacity: 0.3 }]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            />
            {/* Header */}
            <View style={styles.header}>
                <LinearGradient
                    colors={[colors.cardBackground, 'transparent']}
                    style={[StyleSheet.absoluteFill, { opacity: 0.5 }]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                />
                <View style={styles.headerContent}>
                    <View>
                        <Text style={[styles.headerTitle, { color: colors.text }]}>Budget Buddy Pro</Text>
                        <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>Track your expenses 📊</Text>
                    </View>
                    <TouchableOpacity
                        style={[styles.profileIcon, { backgroundColor: colors.cardBackground }]}
                        onPress={handleSettings}
                        activeOpacity={0.7}
                    >
                        <User size={20} color={colors.primary} />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Monthly Total Card */}
            <LinearGradient
                colors={['#8B5CF6', '#6D28D9']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.monthlyCard}
            >
                <View style={styles.cardBackgroundIcon}>
                    <Wallet size={120} color="rgba(255, 255, 255, 0.1)" />
                </View>
                <Text style={styles.monthlyLabel}>This Month</Text>
                <Text style={styles.monthlyAmount}>{formatCurrency(monthlyTotal, currency)}</Text>
            </LinearGradient>

            {/* Category Filters */}
            <View style={styles.categoryContainer}>
                <FlatList
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    data={categories}
                    keyExtractor={(item) => item}
                    renderItem={({ item }) => {
                        const isSelected = selectedCategory === item;
                        const categoryColor = item === 'All' ? colors.text : CATEGORY_COLORS[item as ExpenseCategory];

                        return (
                            <TouchableOpacity
                                style={[
                                    styles.categoryChip,
                                    {
                                        backgroundColor: isSelected ? categoryColor : colors.cardBackground,
                                    },
                                ]}
                                onPress={() => handleCategorySelect(item)}
                            >
                                <Text
                                    style={[
                                        styles.categoryText,
                                        {
                                            color: isSelected ? '#fff' : colors.text,
                                        },
                                    ]}
                                >
                                    {item}
                                </Text>
                            </TouchableOpacity>
                        );
                    }}
                    contentContainerStyle={styles.categoryList}
                />
            </View>

            {/* Section Title */}
            <Text style={[styles.sectionTitle, { color: colors.text }]}>All Expenses</Text>

            {/* Expense List */}
            <FlatList
                data={currentExpenses}
                renderItem={renderExpenseItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={renderEmptyState}
                showsVerticalScrollIndicator={false}
            />

            {/* Bottom Navigation */}
            <View style={[styles.bottomNav, { backgroundColor: colors.cardBackground }]}>
                <TouchableOpacity style={styles.navButton} onPress={handleScanReceipt}>
                    <View style={[styles.navIconContainer, { backgroundColor: colors.primary }]}>
                        <Camera color="#fff" size={22} />
                    </View>
                    <Text style={[styles.navLabel, { color: colors.text }]}>Scan</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.navButton} onPress={handleAddManual}>
                    <View style={[styles.navIconContainer, { backgroundColor: colors.primary }]}>
                        <Plus color="#fff" size={22} />
                    </View>
                    <Text style={[styles.navLabel, { color: colors.text }]}>Add</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.navButton} onPress={handleViewReports}>
                    <View style={[styles.navIconContainer, { backgroundColor: colors.primary }]}>
                        <BarChart3 color="#fff" size={22} />
                    </View>
                    <Text style={[styles.navLabel, { color: colors.text }]}>Report</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.navButton} onPress={handleExportCSV} disabled={isExporting}>
                    <View style={[styles.navIconContainer, { backgroundColor: colors.primary, opacity: isExporting ? 0.5 : 1 }]}>
                        <Download color="#fff" size={22} />
                    </View>
                    <Text style={[styles.navLabel, { color: colors.text }]}>Export</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.navButton} onPress={handleSettings}>
                    <View style={[styles.navIconContainer, { backgroundColor: colors.primary }]}>
                        <Settings color="#fff" size={22} />
                    </View>
                    <Text style={[styles.navLabel, { color: colors.text }]}>Settings</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.05)',
        position: 'relative',
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    profileIcon: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '700' as const,
    },
    headerSubtitle: {
        fontSize: 14,
        marginTop: 4,
    },
    monthlyCard: {
        marginHorizontal: 20,
        marginVertical: 16,
        padding: 24,
        borderRadius: 24,
        alignItems: 'center',
        shadowColor: '#8B5CF6',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 10,
        overflow: 'hidden',
        position: 'relative',
    },
    cardBackgroundIcon: {
        position: 'absolute',
        right: -20,
        bottom: -20,
        transform: [{ rotate: '-15deg' }],
    },
    monthlyLabel: {
        fontSize: 14,
        color: '#fff',
        marginBottom: 8,
        fontWeight: '500' as const,
    },
    monthlyAmount: {
        fontSize: 32,
        fontWeight: '700' as const,
        color: '#fff',
    },
    categoryContainer: {
        paddingVertical: 12,
        marginBottom: 8,
    },
    categoryList: {
        paddingHorizontal: 20,
        gap: 8,
    },
    categoryChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        marginRight: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
    },
    categoryText: {
        fontSize: 14,
        fontWeight: '600' as const,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700' as const,
        paddingHorizontal: 20,
        marginBottom: 12,
    },
    listContent: {
        paddingHorizontal: 20,
        paddingBottom: 100,
    },
    expenseCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 12,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
        gap: 12,
    },
    expenseContent: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 8,
    },
    actionButton: {
        padding: 8,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    expenseLeft: {
        flex: 1,
    },
    storeName: {
        fontSize: 16,
        fontWeight: '600' as const,
        marginBottom: 4,
    },
    category: {
        fontSize: 13,
    },
    expenseRight: {
        alignItems: 'flex-end',
    },
    amount: {
        fontSize: 16,
        fontWeight: '700' as const,
        marginBottom: 4,
    },
    expenseDate: {
        fontSize: 12,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
        paddingHorizontal: 40,
    },
    emptyIconContainer: {
        width: 96,
        height: 96,
        borderRadius: 48,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '700' as const,
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 15,
        textAlign: 'center',
        lineHeight: 22,
    },
    bottomNav: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0, 0, 0, 0.1)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 8,
    },
    navButton: {
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
    },
    navIconContainer: {
        width: 56,
        height: 56,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 5,
    },
    navLabel: {
        fontSize: 11,
        fontWeight: '600' as const,
    },
});
