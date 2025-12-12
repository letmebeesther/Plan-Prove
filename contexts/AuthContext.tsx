
import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../services/firebase';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  GoogleAuthProvider, 
  FacebookAuthProvider, 
  signOut, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
  setPersistence,
  browserLocalPersistence,
  User as FirebaseUser 
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { User } from '../types';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithFacebook: () => Promise<void>;
  signupWithEmail: (email: string, password: string, nickname: string) => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Ensure persistence is set to LOCAL (survives browser restart)
    const initAuth = async () => {
      try {
        await setPersistence(auth, browserLocalPersistence);
      } catch (e) {
        console.error("Auth Persistence Error:", e);
      }
    };
    initAuth();

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log("Auth State Changed:", firebaseUser ? "User Logged In" : "User Logged Out", firebaseUser?.uid);
      try {
        if (firebaseUser) {
          // Check if user exists in Firestore
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          
          try {
            const userSnapshot = await getDoc(userDocRef);

            if (userSnapshot.exists()) {
              setCurrentUser({ id: firebaseUser.uid, ...userSnapshot.data() } as User);
            } else {
              // Create profile if doesn't exist (e.g. first social login)
              // Note: For email signup, we handle creation explicitly to ensure nickname is correct
              // This block catches social logins or cases where DB doc is missing
              const newUser: User = {
                id: firebaseUser.uid,
                nickname: firebaseUser.displayName || '익명 탐험가',
                email: firebaseUser.email || '',
                avatarUrl: firebaseUser.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${firebaseUser.uid}`,
                trustScore: 50,
                statusMessage: '새로운 도전을 시작합니다!',
                followers: 0,
                following: 0,
                totalPlans: 0,
                completedGoals: 0
              };
              await setDoc(userDocRef, newUser);
              setCurrentUser(newUser);
            }
          } catch (dbError) {
            console.error("Firestore access failed, falling back to basic auth info:", dbError);
            // Fallback: If DB fails, still log the user in with basic info so they aren't stuck
            setCurrentUser({
                id: firebaseUser.uid,
                nickname: firebaseUser.displayName || '탐험가 (Offline)',
                email: firebaseUser.email || '',
                avatarUrl: firebaseUser.photoURL || '',
                trustScore: 0
            } as User);
          }
        } else {
          setCurrentUser(null);
        }
      } catch (error) {
        console.error("Error in Auth State Change:", error);
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const refreshProfile = async () => {
    if (auth.currentUser) {
       try {
           const userDocRef = doc(db, 'users', auth.currentUser.uid);
           const userSnapshot = await getDoc(userDocRef);
           if (userSnapshot.exists()) {
              setCurrentUser({ id: auth.currentUser.uid, ...userSnapshot.data() } as User);
           }
       } catch (e) {
           console.error("Failed to refresh profile:", e);
       }
    }
  };

  const signInWithGoogle = async () => {
    try {
        const provider = new GoogleAuthProvider();
        await signInWithPopup(auth, provider);
    } catch (error) {
        console.error("Google Sign In Error:", error);
        throw error;
    }
  };

  const signInWithFacebook = async () => {
    try {
        const provider = new FacebookAuthProvider();
        await signInWithPopup(auth, provider);
    } catch (error) {
        console.error("Facebook Sign In Error:", error);
        throw error;
    }
  };

  const signupWithEmail = async (email: string, password: string, nickname: string) => {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const firebaseUser = userCredential.user;
        
        // Update Profile immediately
        await updateProfile(firebaseUser, { displayName: nickname });

        // Create User Profile in Firestore
        const newUser: User = {
          id: firebaseUser.uid,
          nickname: nickname,
          email: email,
          avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${firebaseUser.uid}`,
          trustScore: 50,
          statusMessage: '새로운 도전을 시작합니다!',
          followers: 0,
          following: 0,
          totalPlans: 0,
          completedGoals: 0
        };
        
        await setDoc(doc(db, 'users', firebaseUser.uid), newUser);
        
        // Manually update state to ensure correct nickname is reflected immediately
        // preventing race condition with onAuthStateChanged
        setCurrentUser(newUser);
    } catch (error) {
        console.error("Email Signup Error:", error);
        throw error;
    }
  };

  const loginWithEmail = async (email: string, password: string) => {
    try {
        await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
        console.error("Email Login Error:", error);
        throw error;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      console.error("Reset Password Error:", error);
      throw error;
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ 
      currentUser, 
      loading, 
      signInWithGoogle, 
      signInWithFacebook, 
      signupWithEmail,
      loginWithEmail,
      resetPassword,
      logout,
      refreshProfile
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
