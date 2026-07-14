import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../../../src/config/firebaseConfig';
import { SOSIncident, sosIncidentService } from '../services/sosIncidentService';
import { useAuth } from '@clerk/clerk-expo';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';

export const useEmergencyListener = () => {
  const { userId } = useAuth();
  const router = useRouter();
  const [protectedUserIds, setProtectedUserIds] = useState<string[]>([]);
  const [activeIncidents, setActiveIncidents] = useState<SOSIncident[]>([]);
  // Keep track of alerted incidents to prevent spamming
  const [alertedIncidentIds, setAlertedIncidentIds] = useState<Set<string>>(new Set());

  // 1. Fetch all users who I am a guardian for
  useEffect(() => {
    if (!userId) return;

    const q = query(
      collection(db, 'guardianConnections'),
      where('guardianUserId', '==', userId),
      where('status', '==', 'active')
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const ids = snapshot.docs
        .map(doc => doc.data().protectedUserId as string)
        .filter(Boolean);
      setProtectedUserIds(ids);
    });

    return () => unsub();
  }, [userId]);

  // 2. Listen to active incidents for those users
  useEffect(() => {
    if (protectedUserIds.length === 0) return;

    const unsub = sosIncidentService.listenToActiveIncidents(protectedUserIds, (incidents) => {
      setActiveIncidents(incidents);
      
      // Alert for any NEW incidents
      incidents.forEach(incident => {
        if (!alertedIncidentIds.has(incident.id)) {
          // Add to alerted set
          setAlertedIncidentIds(prev => new Set(prev).add(incident.id));
          
          // Show Alert
          Alert.alert(
            "🚨 EMERGENCY SOS TRIGGERED",
            "Someone you are protecting has triggered an SOS! Tap View to track their live location.",
            [
              { text: "Dismiss", style: "cancel" },
              { 
                text: "View Live", 
                style: "destructive",
                onPress: () => router.push(`/guardian/tracking/${incident.id}` as any)
              }
            ]
          );
        }
      });
    });

    return () => unsub();
  }, [protectedUserIds, alertedIncidentIds, router]);

  return { activeIncidents };
};
