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
let app;
if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
} else {
    app = getApp();
}

// Initialize Auth
// Note: Persistence is handled via AsyncStorage in AuthContext
const auth = getAuth(app);

export { auth };
export default app;
