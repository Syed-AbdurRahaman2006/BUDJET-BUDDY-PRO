import { User } from '@/types/user';
import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useMemo, useState } from 'react';

const USER_STORAGE_KEY = '@budget_buddy_user';

// Mock auth functions - replace with Firebase later
const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

const validatePassword = (password: string): { isValid: boolean; message?: string } => {
    if (password.length < 6) {
        return { isValid: false, message: 'Password must be at least 6 characters' };
    }
    return { isValid: true };
};

export const getPasswordStrength = (password: string): 'weak' | 'medium' | 'strong' => {
    if (password.length < 6) return 'weak';
    if (password.length < 10) return 'medium';

    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    const strength = [hasUpperCase, hasLowerCase, hasNumbers, hasSpecialChar].filter(Boolean).length;

    if (strength >= 3) return 'strong';
    if (strength >= 2) return 'medium';
    return 'weak';
};

export const [AuthProvider, useAuth] = createContextHook(() => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Load user on mount
    useEffect(() => {
        const loadUser = async () => {
            try {
                const savedUser = await AsyncStorage.getItem(USER_STORAGE_KEY);
                if (savedUser) {
                    setUser(JSON.parse(savedUser));
                }
            } catch (error) {
                console.error('Failed to load user:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadUser();
    }, []);

    // Sign up (mock - replace with Firebase)
    const signUp = useCallback(async (email: string, password: string, name: string) => {
        try {
            setIsLoading(true);
            setError(null);

            // Validate email
            if (!validateEmail(email)) {
                throw new Error('Please enter a valid email address');
            }

            // Validate password
            const passwordValidation = validatePassword(password);
            if (!passwordValidation.isValid) {
                throw new Error(passwordValidation.message);
            }

            // Validate name
            if (name.trim().length < 2) {
                throw new Error('Please enter your full name');
            }

            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Create user
            const newUser: User = {
                id: Date.now().toString(),
                email: email.toLowerCase().trim(),
                name: name.trim(),
                createdAt: new Date().toISOString(),
            };

            // Save to storage
            await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(newUser));
            setUser(newUser);

            return { success: true };
        } catch (err: any) {
            const errorMessage = err.message || 'Failed to create account';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Sign in (mock - replace with Firebase)
    const signIn = useCallback(async (email: string, password: string) => {
        try {
            setIsLoading(true);
            setError(null);

            // Validate email
            if (!validateEmail(email)) {
                throw new Error('Please enter a valid email address');
            }

            // Validate password
            if (!password) {
                throw new Error('Please enter your password');
            }

            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Mock successful sign in - in real app, Firebase would return user
            const mockUser: User = {
                id: Date.now().toString(),
                email: email.toLowerCase().trim(),
                name: 'User', // In real app, this would come from Firebase
                createdAt: new Date().toISOString(),
            };

            // Save to storage
            await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(mockUser));
            setUser(mockUser);

            return { success: true };
        } catch (err: any) {
            const errorMessage = err.message || 'Failed to sign in';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Sign out
    const signOut = useCallback(async () => {
        try {
            setIsLoading(true);
            await AsyncStorage.removeItem(USER_STORAGE_KEY);
            setUser(null);
            setError(null);
            return { success: true };
        } catch (err: any) {
            const errorMessage = err.message || 'Failed to sign out';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Update user profile
    const updateProfile = useCallback(async (updates: Partial<User>) => {
        try {
            if (!user) throw new Error('No user logged in');

            const updatedUser = { ...user, ...updates };
            await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));
            setUser(updatedUser);

            return { success: true };
        } catch (err: any) {
            const errorMessage = err.message || 'Failed to update profile';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        }
    }, [user]);

    return useMemo(() => ({
        user,
        isLoading,
        error,
        isAuthenticated: !!user,
        signIn,
        signUp,
        signOut,
        updateProfile,
    }), [user, isLoading, error, signIn, signUp, signOut, updateProfile]);
});
