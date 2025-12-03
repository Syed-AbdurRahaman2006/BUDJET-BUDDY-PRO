import { getPasswordStrength, useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Check, Eye, EyeOff, Lock, Mail, User } from 'lucide-react-native';
import React, { useState } from 'react';
import {
    ActivityIndicator,
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
    const { signUp, isLoading } = useAuth();
    const { colors, isDark } = useTheme();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [errors, setErrors] = useState<{
        name?: string;
        email?: string;
        password?: string;
        confirmPassword?: string;
        terms?: string;
    }>({});

    const passwordStrength = password ? getPasswordStrength(password) : null;

    const validateForm = () => {
        const newErrors: typeof errors = {};

        if (!name.trim()) {
            newErrors.name = 'Full name is required';
        } else if (name.trim().length < 2) {
            newErrors.name = 'Please enter your full name';
        }

        if (!email) {
            newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            newErrors.email = 'Please enter a valid email';
        }

        if (!password) {
            newErrors.password = 'Password is required';
        } else if (password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }

        if (!confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password';
        } else if (password !== confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        if (!agreedToTerms) {
            newErrors.terms = 'You must agree to the terms';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSignUp = async () => {
        if (!validateForm()) return;

        const result = await signUp(email.trim(), password, name.trim());

        if (result.success) {
            router.replace('/');
        } else {
            setErrors({ email: result.error || 'Sign up failed' });
        }
    };

    const getStrengthColor = () => {
        if (!passwordStrength) return '#E5E7EB';
        if (passwordStrength === 'weak') return '#EF4444';
        if (passwordStrength === 'medium') return '#F59E0B';
        return '#10B981';
    };

    const getStrengthWidth = () => {
        if (!passwordStrength) return '0%';
        if (passwordStrength === 'weak') return '33%';
        if (passwordStrength === 'medium') return '66%';
        return '100%';
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <LinearGradient
                colors={['#10B981', '#059669', '#047857']}
                style={styles.gradient}
            >
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
                            <Text style={styles.title}>Create Account</Text>
                            <Text style={styles.subtitle}>Join us and start managing your budget smartly</Text>
                        </View>

                        {/* Form Card */}
                        <View style={[styles.formCard, { backgroundColor: isDark ? colors.cardBackground : 'rgba(255, 255, 255, 0.95)' }]}>
                            {/* Name Input */}
                            <View style={styles.inputGroup}>
                                <Text style={[styles.label, { color: colors.text }]}>Full Name</Text>
                                <View style={[styles.inputContainer, { backgroundColor: colors.inputBackground, borderColor: colors.border }, errors.name && styles.inputError]}>
                                    <User color={errors.name ? '#EF4444' : '#9CA3AF'} size={20} />
                                    <TextInput
                                        style={[styles.input, { color: colors.text }]}
                                        value={name}
                                        onChangeText={(text) => {
                                            setName(text);
                                            if (errors.name) setErrors({ ...errors, name: undefined });
                                        }}
                                        placeholder="Enter your full name"
                                        autoCapitalize="words"
                                        autoComplete="name"
                                        placeholderTextColor={colors.textLight}
                                    />
                                </View>
                                {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
                            </View>

                            {/* Email Input */}
                            <View style={styles.inputGroup}>
                                <Text style={[styles.label, { color: colors.text }]}>Email</Text>
                                <View style={[styles.inputContainer, { backgroundColor: colors.inputBackground, borderColor: colors.border }, errors.email && styles.inputError]}>
                                    <Mail color={errors.email ? '#EF4444' : '#9CA3AF'} size={20} />
                                    <TextInput
                                        style={[styles.input, { color: colors.text }]}
                                        value={email}
                                        onChangeText={(text) => {
                                            setEmail(text);
                                            if (errors.email) setErrors({ ...errors, email: undefined });
                                        }}
                                        placeholder="Enter your email"
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                        autoComplete="email"
                                        placeholderTextColor={colors.textLight}
                                    />
                                </View>
                                {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
                            </View>

                            {/* Password Input */}
                            <View style={styles.inputGroup}>
                                <Text style={[styles.label, { color: colors.text }]}>Password</Text>
                                <View style={[styles.inputContainer, { backgroundColor: colors.inputBackground, borderColor: colors.border }, errors.password && styles.inputError]}>
                                    <Lock color={errors.password ? '#EF4444' : '#9CA3AF'} size={20} />
                                    <TextInput
                                        style={[styles.input, { color: colors.text }]}
                                        value={password}
                                        onChangeText={(text) => {
                                            setPassword(text);
                                            if (errors.password) setErrors({ ...errors, password: undefined });
                                        }}
                                        placeholder="Create a password"
                                        secureTextEntry={!showPassword}
                                        autoCapitalize="none"
                                        autoComplete="password"
                                        placeholderTextColor={colors.textLight}
                                    />
                                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                        {showPassword ? (
                                            <EyeOff color="#9CA3AF" size={20} />
                                        ) : (
                                            <Eye color="#9CA3AF" size={20} />
                                        )}
                                    </TouchableOpacity>
                                </View>
                                {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

                                {/* Password Strength Indicator */}
                                {password.length > 0 && (
                                    <View style={styles.strengthContainer}>
                                        <View style={styles.strengthBar}>
                                            <View
                                                style={[
                                                    styles.strengthFill,
                                                    {
                                                        width: getStrengthWidth(),
                                                        backgroundColor: getStrengthColor(),
                                                    },
                                                ]}
                                            />
                                        </View>
                                        <Text style={[styles.strengthText, { color: getStrengthColor() }]}>
                                            {passwordStrength?.toUpperCase()}
                                        </Text>
                                    </View>
                                )}
                            </View>

                            {/* Confirm Password Input */}
                            <View style={styles.inputGroup}>
                                <Text style={[styles.label, { color: colors.text }]}>Confirm Password</Text>
                                <View style={[styles.inputContainer, { backgroundColor: colors.inputBackground, borderColor: colors.border }, errors.confirmPassword && styles.inputError]}>
                                    <Lock color={errors.confirmPassword ? '#EF4444' : '#9CA3AF'} size={20} />
                                    <TextInput
                                        style={[styles.input, { color: colors.text }]}
                                        value={confirmPassword}
                                        onChangeText={(text) => {
                                            setConfirmPassword(text);
                                            if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: undefined });
                                        }}
                                        placeholder="Confirm your password"
                                        secureTextEntry={!showConfirmPassword}
                                        autoCapitalize="none"
                                        placeholderTextColor={colors.textLight}
                                    />
                                    <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                                        {showConfirmPassword ? (
                                            <EyeOff color="#9CA3AF" size={20} />
                                        ) : (
                                            <Eye color="#9CA3AF" size={20} />
                                        )}
                                    </TouchableOpacity>
                                </View>
                                {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
                            </View>

                            {/* Terms Checkbox */}
                            <TouchableOpacity
                                style={styles.checkboxContainer}
                                onPress={() => {
                                    setAgreedToTerms(!agreedToTerms);
                                    if (errors.terms) setErrors({ ...errors, terms: undefined });
                                }}
                                activeOpacity={0.7}
                            >
                                <View style={[styles.checkbox, { backgroundColor: colors.cardBackground, borderColor: colors.border }, agreedToTerms && { backgroundColor: colors.primary, borderColor: colors.primary }]}>
                                    {agreedToTerms && <Check color="#fff" size={16} />}
                                </View>
                                <Text style={[styles.checkboxLabel, { color: colors.textSecondary }]}>
                                    I agree to the{' '}
                                    <Text style={[styles.linkText, { color: colors.primary }]}>Terms & Conditions</Text>
                                </Text>
                            </TouchableOpacity>
                            {errors.terms && <Text style={styles.errorText}>{errors.terms}</Text>}

                            {/* Sign Up Button */}
                            <TouchableOpacity
                                style={[styles.signUpButton, isLoading && styles.buttonDisabled]}
                                onPress={handleSignUp}
                                disabled={isLoading}
                                activeOpacity={0.8}
                            >
                                <LinearGradient
                                    colors={['#10B981', '#059669']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={styles.buttonGradient}
                                >
                                    {isLoading ? (
                                        <ActivityIndicator color="#fff" />
                                    ) : (
                                        <Text style={styles.signUpButtonText}>Create Account</Text>
                                    )}
                                </LinearGradient>
                            </TouchableOpacity>

                            {/* Sign In Link */}
                            <View style={styles.signInContainer}>
                                <Text style={[styles.signInText, { color: colors.textSecondary }]}>Already have an account? </Text>
                                <TouchableOpacity onPress={() => router.back()}>
                                    <Text style={[styles.signInLink, { color: colors.primary }]}>Sign In</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </LinearGradient>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    gradient: {
        flex: 1,
    },
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 20,
    },
    header: {
        marginBottom: 32,
    },
    title: {
        fontSize: 32,
        fontWeight: '700' as const,
        color: '#fff',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.9)',
        lineHeight: 24,
    },
    formCard: {
        borderRadius: 24,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
        elevation: 8,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600' as const,
        marginBottom: 8,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 2,
        borderRadius: 12,
        paddingHorizontal: 16,
        height: 56,
        gap: 12,
    },
    inputError: {
        borderColor: '#EF4444',
        backgroundColor: '#FEF2F2',
    },
    input: {
        flex: 1,
        fontSize: 16,
    },
    errorText: {
        fontSize: 12,
        color: '#EF4444',
        marginTop: 4,
        marginLeft: 4,
    },
    strengthContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
        gap: 12,
    },
    strengthBar: {
        flex: 1,
        height: 4,
        backgroundColor: '#E5E7EB',
        borderRadius: 2,
        overflow: 'hidden',
    },
    strengthFill: {
        height: '100%',
        borderRadius: 2,
    },
    strengthText: {
        fontSize: 12,
        fontWeight: '700' as const,
        width: 60,
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
        gap: 12,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderWidth: 2,
        borderRadius: 6,
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkboxLabel: {
        flex: 1,
        fontSize: 14,
    },
    linkText: {
        fontWeight: '600' as const,
    },
    signUpButton: {
        height: 56,
        borderRadius: 12,
        overflow: 'hidden',
        marginBottom: 20,
    },
    buttonGradient: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    signUpButtonText: {
        fontSize: 16,
        fontWeight: '700' as const,
        color: '#fff',
    },
    signInContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    signInText: {
        fontSize: 14,
    },
    signInLink: {
        fontSize: 14,
        fontWeight: '700' as const,
    },
});
