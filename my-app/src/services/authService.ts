import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  sendPasswordResetEmail,
  signInWithCredential,
  GoogleAuthProvider,
  signInWithPhoneNumber
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "../config/firebaseConfig";

export const authService = {
  // Create initial user profile in Firestore after Clerk signup
  async createUserProfile(userId: string, email: string, fullName: string) {
    try {
      await setDoc(doc(db, "users", userId), {
        uid: userId,
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
      }, { merge: true });
      return true;
    } catch (error: any) {
      console.error("Firestore Error:", error);
      throw new Error(`Database Error: ${error.message}`);
    }
  },


  // Update User Profile (Safety Info, Contacts, etc.)
  async updateUserProfile(userId: string, data: any) {
    try {
      if (!userId) throw new Error("No user ID provided");
      
      const userRef = doc(db, "users", userId);
      await setDoc(userRef, {
        ...data,
        updatedAt: new Date().toISOString(),
      }, { merge: true });
    } catch (error) {
      throw error;
    }
  },

  // Get User Profile (including trusted contacts)
  async getUserProfile(userId: string) {
    try {
      if (!userId) return null;
      
      const userDoc = await getDoc(doc(db, "users", userId));
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
      const user = userCredential.user;

      // Check if user document already exists in Firestore
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        // Create user document in Firestore with default values
        await setDoc(userRef, {
          uid: user.uid,
          fullName: user.displayName || "Google User",
          email: user.email || "",
          phone: user.phoneNumber || "",
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
        });
      } else {
        // Document exists, update updatedAt timestamp
        await setDoc(userRef, {
          updatedAt: new Date().toISOString(),
        }, { merge: true });
      }

      return user;
    } catch (error: any) {
      console.error("Google Sign-In DB Error:", error);
      throw new Error(`Google Authentication succeeded, but database setup failed: ${error.message}`);
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
  },

  async verifyOtp(confirmationResult: any, code: string) {
    try {
      const result = await confirmationResult.confirm(code);
      const user = result.user;

      // Check if user document already exists in Firestore
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        // Create user document in Firestore with default values
        await setDoc(userRef, {
          uid: user.uid,
          phone: user.phoneNumber || "",
          fullName: "Phone User",
          email: "",
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
        });
      } else {
        await setDoc(userRef, {
          updatedAt: new Date().toISOString(),
        }, { merge: true });
      }

      return user;
    } catch (error) {
      throw error;
    }
  }
};
