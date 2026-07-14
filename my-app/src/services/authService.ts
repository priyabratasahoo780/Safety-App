import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../config/firebaseConfig";
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

export const authService = {
  clerkUserId: null as string | null,
  clerkToken: null as string | null,

  // Generate a unique 8-character ID: SSF-XXXX-XXXX (avoiding 0,O,1,I)
  generateSafeSphereId() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let result = 'SSF-';
    for (let i = 0; i < 4; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
    result += '-';
    for (let i = 0; i < 4; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
    return result;
  },

  // Create initial user profile in Firestore after Clerk signup
  async createUserProfile(userId: string, email: string, fullName: string, password?: string) {
    try {
      this.clerkUserId = userId;
      const userRef = doc(db, "users", userId);
      
      const safeSphereId = this.generateSafeSphereId();
      const profileData = {
        uid: userId,
        safeSphereId,
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
      };

      await setDoc(userRef, profileData, { merge: true });
      return { uid: userId };
    } catch (error: any) {
      console.error("Firestore Error:", error);
      throw new Error(`Database Error: ${error.message}`);
    }
  },

  // Update User Profile (Safety Info, Contacts, etc.)
  async updateUserProfile(userIdOrData: any, data?: any) {
    try {
      let id = this.clerkUserId;
      let finalData = userIdOrData;

      if (data !== undefined) {
        id = userIdOrData;
        finalData = data;
      }

      if (!id) throw new Error("No user ID available for profile update");

      const userRef = doc(db, "users", id);
      await setDoc(userRef, {
        ...finalData,
        updatedAt: new Date().toISOString(),
      }, { merge: true });
    } catch (error) {
      console.error("Error updating user profile:", error);
      throw error;
    }
  },

  // Get User Profile (including trusted contacts)
  async getUserProfile(userId?: string) {
    try {
      const id = userId || this.clerkUserId;
      if (!id) return null;

      const userDoc = await getDoc(doc(db, "users", id));
      if (!userDoc.exists()) return null;
      
      const data = userDoc.data();
      // Lazily generate safeSphereId for existing users who don't have one
      if (!data.safeSphereId) {
        const safeSphereId = this.generateSafeSphereId();
        await setDoc(doc(db, "users", id), { safeSphereId }, { merge: true });
        data.safeSphereId = safeSphereId;
      }
      return data;
    } catch (error) {
      console.error("Error fetching user profile:", error);
      return null;
    }
  },

  // Push Notifications Setup
  async registerForPushNotificationsAsync(userId?: string) {
    const id = userId || this.clerkUserId;
    if (!id) return null;

    let token;
    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        console.log('Failed to get push token for push notification!');
        return null;
      }
      const projectId =
        Constants?.expoConfig?.extra?.eas?.projectId ?? 
        Constants?.easConfig?.projectId ??
        'e1322fda-e0a9-422b-8939-f1578855c136';
      
      if (!projectId) {
        console.warn('Project ID not found');
      }
      
      try {
        if (Constants.appOwnership !== 'expo') {
          token = (await Notifications.getExpoPushTokenAsync({
            projectId,
          })).data;
        } else {
          console.log('Skipping push token registration in Expo Go (removed in SDK 53). Use development build.');
        }
      } catch (e) {
        console.warn('Failed to get push token:', e);
      }
    } else {
      console.log('Must use physical device for Push Notifications');
    }

    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    if (token) {
      await updateDoc(doc(db, "users", id), { pushToken: token });
    }
    return token;
  },

  // Log out user
  async logout() {
    this.clerkUserId = null;
    this.clerkToken = null;
  }
};
