import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyD2d3JsOKvRndYff0Rdnd_5x5fvrJzkaks",
    authDomain: "budget-buddy-pro-cc2d3.firebaseapp.com",
    projectId: "budget-buddy-pro-cc2d3",
    storageBucket: "budget-buddy-pro-cc2d3.firebasestorage.app",
    messagingSenderId: "728022338862",
    appId: "1:728022338862:web:a20155865e2ee627dd7ebf",
    measurementId: "G-QW5XEFY1VY"
};

// Initialize Firebase only if it hasn't been initialized yet
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Auth
// Note: Firebase Auth persistence in React Native is handled at the application level
// via onAuthStateChanged in AuthContext, which saves/loads user data from AsyncStorage.
// This approach provides reliable auth state persistence across app restarts.
const auth = getAuth(app);

export { auth };
export default app;
