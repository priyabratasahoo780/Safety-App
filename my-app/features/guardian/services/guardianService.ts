import { collection, query, where, getDocs, doc, setDoc, getDoc, serverTimestamp, updateDoc, onSnapshot } from "firebase/firestore";
import { db } from "../../../src/config/firebaseConfig";

export interface GuardianRequest {
  id: string;
  requesterUserId: string;
  requesterName?: string;
  receiverUserId: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: any;
}

export interface GuardianConnection {
  id: string;
  protectedUserId: string;
  guardianUserId: string;
  status: 'active';
  createdAt: any;
}

export const guardianService = {
  // 1. Search for a user by exact SafeSphere ID
  async searchUserBySafeSphereId(safeSphereId: string) {
    if (!safeSphereId) return null;
    const q = query(
      collection(db, "users"),
      where("safeSphereId", "==", safeSphereId.trim().toUpperCase())
    );
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) return null;
    
    // Return only privacy-safe info
    const docData = querySnapshot.docs[0].data();
    return {
      uid: docData.uid,
      safeSphereId: docData.safeSphereId,
      fullName: docData.fullName || 'Unknown User',
    };
  },

  // 2. Send a Guardian Request
  async sendGuardianRequest(requesterId: string, requesterName: string, receiverId: string) {
    if (requesterId === receiverId) throw new Error("Cannot connect to yourself.");
    
    // Check if request already exists
    const q = query(
      collection(db, "guardianRequests"),
      where("requesterUserId", "==", requesterId),
      where("receiverUserId", "==", receiverId),
      where("status", "==", "pending")
    );
    const existing = await getDocs(q);
    if (!existing.empty) throw new Error("Request already sent.");

    const requestId = `${requesterId}_${receiverId}`;
    const reqRef = doc(db, "guardianRequests", requestId);
    await setDoc(reqRef, {
      id: requestId,
      requesterUserId: requesterId,
      requesterName: requesterName,
      receiverUserId: receiverId,
      status: 'pending',
      createdAt: serverTimestamp(),
    });
    return requestId;
  },

  // 3. Accept a Guardian Request
  async acceptGuardianRequest(requestId: string, protectedUserId: string, guardianUserId: string) {
    const reqRef = doc(db, "guardianRequests", requestId);
    await updateDoc(reqRef, { status: 'accepted' });

    // Create the actual connection
    const connId = `${protectedUserId}_${guardianUserId}`;
    const connRef = doc(db, "guardianConnections", connId);
    await setDoc(connRef, {
      id: connId,
      protectedUserId: protectedUserId,
      guardianUserId: guardianUserId,
      status: 'active',
      createdAt: serverTimestamp(),
    });
    
    return connId;
  },

  // 4. Reject Request
  async rejectGuardianRequest(requestId: string) {
    const reqRef = doc(db, "guardianRequests", requestId);
    await updateDoc(reqRef, { status: 'rejected' });
  }
};
