import AsyncStorage from '@react-native-async-storage/async-storage';
import { FirebaseApp, getApps, initializeApp } from 'firebase/app';
import {
    Auth,
    getAuth,
    initializeAuth,
} from 'firebase/auth';
import {
    Firestore,
    getFirestore,
    initializeFirestore,
    setLogLevel,
} from 'firebase/firestore';
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
let db: Firestore;

if (!getApps().length) {
  app = initializeApp(firebaseConfig);
  if (Platform.OS === 'web') {
    db = getFirestore(app);
  } else {
    db = initializeFirestore(app, {
      experimentalAutoDetectLongPolling: true,
      //experimentalForceLongPolling: true,
    });
  }
} else {
  app = getApps()[0]!;
  db = getFirestore(app);
}

if (__DEV__) {
  setLogLevel('debug');
}

let auth: Auth;
if (Platform.OS === 'web') {
  auth = getAuth(app);
} else {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { getReactNativePersistence } = require('firebase/auth/react-native');
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch {
    try {
      auth = initializeAuth(app);
    } catch {
      auth = getAuth(app);
    }
  }
}

export { app, auth, db };
