
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
  logout: () => Promise<void>;
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
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          // Check if user exists in Firestore
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          
          try {
            const userSnapshot = await getDoc(userDocRef);

            if (userSnapshot.exists()) {
              setCurrentUser({ id: firebaseUser.uid, ...userSnapshot.data() } as User);
            } else {
              // Create profile if doesn't exist
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

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const signInWithFacebook = async () => {
    const provider = new FacebookAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const signupWithEmail = async (email: string, password: string, nickname: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;
    
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
    setCurrentUser(newUser);
  };

  const loginWithEmail = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
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
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
};
