import { collection, doc, setDoc, getDocs, query, where, updateDoc, onSnapshot, getDoc } from "firebase/firestore";
import { db } from "../config/firebaseConfig";
import { authService } from "./authService";

export interface GuardianRequest {
  id: string;
  fromUserId: string;
  fromSafeSphereId: string;
  fromName: string;
  fromPhone: string;
  toUserId: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}

export const guardianService = {
  // Find a user by their SafeSphere ID
  async findUserBySafeSphereId(safeSphereId: string) {
    const q = query(collection(db, 'users'), where('safeSphereId', '==', safeSphereId));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    return snapshot.docs[0].data();
  },

  // Send a guardian request to a user via their SafeSphere ID
  async sendRequest(toSafeSphereId: string) {
    try {
      const currentUserProfile = await authService.getUserProfile();
      if (!currentUserProfile || !currentUserProfile.uid) {
        throw new Error("You must be logged in to send a request.");
      }

      if (currentUserProfile.safeSphereId === toSafeSphereId) {
        throw new Error("You cannot send a guardian request to yourself.");
      }

      const targetUser = await this.findUserBySafeSphereId(toSafeSphereId);
      if (!targetUser || !targetUser.uid) {
        throw new Error("No user found with that SafeSphere ID.");
      }

      // Check for duplicate pending/accepted requests
      const duplicateQuery = query(
        collection(db, 'guardian_requests'),
        where('fromUserId', '==', currentUserProfile.uid),
        where('toUserId', '==', targetUser.uid)
      );
      const duplicateSnapshot = await getDocs(duplicateQuery);
      if (!duplicateSnapshot.empty) {
        const existing = duplicateSnapshot.docs[0].data();
        if (existing.status === 'pending') throw new Error("A pending request already exists for this user.");
        if (existing.status === 'accepted') throw new Error("You are already connected to this user.");
      }

      const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
      const request: GuardianRequest = {
        id: requestId,
        fromUserId: currentUserProfile.uid,
        fromSafeSphereId: currentUserProfile.safeSphereId,
        fromName: currentUserProfile.fullName || "Unknown User",
        fromPhone: currentUserProfile.phone || "",
        toUserId: targetUser.uid,
        status: 'pending',
        createdAt: new Date().toISOString(),
      };

      await setDoc(doc(db, 'guardian_requests', requestId), request);
      return request;
    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  // Accept a guardian request
  async acceptRequest(request: GuardianRequest) {
    try {
      // 1. Update request status
      const requestRef = doc(db, 'guardian_requests', request.id);
      const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://10.0.2.2:3000';
      const response = await fetch(`${BACKEND_URL}/api/guardians/accept`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer hackathon_demo_user',
        },
        body: JSON.stringify({ request }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to accept guardian request securely');
      }

      return true;
    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  // Reject a guardian request
  async rejectRequest(requestId: string) {
    try {
      await updateDoc(doc(db, 'guardian_requests', requestId), { status: 'rejected' });
      return true;
    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  // Listen to pending requests for the current user
  subscribeToPendingRequests(userId: string, callback: (requests: GuardianRequest[]) => void) {
    const q = query(
      collection(db, 'guardian_requests'),
      where('toUserId', '==', userId),
      where('status', '==', 'pending')
    );

    return onSnapshot(q, (snapshot) => {
      const requests: GuardianRequest[] = [];
      snapshot.forEach(doc => {
        requests.push(doc.data() as GuardianRequest);
      });
      callback(requests);
    }, (error) => {
      console.warn("Failed to subscribe to requests:", error);
    });
  }
};
