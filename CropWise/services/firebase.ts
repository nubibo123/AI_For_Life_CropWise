import { FirebaseApp, getApps, initializeApp } from 'firebase/app';
import { Auth, getAuth, initializeAuth } from 'firebase/auth';
import { Platform } from 'react-native';

const firebaseConfig = {
  apiKey: "AIzaSyCVGHgD4f7EZM3mm-dZJSoMuYeoVaov4X8",
  authDomain: "cropwise-ef53b.firebaseapp.com",
  projectId: "cropwise-ef53b",
  storageBucket: "cropwise-ef53b.firebasestorage.app",
  messagingSenderId: "990566220930",
  appId: "1:990566220930:web:f086ef3987399beaafa09b",
  measurementId: "G-ENFR0T720B"
};

let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0]!;
}

let auth: Auth;
if (Platform.OS === 'web') {
  auth = getAuth(app);
} else {
  try {
    auth = initializeAuth(app);
  } catch {
    auth = getAuth(app);
  }
}

export { app, auth };