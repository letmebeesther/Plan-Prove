import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { initializeFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
import { getStorage } from "firebase/storage";
import { getDatabase } from "firebase/database";

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

// Initialize Firestore with settings optimized for restricted environments
// Explicitly using database named 'plan'
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true, // Use HTTP polling instead of WebSockets
}, "plan");

// Initialize Storage with specific bucket URL
export const storage = getStorage(app, "gs://plan-89f02.firebasestorage.app");

// Initialize Realtime Database
export const rtdb = getDatabase(app);

// Initialize Analytics
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