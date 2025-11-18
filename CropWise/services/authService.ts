import {
    createUserWithEmailAndPassword,
    sendPasswordResetEmail,
    signInWithEmailAndPassword,
    User,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

export type LoginRequest = {
  email: string;
  password: string;
};

export type RegisterRequest = {
  name: string;
  email: string;
  password: string;
};

export type AuthResponse = {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
};

export type UserProfile = {
  id: string;
  name: string;
  email: string;
};

/**
 * Đăng nhập với email và mật khẩu
 */
export async function login(payload: LoginRequest): Promise<AuthResponse> {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      payload.email,
      payload.password
    );
    const user = userCredential.user;
    
    // Lấy thông tin profile từ Firestore
    const userProfile = await getUserProfile(user.uid);
    
    // Lấy ID token để sử dụng cho API calls
    const token = await user.getIdToken();
    
    return {
      token,
      user: {
        id: user.uid,
        name: userProfile?.name || user.displayName || payload.email.split('@')[0],
        email: user.email || payload.email,
      },
    };
  } catch (error: any) {
    throw error;
  }
}

/**
 * Đăng ký tài khoản mới
 */
export async function register(payload: RegisterRequest): Promise<AuthResponse> {
  try {
    // Tạo user trong Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      payload.email,
      payload.password
    );
    const user = userCredential.user;
    
    // Lưu thông tin profile vào Firestore
    const userProfile: UserProfile = {
      id: user.uid,
      name: payload.name,
      email: payload.email,
    };
    
    await setDoc(doc(db, 'users', user.uid), {
      name: payload.name,
      email: payload.email,
      createdAt: new Date().toISOString(),
    });
    
    // Lấy ID token
    const token = await user.getIdToken();
    
    return {
      token,
      user: userProfile,
    };
  } catch (error: any) {
    throw error;
  }
}

/**
 * Gửi email đặt lại mật khẩu
 */
export async function resetPassword(email: string): Promise<void> {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error: any) {
    throw error;
  }
}

/**
 * Lấy thông tin profile từ Firestore
 */
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      const data = userDoc.data();
      return {
        id: userId,
        name: data.name || '',
        email: data.email || '',
      };
    }
    return null;
  } catch (error) {
    console.error('Error getting user profile:', error);
    return null;
  }
}

/**
 * Lấy thông tin user từ Firebase User object
 */
export async function getUserFromFirebaseUser(firebaseUser: User): Promise<UserProfile> {
  const profile = await getUserProfile(firebaseUser.uid);
  return {
    id: firebaseUser.uid,
    name: profile?.name || firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
    email: firebaseUser.email || '',
  };
}


