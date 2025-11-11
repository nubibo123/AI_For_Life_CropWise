import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  User,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { auth } from '../services/firebase';

type AuthUser = {
  id: string;
  email: string | null;
  name: string | null;
};

type AuthContextValue = {
  user: AuthUser | null;
  token: string | null;
  initializing: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<string | null>;
  resetPassword: (email: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const normalizeUser = (firebaseUser: User | null): AuthUser | null => {
  if (!firebaseUser) return null;
  return {
    id: firebaseUser.uid,
    email: firebaseUser.email,
    name: firebaseUser.displayName,
  };
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(normalizeUser(firebaseUser));
      setInitializing(false);
    });

    return unsubscribe;
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
    setUser(normalizeUser(auth.currentUser));
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    if (credential.user && name) {
      await updateProfile(credential.user, { displayName: name });
    }
    setUser(normalizeUser(auth.currentUser));
  }, []);

  const logout = useCallback(async () => {
    await signOut(auth);
    setUser(null);
  }, []);

  const refreshToken = useCallback(async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) return null;
    return currentUser.getIdToken(true);
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token: null,
      initializing,
      login,
      register,
      logout,
      refreshToken,
      resetPassword,
    }),
    [user, initializing, login, register, logout, refreshToken, resetPassword]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

