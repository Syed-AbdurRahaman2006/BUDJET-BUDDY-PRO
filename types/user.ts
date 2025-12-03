// User type definitions for authentication
export interface User {
    id: string;
    email: string;
    name: string;
    photoURL?: string;
    createdAt: string;
}

export interface AuthState {
    user: User | null;
    isLoading: boolean;
    error: string | null;
}
