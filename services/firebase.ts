
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
import { getStorage } from "firebase/storage";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDOPBrWz0EvtpXJVd8bPlqs_xnQ4EALzqg",
  authDomain: "plan-89f02.firebaseapp.com",
  databaseURL: "https://plan-89f02-default-rtdb.firebaseio.com",
  projectId: "plan-89f02",
  storageBucket: "plan-89f02.firebasestorage.app",
  messagingSenderId: "939037721118",
  appId: "1:939037721118:web:e028978354e3660890a40f",
  measurementId: "G-DTMS9X7MXL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Initialize Analytics
// Note: If you see "API key not valid" errors in the console, 
// ensure the Firebase Installations API is enabled in Google Cloud Console.
let analyticsInstance = null;
try {
  if (typeof window !== 'undefined') {
    analyticsInstance = getAnalytics(app);
  }
} catch (e) {
  console.warn("Firebase Analytics failed to initialize:", e);
}
export const analytics = analyticsInstance;

export default app;
