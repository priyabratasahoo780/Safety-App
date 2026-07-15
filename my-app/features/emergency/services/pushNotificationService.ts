import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../../../src/config/firebaseConfig';
import { socketService } from '../../../src/services/socketService';

export const pushNotificationService = {
  async sendEmergencyPushToGuardians(victimUserId: string, victimName: string): Promise<boolean> {
    try {
      // 1. Get all active guardians for this user
      const q = query(
        collection(db, 'guardianConnections'),
        where('protectedUserId', '==', victimUserId),
        where('status', '==', 'active')
      );
      
      const connectionsSnap = await getDocs(q);
      const guardianUserIds = connectionsSnap.docs.map(doc => doc.data().guardianUserId);
      
      if (guardianUserIds.length === 0) {
        // console.log('No guardians to notify via push.');
        return false;
      }

      // 2. Fetch push tokens for all those guardians
      const pushTokens: string[] = [];
      for (const guardianId of guardianUserIds) {
        const guardianDoc = await getDoc(doc(db, 'users', guardianId));
        if (guardianDoc.exists()) {
          const pushToken = guardianDoc.data().pushToken;
          if (pushToken) {
            pushTokens.push(pushToken);
          }
        }
      }

      // 2b. Trigger Socket.io Emergency directly
      socketService.triggerEmergency(victimUserId, victimName, guardianUserIds);

      if (pushTokens.length === 0) {
        // console.log('None of the guardians have a push token registered.');
        return false;
      }

      // 3. Send via secure backend endpoint
      const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://10.0.2.2:3000';
      
      const messages = pushTokens.map(token => ({
        to: token,
        sound: 'default',
        title: '🚨 EMERGENCY SOS TRIGGERED',
        body: `${victimName} is in danger! Tap here to view their live location.`,
        data: { 
          incidentUserId: victimUserId,
          type: 'emergency_alert'
        },
        priority: 'high',
      }));

      // console.log(`Sending push notification to ${messages.length} guardians via backend...`);
      
      const response = await fetch(`${BACKEND_URL}/api/notifications/send`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          // Auth header if needed by backend (dummy token for hackathon mode is okay)
          Authorization: 'Bearer hackathon_demo_user', 
        },
        body: JSON.stringify({ messages }),
      });

      const data = await response.json();
      // console.log('Backend Push API Response:', data);
      return true;

    } catch (error) {
      console.error('Error sending emergency push notifications via backend:', error);
      return false;
    }
  }
};
