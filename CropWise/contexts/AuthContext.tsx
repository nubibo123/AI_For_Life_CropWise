import { User as FirebaseUser, onAuthStateChanged, signOut } from 'firebase/auth';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
    getUserFromFirebaseUser,
    login as loginApi,
    register as registerApi,
    resetPassword as resetPasswordApi
} from '../services/authService';
import { auth } from '../services/firebase';

type AuthUser = {
  id: string;
  name: string;
  email: string;
};

type AuthContextValue = {
  user: AuthUser | null;
  token: string | null;
  initializing: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [initializing, setInitializing] = useState<boolean>(true);

  // Lắng nghe thay đổi trạng thái xác thực của Firebase
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      try {
        if (firebaseUser) {
          // User đã đăng nhập
          const userProfile = await getUserFromFirebaseUser(firebaseUser);
          const idToken = await firebaseUser.getIdToken();
          setUser(userProfile);
          setToken(idToken);
        } else {
          // User đã đăng xuất
          setUser(null);
          setToken(null);
        }
      } catch (error) {
        console.error('Error in auth state change:', error);
        setUser(null);
        setToken(null);
      } finally {
        setInitializing(false);
      }
    });

    return unsubscribe; // Cleanup subscription on unmount
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await loginApi({ email, password });
    // Auth state sẽ được cập nhật tự động bởi onAuthStateChanged
    // Không cần set state ở đây vì Firebase sẽ tự động trigger onAuthStateChanged
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    const res = await registerApi({ name, email, password });
    // Auth state sẽ được cập nhật tự động bởi onAuthStateChanged
    // Không cần set state ở đây vì Firebase sẽ tự động trigger onAuthStateChanged
  }, []);

  const logout = useCallback(async () => {
    try {
      await signOut(auth);
      // Auth state sẽ được cập nhật tự động bởi onAuthStateChanged
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    await resetPasswordApi(email);
  }, []);

  const value = useMemo(
    () => ({ user, token, initializing, login, register, logout, resetPassword }),
    [user, token, initializing, login, register, logout, resetPassword]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
};


