import { getPasswordStrength, useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { Redirect, useRouter } from 'expo-router';
import { Eye, EyeOff, KeyRound, Mail, User as UserIcon } from 'lucide-react-native';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SignUpScreen() {
    const router = useRouter();
    const { signUp, isAuthenticated, isLoading: authLoading } = useAuth();
    const { colors, isDark } = useTheme();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [acceptedTerms, setAcceptedTerms] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Redirect if already authenticated
    if (isAuthenticated && !authLoading) {
        return <Redirect href="/" />;
    }

    const passwordStrength = password ? getPasswordStrength(password) : null;

    const handleSignUp = async () => {
        if (!name.trim() || !email.trim() || !password) {
            Alert.alert('Missing Information', 'Please fill in all fields');
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert('Password Mismatch', 'Passwords do not match');
            return;
        }

        if (!acceptedTerms) {
            Alert.alert('Terms Required', 'Please accept the Terms & Conditions to continue');
            return;
        }

        setIsLoading(true);
        const result = await signUp(email, password, name);
        setIsLoading(false);

        if (result.success) {
            router.replace('/');
        } else {
            Alert.alert('Sign Up Failed', result.error || 'Unable to create account. Please try again.');
        }
    };

    const handleSignInPress = () => {
        router.back();
    };

    const getStrengthColor = (strength: 'weak' | 'medium' | 'strong') => {
        switch (strength) {
            case 'weak':
                return '#EF4444';
            case 'medium':
                return '#F59E0B';
            case 'strong':
                return colors.primary;
        }
    };

    if (authLoading) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['bottom']}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    {/* Header */}
                    <View style={styles.header}>
                        <View style={[styles.iconContainer, { backgroundColor: colors.primary }]}>
                            <Text style={styles.iconText}>💰</Text>
                        </View>
                        <Text style={[styles.title, { color: colors.text }]}>Create Account</Text>
                        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                            Join Budget Buddy Pro today
                        </Text>
                    </View>

                    {/* Form */}
                    <View style={styles.form}>
                        {/* Name Input */}
                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: colors.text }]}>Full Name</Text>
                            <View style={[styles.inputContainer, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
                                <UserIcon color={colors.textSecondary} size={20} />
                                <TextInput
                                    style={[styles.input, { color: colors.text }]}
                                    placeholder="Enter your name"
                                    placeholderTextColor={colors.textSecondary}
                                    value={name}
                                    onChangeText={setName}
                                    autoCapitalize="words"
                                    autoComplete="name"
                                    editable={!isLoading}
                                />
                            </View>
                        </View>

                        {/* Email Input */}
                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: colors.text }]}>Email</Text>
                            <View style={[styles.inputContainer, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
                                <Mail color={colors.textSecondary} size={20} />
                                <TextInput
                                    style={[styles.input, { color: colors.text }]}
                                    placeholder="Enter your email"
                                    placeholderTextColor={colors.textSecondary}
                                    value={email}
                                    onChangeText={setEmail}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    autoComplete="email"
                                    editable={!isLoading}
                                />
                            </View>
                        </View>

                        {/* Password Input */}
                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: colors.text }]}>Password</Text>
                            <View style={[styles.inputContainer, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
                                <KeyRound color={colors.textSecondary} size={20} />
                                <TextInput
                                    style={[styles.input, { color: colors.text }]}
                                    placeholder="Create a password"
                                    placeholderTextColor={colors.textSecondary}
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry={!showPassword}
                                    autoCapitalize="none"
                                    autoComplete="password"
                                    editable={!isLoading}
                                />
                                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                    {showPassword ? (
                                        <EyeOff color={colors.textSecondary} size={20} />
                                    ) : (
                                        <Eye color={colors.textSecondary} size={20} />
                                    )}
                                </TouchableOpacity>
                            </View>

                            {/* Password Strength Indicator */}
                            {passwordStrength && (
                                <View style={styles.strengthContainer}>
                                    <View style={styles.strengthBars}>
                                        <View
                                            style={[
                                                styles.strengthBar,
                                                { backgroundColor: getStrengthColor(passwordStrength) },
                                            ]}
                                        />
                                        <View
                                            style={[
                                                styles.strengthBar,
                                                {
                                                    backgroundColor:
                                                        passwordStrength === 'medium' || passwordStrength === 'strong'
                                                            ? getStrengthColor(passwordStrength)
                                                            : isDark ? '#333' : '#E5E5E5',
                                                },
                                            ]}
                                        />
                                        <View
                                            style={[
                                                styles.strengthBar,
                                                {
                                                    backgroundColor:
                                                        passwordStrength === 'strong'
                                                            ? getStrengthColor(passwordStrength)
                                                            : isDark ? '#333' : '#E5E5E5',
                                                },
                                            ]}
                                        />
                                    </View>
                                    <Text
                                        style={[
                                            styles.strengthText,
                                            { color: getStrengthColor(passwordStrength) },
                                        ]}
                                    >
                                        {passwordStrength.charAt(0).toUpperCase() + passwordStrength.slice(1)}
                                    </Text>
                                </View>
                            )}
                        </View>

                        {/* Confirm Password Input */}
                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: colors.text }]}>Confirm Password</Text>
                            <View style={[styles.inputContainer, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
                                <KeyRound color={colors.textSecondary} size={20} />
                                <TextInput
                                    style={[styles.input, { color: colors.text }]}
                                    placeholder="Confirm your password"
                                    placeholderTextColor={colors.textSecondary}
                                    value={confirmPassword}
                                    onChangeText={setConfirmPassword}
                                    secureTextEntry={!showConfirmPassword}
                                    autoCapitalize="none"
                                    autoComplete="password"
                                    editable={!isLoading}
                                />
                                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                                    {showConfirmPassword ? (
                                        <EyeOff color={colors.textSecondary} size={20} />
                                    ) : (
                                        <Eye color={colors.textSecondary} size={20} />
                                    )}
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Terms & Conditions */}
                        <TouchableOpacity
                            style={styles.termsContainer}
                            onPress={() => setAcceptedTerms(!acceptedTerms)}
                            activeOpacity={0.7}
                            disabled={isLoading}
                        >
                            <View style={[
                                styles.checkbox,
                                {
                                    borderColor: colors.border,
                                    backgroundColor: acceptedTerms ? colors.primary : 'transparent'
                                }
                            ]}>
                                {acceptedTerms && <Text style={styles.checkmark}>✓</Text>}
                            </View>
                            <Text style={[styles.termsText, { color: colors.textSecondary }]}>
                                I agree to the Terms & Conditions
                            </Text>
                        </TouchableOpacity>

                        {/* Sign Up Button */}
                        <TouchableOpacity
                            style={[styles.signUpButton, { backgroundColor: colors.primary, opacity: isLoading ? 0.7 : 1 }]}
                            onPress={handleSignUp}
                            disabled={isLoading}
                            activeOpacity={0.8}
                        >
                            {isLoading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.signUpButtonText}>Sign Up</Text>
                            )}
                        </TouchableOpacity>

                        {/* Sign In Link */}
                        <View style={styles.signInContainer}>
                            <Text style={[styles.signInText, { color: colors.textSecondary }]}>
                                Already have an account?{' '}
                            </Text>
                            <TouchableOpacity onPress={handleSignInPress} disabled={isLoading}>
                                <Text style={[styles.signInLink, { color: colors.primary }]}>Sign In</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
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
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 24,
    },
    header: {
        alignItems: 'center',
        marginBottom: 48,
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    iconText: {
        fontSize: 40,
    },
    title: {
        fontSize: 32,
        fontWeight: '700' as const,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        textAlign: 'center',
    },
    form: {
        width: '100%',
    },
    inputGroup: {
        marginBottom: 24,
    },
    label: {
        fontSize: 16,
        fontWeight: '600' as const,
        marginBottom: 8,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        gap: 12,
    },
    input: {
        flex: 1,
        fontSize: 16,
    },
    strengthContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
        gap: 12,
    },
    strengthBars: {
        flex: 1,
        flexDirection: 'row',
        gap: 4,
    },
    strengthBar: {
        flex: 1,
        height: 4,
        borderRadius: 2,
    },
    strengthText: {
        fontSize: 12,
        fontWeight: '600' as const,
        minWidth: 60,
        textAlign: 'right',
    },
    signUpButton: {
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        marginTop: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    signUpButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600' as const,
    },
    signInContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 24,
    },
    signInText: {
        fontSize: 15,
    },
    signInLink: {
        fontSize: 15,
        fontWeight: '600' as const,
    },
    termsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        gap: 12,
    },
    checkbox: {
        width: 20,
        height: 20,
        borderRadius: 4,
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkmark: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '700' as const,
    },
    termsText: {
        fontSize: 14,
        flex: 1,
    },
});
