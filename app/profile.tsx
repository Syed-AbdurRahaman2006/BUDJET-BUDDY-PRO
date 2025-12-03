import Colors from '@/constants/colors';
import { useAuth } from '@/context/AuthContext';
import { useCurrency } from '@/context/CurrencyContext';
import { useTheme } from '@/context/ThemeContext';
import { Currency, getAvailableCurrencies } from '@/utils/currency';
import { useRouter } from 'expo-router';
import { Globe, LogOut, Moon, Settings2, Smartphone, Sun, User2 } from 'lucide-react-native';
import React, { useState } from 'react';
import {
    Alert,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProfileScreen() {
    const router = useRouter();
    const { currency, setCurrency } = useCurrency();
    const { user, signOut } = useAuth();
    const { theme, setTheme, colors, isDark } = useTheme();
    const [showCurrencyPicker, setShowCurrencyPicker] = useState(false);
    const currencies = getAvailableCurrencies();

    const handleCurrencySelect = (newCurrency: Currency) => {
        setCurrency(newCurrency);
        setShowCurrencyPicker(false);
    };

    const handleSignOut = () => {
        Alert.alert(
            'Sign Out',
            'Are you sure you want to sign out?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Sign Out',
                    style: 'destructive',
                    onPress: async () => {
                        const result = await signOut();
                        if (result.success) {
                            router.replace('/sign-in');
                        }
                    },
                },
            ]
        );
    };

    const selectedCurrencyInfo = currencies.find(c => c.code === currency);

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['bottom']}>
            <ScrollView style={styles.scrollView}>
                {/* Header */}
                <View style={styles.header}>
                    <Settings2 color={colors.primary} size={32} />
                    <Text style={[styles.headerTitle, { color: colors.text }]}>Settings</Text>
                </View>

                {/* User Section */}
                {user && (
                    <View style={styles.section}>
                        <View style={[styles.userCard, { backgroundColor: colors.cardBackground }]}>
                            <View style={styles.avatarContainer}>
                                <User2 color="#fff" size={32} />
                            </View>
                            <View style={styles.userInfo}>
                                <Text style={[styles.userName, { color: colors.text }]}>{user.name}</Text>
                                <Text style={[styles.userEmail, { color: colors.textSecondary }]}>{user.email}</Text>
                            </View>
                        </View>
                    </View>
                )}

                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Preferences</Text>

                    {/* Theme Selector */}
                    <View style={[styles.settingRow, { backgroundColor: colors.cardBackground, marginBottom: 12 }]}>
                        <View style={styles.settingInfo}>
                            {theme === 'dark' ? <Moon color={colors.textSecondary} size={20} /> :
                                theme === 'light' ? <Sun color={colors.textSecondary} size={20} /> :
                                    <Smartphone color={colors.textSecondary} size={20} />}
                            <Text style={[styles.settingLabel, { color: colors.text }]}>Appearance</Text>
                        </View>
                        <View style={styles.themeSelector}>
                            <TouchableOpacity
                                onPress={() => setTheme('light')}
                                style={[styles.themeOption, theme === 'light' && { backgroundColor: colors.background }]}
                            >
                                <Sun size={16} color={theme === 'light' ? colors.primary : colors.textSecondary} />
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => setTheme('dark')}
                                style={[styles.themeOption, theme === 'dark' && { backgroundColor: colors.background }]}
                            >
                                <Moon size={16} color={theme === 'dark' ? colors.primary : colors.textSecondary} />
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => setTheme('system')}
                                style={[styles.themeOption, theme === 'system' && { backgroundColor: colors.background }]}
                            >
                                <Smartphone size={16} color={theme === 'system' ? colors.primary : colors.textSecondary} />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <TouchableOpacity
                        style={[styles.settingRow, { backgroundColor: colors.cardBackground }]}
                        onPress={() => setShowCurrencyPicker(true)}
                        accessibilityLabel="Change currency"
                        accessibilityRole="button"
                    >
                        <View style={styles.settingInfo}>
                            <Globe color={colors.textSecondary} size={20} />
                            <Text style={[styles.settingLabel, { color: colors.text }]}>Currency</Text>
                        </View>
                        <View style={styles.settingValue}>
                            <Text style={[styles.settingValueText, { color: colors.textSecondary }]}>
                                {selectedCurrencyInfo?.symbol} {selectedCurrencyInfo?.name}
                            </Text>
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Account Section */}
                {user && (
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>Account</Text>
                        <TouchableOpacity
                            style={[styles.signOutButton, { backgroundColor: isDark ? 'rgba(239, 68, 68, 0.2)' : '#FEE2E2' }]}
                            onPress={handleSignOut}
                            activeOpacity={0.7}
                        >
                            <LogOut color={colors.danger} size={20} />
                            <Text style={[styles.signOutText, { color: colors.danger }]}>Sign Out</Text>
                        </TouchableOpacity>
                    </View>
                )}

                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>About</Text>
                    <View style={[styles.infoCard, { backgroundColor: colors.cardBackground }]}>
                        <Text style={[styles.appName, { color: colors.primary }]}>Budget Buddy Pro</Text>
                        <Text style={[styles.appVersion, { color: colors.textSecondary }]}>Version 1.0.0</Text>
                        <Text style={[styles.appDescription, { color: colors.textSecondary }]}>
                            Track your expenses effortlessly with receipt scanning and detailed reports.
                        </Text>
                    </View>
                </View>
            </ScrollView>

            {/* Currency Picker Modal */}
            <Modal
                visible={showCurrencyPicker}
                transparent
                animationType="slide"
                onRequestClose={() => setShowCurrencyPicker(false)}
            >
                <Pressable
                    style={styles.modalOverlay}
                    onPress={() => setShowCurrencyPicker(false)}
                >
                    <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
                        <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
                            <Text style={[styles.modalTitle, { color: colors.text }]}>Select Currency</Text>
                        </View>

                        <ScrollView style={styles.currencyList}>
                            {currencies.map((curr) => (
                                <TouchableOpacity
                                    key={curr.code}
                                    style={[
                                        styles.currencyOption,
                                        { borderBottomColor: colors.border },
                                        curr.code === currency && { backgroundColor: isDark ? 'rgba(16, 185, 129, 0.1)' : '#F0FDF4' },
                                    ]}
                                    onPress={() => handleCurrencySelect(curr.code)}
                                    accessibilityLabel={`Select ${curr.name}`}
                                    accessibilityRole="button"
                                >
                                    <View style={styles.currencyInfo}>
                                        <Text style={[styles.currencySymbol, { color: colors.primary }]}>{curr.symbol}</Text>
                                        <View style={styles.currencyDetails}>
                                            <Text style={[styles.currencyName, { color: colors.text }]}>{curr.name}</Text>
                                            <Text style={[styles.currencyCode, { color: colors.textSecondary }]}>{curr.code}</Text>
                                        </View>
                                    </View>
                                    {curr.code === currency && (
                                        <View style={[styles.checkmark, { backgroundColor: colors.primary }]}>
                                            <Text style={styles.checkmarkText}>✓</Text>
                                        </View>
                                    )}
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </Pressable>
            </Modal>
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
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 16,
        gap: 12,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '700' as const,
    },
    section: {
        paddingHorizontal: 20,
        paddingBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700' as const,
        marginBottom: 12,
    },
    settingRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 1,
    },
    settingInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    settingLabel: {
        fontSize: 16,
        fontWeight: '600' as const,
    },
    settingValue: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    settingValueText: {
        fontSize: 14,
        fontWeight: '500' as const,
    },
    themeSelector: {
        flexDirection: 'row',
        backgroundColor: 'rgba(0,0,0,0.05)',
        borderRadius: 8,
        padding: 4,
        gap: 4,
    },
    themeOption: {
        padding: 6,
        borderRadius: 6,
    },
    infoCard: {
        padding: 20,
        borderRadius: 12,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    appName: {
        fontSize: 20,
        fontWeight: '700' as const,
        marginBottom: 4,
    },
    appVersion: {
        fontSize: 14,
        marginBottom: 12,
    },
    appDescription: {
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 20,
    },
    userCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
        gap: 16,
    },
    avatarContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: Colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    userInfo: {
        flex: 1,
        gap: 4,
    },
    userName: {
        fontSize: 20,
        fontWeight: '700' as const,
    },
    userEmail: {
        fontSize: 14,
    },
    signOutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 12,
        gap: 12,
    },
    signOutText: {
        fontSize: 16,
        fontWeight: '600' as const,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: '80%',
    },
    modalHeader: {
        padding: 20,
        borderBottomWidth: 1,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '700' as const,
        textAlign: 'center',
    },
    currencyList: {
        maxHeight: 400,
    },
    currencyOption: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
    },
    currencyInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    currencySymbol: {
        fontSize: 24,
        fontWeight: '700' as const,
        width: 40,
        textAlign: 'center',
    },
    currencyDetails: {
        gap: 2,
    },
    currencyName: {
        fontSize: 16,
        fontWeight: '600' as const,
    },
    currencyCode: {
        fontSize: 13,
    },
    checkmark: {
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkmarkText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '700' as const,
    },
});
