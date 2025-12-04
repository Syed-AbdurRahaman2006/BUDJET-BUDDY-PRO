import { auth } from '@/config/firebase';
import { User } from '@/types/user';
import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    createUserWithEmailAndPassword,
    signOut as firebaseSignOut,
    User as FirebaseUser,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    updateProfile
} from 'firebase/auth';
import { useCallback, useEffect, useMemo, useState } from 'react';

const USER_STORAGE_KEY = '@budget_buddy_user';

// Validate email format
const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

// Validate password
const validatePassword = (password: string): { isValid: boolean; message?: string } => {
    if (password.length < 6) {
        return { isValid: false, message: 'Password must be at least 6 characters' };
    }
    return { isValid: true };
};

// Password strength indicator
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

// Convert Firebase user to app user
const convertFirebaseUser = (firebaseUser: FirebaseUser): User => {
    return {
        id: firebaseUser.uid,
        email: firebaseUser.email || '',
        name: firebaseUser.displayName || 'User',
        photoURL: firebaseUser.photoURL || undefined,
        createdAt: firebaseUser.metadata.creationTime || new Date().toISOString(),
    };
};

// Map Firebase errors to user-friendly messages
const getFirebaseErrorMessage = (errorCode: string): string => {
    const errorMessages: Record<string, string> = {
        'auth/email-already-in-use': 'This email is already registered',
        'auth/invalid-email': 'Invalid email address',
        'auth/user-not-found': 'No account found with this email',
        'auth/wrong-password': 'Incorrect password',
        'auth/weak-password': 'Password should be at least 6 characters',
        'auth/network-request-failed': 'Network error. Please check your connection',
        'auth/too-many-requests': 'Too many attempts. Please try again later',
        'auth/user-disabled': 'This account has been disabled',
        'auth/operation-not-allowed': 'Operation not allowed',
        'auth/invalid-credential': 'Invalid credentials. Please check your email and password',
    };

    return errorMessages[errorCode] || 'An error occurred. Please try again.';
};

export const [AuthProvider, useAuth] = createContextHook(() => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Load persisted user from AsyncStorage on app startup
    useEffect(() => {
        const loadPersistedUser = async () => {
            try {
                const savedUser = await AsyncStorage.getItem(USER_STORAGE_KEY);
                if (savedUser) {
                    setUser(JSON.parse(savedUser));
                }
            } catch (err) {
                console.error('Failed to load persisted user:', err);
            }
        };
        loadPersistedUser();
    }, []);

    // Listen to auth state changes from Firebase
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                const appUser = convertFirebaseUser(firebaseUser);
                setUser(appUser);
                // Save to AsyncStorage for persistence across app restarts
                await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(appUser));
            } else {
                setUser(null);
                await AsyncStorage.removeItem(USER_STORAGE_KEY);
            }
            setIsLoading(false);
        });

        return unsubscribe;
    }, []);

    // Sign up with Firebase
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

            // Create user with Firebase
            const userCredential = await createUserWithEmailAndPassword(
                auth,
                email.toLowerCase().trim(),
                password
            );

            // Update profile with display name
            await updateProfile(userCredential.user, {
                displayName: name.trim(),
            });

            // Convert and set user (onAuthStateChanged will handle this)
            return { success: true };
        } catch (err: any) {
            console.error('Sign up error:', err);
            console.error('Error code:', err.code);
            console.error('Error message:', err.message);
            const errorMessage = err.code ? getFirebaseErrorMessage(err.code) : err.message || 'Failed to create account';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Sign in with Firebase
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

            // Sign in with Firebase
            await signInWithEmailAndPassword(
                auth,
                email.toLowerCase().trim(),
                password
            );

            // onAuthStateChanged will handle setting the user
            return { success: true };
        } catch (err: any) {
            const errorMessage = err.code ? getFirebaseErrorMessage(err.code) : err.message || 'Failed to sign in';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Sign out with Firebase
    const signOut = useCallback(async () => {
        try {
            setIsLoading(true);
            await firebaseSignOut(auth);
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
    const updateUserProfile = useCallback(async (updates: Partial<User>) => {
        try {
            if (!user || !auth.currentUser) throw new Error('No user logged in');

            // Update Firebase profile if needed
            if (updates.name || updates.photoURL) {
                await updateProfile(auth.currentUser, {
                    displayName: updates.name || auth.currentUser.displayName,
                    photoURL: updates.photoURL || auth.currentUser.photoURL,
                });
            }

            // Update local user state
            const updatedUser = { ...user, ...updates };
            setUser(updatedUser);
            await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));

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
        updateProfile: updateUserProfile,
    }), [user, isLoading, error, signIn, signUp, signOut, updateUserProfile]);
});
