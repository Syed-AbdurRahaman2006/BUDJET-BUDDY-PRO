import Colors from '@/constants/colors';
import { useCurrency } from '@/context/CurrencyContext';
import { Currency, getAvailableCurrencies } from '@/utils/currency';
import { Globe, Settings2 } from 'lucide-react-native';
import React, { useState } from 'react';
import {
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
    const { currency, setCurrency } = useCurrency();
    const [showCurrencyPicker, setShowCurrencyPicker] = useState(false);
    const currencies = getAvailableCurrencies();

    const handleCurrencySelect = (newCurrency: Currency) => {
        setCurrency(newCurrency);
        setShowCurrencyPicker(false);
    };

    const selectedCurrencyInfo = currencies.find(c => c.code === currency);

    return (
        <SafeAreaView style={styles.container} edges={['bottom']}>
            <ScrollView style={styles.scrollView}>
                <View style={styles.header}>
                    <Settings2 color={Colors.primary} size={32} />
                    <Text style={styles.headerTitle}>Settings</Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Preferences</Text>

                    <TouchableOpacity
                        style={styles.settingRow}
                        onPress={() => setShowCurrencyPicker(true)}
                        accessibilityLabel="Change currency"
                        accessibilityRole="button"
                    >
                        <View style={styles.settingInfo}>
                            <Globe color={Colors.textSecondary} size={20} />
                            <Text style={styles.settingLabel}>Currency</Text>
                        </View>
                        <View style={styles.settingValue}>
                            <Text style={styles.settingValueText}>
                                {selectedCurrencyInfo?.symbol} {selectedCurrencyInfo?.name}
                            </Text>
                        </View>
                    </TouchableOpacity>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>About</Text>
                    <View style={styles.infoCard}>
                        <Text style={styles.appName}>Budget Buddy Pro</Text>
                        <Text style={styles.appVersion}>Version 1.0.0</Text>
                        <Text style={styles.appDescription}>
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
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Select Currency</Text>
                        </View>

                        <ScrollView style={styles.currencyList}>
                            {currencies.map((curr) => (
                                <TouchableOpacity
                                    key={curr.code}
                                    style={[
                                        styles.currencyOption,
                                        curr.code === currency && styles.currencyOptionSelected,
                                    ]}
                                    onPress={() => handleCurrencySelect(curr.code)}
                                    accessibilityLabel={`Select ${curr.name}`}
                                    accessibilityRole="button"
                                >
                                    <View style={styles.currencyInfo}>
                                        <Text style={styles.currencySymbol}>{curr.symbol}</Text>
                                        <View style={styles.currencyDetails}>
                                            <Text style={styles.currencyName}>{curr.name}</Text>
                                            <Text style={styles.currencyCode}>{curr.code}</Text>
                                        </View>
                                    </View>
                                    {curr.code === currency && (
                                        <View style={styles.checkmark}>
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
        backgroundColor: Colors.background,
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
        color: Colors.text,
    },
    section: {
        paddingHorizontal: 20,
        paddingBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700' as const,
        color: Colors.text,
        marginBottom: 12,
    },
    settingRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: Colors.cardBackground,
        padding: 16,
        borderRadius: 12,
        shadowColor: Colors.shadow,
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
        color: Colors.text,
    },
    settingValue: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    settingValueText: {
        fontSize: 14,
        color: Colors.textSecondary,
        fontWeight: '500' as const,
    },
    infoCard: {
        backgroundColor: Colors.cardBackground,
        padding: 20,
        borderRadius: 12,
        alignItems: 'center',
        shadowColor: Colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    appName: {
        fontSize: 20,
        fontWeight: '700' as const,
        color: Colors.primary,
        marginBottom: 4,
    },
    appVersion: {
        fontSize: 14,
        color: Colors.textSecondary,
        marginBottom: 12,
    },
    appDescription: {
        fontSize: 14,
        color: Colors.textSecondary,
        textAlign: 'center',
        lineHeight: 20,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: Colors.background,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: '80%',
    },
    modalHeader: {
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '700' as const,
        color: Colors.text,
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
        borderBottomColor: '#F3F4F6',
    },
    currencyOptionSelected: {
        backgroundColor: '#F0FDF4',
    },
    currencyInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    currencySymbol: {
        fontSize: 24,
        fontWeight: '700' as const,
        color: Colors.primary,
        width: 40,
        textAlign: 'center',
    },
    currencyDetails: {
        gap: 2,
    },
    currencyName: {
        fontSize: 16,
        fontWeight: '600' as const,
        color: Colors.text,
    },
    currencyCode: {
        fontSize: 13,
        color: Colors.textSecondary,
    },
    checkmark: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: Colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkmarkText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '700' as const,
    },
});
