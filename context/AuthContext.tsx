import { auth, db } from '@/config/firebase';
import {
    createUserWithEmailAndPassword,
    User as FirebaseUser,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signOut,
} from 'firebase/auth';
import {
    doc,
    getDoc,
    serverTimestamp,
    setDoc,
} from 'firebase/firestore';
import React, { createContext, useContext, useEffect, useState } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string, phone: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoggedIn: false,
  isLoading: false,
  login: async () => {},
  signup: async () => {},
  logout: async () => {},
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Listen to Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      try {
        if (firebaseUser) {
          // Fetch user data from Firestore
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            setUser({
              id: firebaseUser.uid,
              name: userData.name || '',
              email: firebaseUser.email || '',
              phone: userData.phone || '',
              avatar: userData.avatar || '👤',
            });
          } else {
            // If no user doc, create basic user object
            setUser({
              id: firebaseUser.uid,
              name: firebaseUser.email?.split('@')[0] || 'User',
              email: firebaseUser.email || '',
              phone: '',
              avatar: '👤',
            });
          }
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const login = async (email: string, password: string) => {
    try {
      if (!email.includes('@') || password.length < 6) {
        throw new Error('Invalid email or password');
      }

      const userCredential = await signInWithEmailAndPassword(auth, email, password);

      // Fetch user data from Firestore (with error handling)
      try {
        const userDocRef = doc(db, 'users', userCredential.user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          setUser({
            id: userCredential.user.uid,
            name: userData.name || '',
            email: userCredential.user.email || '',
            phone: userData.phone || '',
            avatar: userData.avatar || '👤',
          });
        } else {
          // User authenticated but no profile yet - set basic user
          setUser({
            id: userCredential.user.uid,
            name: userCredential.user.email?.split('@')[0] || 'User',
            email: userCredential.user.email || '',
            phone: '',
            avatar: '👤',
          });
        }
      } catch (firestoreError) {
        console.warn('Could not fetch Firestore data, but authentication successful:', firestoreError);
        // Still set user even if Firestore fetch fails
        setUser({
          id: userCredential.user.uid,
          name: userCredential.user.email?.split('@')[0] || 'User',
          email: userCredential.user.email || '',
          phone: '',
          avatar: '👤',
        });
      }
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('user-not-found')) {
          throw new Error('User not found. Please sign up first.');
        } else if (error.message.includes('wrong-password')) {
          throw new Error('Incorrect password.');
        } else if (error.message.includes('too-many-requests')) {
          throw new Error('Too many login attempts. Please try again later.');
        } else if (error.message.includes('FirebaseError')) {
          throw new Error('Login failed. Please check your credentials.');
        }
      }
      throw error;
    }
  };

  const signup = async (name: string, email: string, password: string, phone: string) => {
    try {
      if (!name || !email.includes('@') || password.length < 6 || !phone) {
        throw new Error('Please provide valid information');
      }

      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      // Store user data in Firestore (with error handling)
      try {
        const userDocRef = doc(db, 'users', userCredential.user.uid);
        await setDoc(userDocRef, {
          name,
          email,
          phone,
          avatar: '👤',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      } catch (firestoreError) {
        console.warn('Could not save profile to Firestore, but account created:', firestoreError);
        // Account is created in Auth, even if Firestore write failed
      }

      setUser({
        id: userCredential.user.uid,
        name,
        email,
        phone,
        avatar: '👤',
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('email-already-in-use')) {
          throw new Error('Email already in use. Please login or use a different email.');
        } else if (error.message.includes('weak-password')) {
          throw new Error('Password is too weak. Use at least 6 characters.');
        } else if (error.message.includes('FirebaseError')) {
          throw new Error('Signup failed. Please try again.');
        }
      }
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (error) {
      console.error('Error logging out:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn: user !== null,
        isLoading,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
