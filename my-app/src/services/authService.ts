import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  sendPasswordResetEmail,
  signInWithCredential,
  signInWithPopup,
  GoogleAuthProvider,
  signInWithPhoneNumber
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "../config/firebaseConfig";

export const authService = {
  // Sign up with email and password, then create user profile in Firestore
  async signUp(email: string, password: string, fullName: string) {
    let user;
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      user = userCredential.user;
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        // Fallback: log the user in if the account was already created but they got stuck
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        user = userCredential.user;
      } else {
        throw error;
      }
    }
    
    try {
      // Create user document in Firestore
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        fullName,
        email,
        phone: "",
        age: "",
        gender: "",
        safetyPreferences: {
          pushEnabled: true,
          smsEnabled: true,
          emailEnabled: true,
          medicalConditions: ""
        },
        trustedContacts: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }, { merge: true }); // merge: true prevents overwriting if they are just logging back in
      
      return user;
    } catch (error: any) {
      console.error("Firestore Error:", error);
      throw new Error(`Database Error: ${error.message}. Please check your Firestore Security Rules in the Firebase Console.`);
    }
  },

  // Update User Profile (Safety Info, Contacts, etc.)
  async updateUserProfile(data: any) {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("No user logged in");
      
      const userRef = doc(db, "users", user.uid);
      await setDoc(userRef, {
        ...data,
        updatedAt: new Date().toISOString(),
      }, { merge: true });
    } catch (error) {
      throw error;
    }
  },

  // Get User Profile (including trusted contacts)
  async getUserProfile() {
    try {
      const user = auth.currentUser;
      if (!user) return null;
      
      const userDoc = await getDoc(doc(db, "users", user.uid));
      return userDoc.exists() ? userDoc.data() : null;
    } catch (error) {
      console.error("Error fetching user profile:", error);
      return null;
    }
  },

  // Log in with email and password
  async login(email: string, password: string) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error) {
      throw error;
    }
  },

  // Send password reset email
  async resetPassword(email: string) {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      throw error;
    }
  },

  // Google Sign In (Note: Requires Expo AuthSession or Firebase Google Auth Provider setup for React Native)
  async loginWithGoogleCredential(idToken: string) {
    try {
      const credential = GoogleAuthProvider.credential(idToken);
      const userCredential = await signInWithCredential(auth, credential);
      return userCredential.user;
    } catch (error) {
      throw error;
    }
  },

  // Google Sign In for Web SDK
  async loginWithGoogleWeb() {
    // Import googleProvider dynamically or it is available from config
    const { googleProvider } = require("../config/firebaseConfig");
    try {
      const result = await signInWithPopup(auth, googleProvider);
      return result.user;
    } catch (error) {
      throw error;
    }
  },

  // Phone Auth
  async sendOtp(phoneNumber: string, appVerifier: any) {
    try {
      const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
      return confirmationResult;
    } catch (error) {
      throw error;
    }
  }
};
