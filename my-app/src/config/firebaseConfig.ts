import { initializeApp, getApp, getApps } from "firebase/app";
import { 
  initializeAuth, 
  getAuth,
  // @ts-ignore
  getReactNativePersistence,
  EmailAuthProvider,
  GoogleAuthProvider,
  PhoneAuthProvider
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { Platform } from "react-native";
import { getStorage } from "firebase/storage";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Your Firebase Web configuration fetched from your project
const firebaseConfig = {
  projectId: "safesphere-ai-64ea1",
  appId: "1:719972551474:web:a3443123b2db8b8c47e52b",
  storageBucket: "safesphere-ai-64ea1.firebasestorage.app",
  apiKey: "AIzaSyDohnt0TF7qn2CdQIwxukxpX1CaBmoVSjs",
  authDomain: "safesphere-ai-64ea1.firebaseapp.com",
  messagingSenderId: "719972551474",
  measurementId: "G-2Z3WPX8TJB",
};

// Initialize Firebase App only once
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Auth with platform-specific persistence
let auth: any;
if (Platform.OS === 'web') {
  auth = getAuth(app);
} else {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
  });
}

// Auth Providers (Email, Google, Phone are supported by Firebase Auth)
const emailProvider = new EmailAuthProvider();
const googleProvider = new GoogleAuthProvider();
const phoneProvider = typeof window !== 'undefined' || Platform.OS !== 'web' ? new PhoneAuthProvider(auth) : null;

// Initialize Cloud Firestore and Storage
const db = getFirestore(app);
const storage = getStorage(app);

// Centralized Google OAuth Client ID for Expo Auth Session
const GOOGLE_CLIENT_IDS = {
  webClientId: "719972551474-f2qbq105sfuo0oo5ulo7sqvi2hca0g3f.apps.googleusercontent.com"
};

export { 
  firebaseConfig,
  app, 
  auth, 
  db,
  storage,
  emailProvider,
  googleProvider,
  phoneProvider,
  GOOGLE_CLIENT_IDS
};
