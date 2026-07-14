import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../../../src/config/firebaseConfig';

export const pushNotificationService = {
  async sendEmergencyPushToGuardians(victimUserId: string, victimName: string) {
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
        console.log('No guardians to notify via push.');
        return;
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

      if (pushTokens.length === 0) {
        console.log('None of the guardians have a push token registered.');
        return;
      }

      // 3. Send via Expo Push API
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

      console.log(`Sending push notification to ${messages.length} guardians...`);
      
      const response = await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Accept-encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(messages),
      });

      const data = await response.json();
      console.log('Expo Push API Response:', data);

    } catch (error) {
      console.error('Error sending emergency push notifications:', error);
    }
  }
};
