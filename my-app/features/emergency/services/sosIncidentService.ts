import { collection, query, where, getDocs, doc, setDoc, updateDoc, serverTimestamp, onSnapshot, getDoc } from "firebase/firestore";
import { db } from "../../../src/config/firebaseConfig";

export interface SOSIncident {
  id: string;
  protectedUserId: string;
  status: 'active' | 'ended';
  activatedAt: any;
  endedAt?: any;
  latestLocation?: any;
  evidenceStatus?: 'pending' | 'recording' | 'uploading' | 'uploaded' | 'failed';
}

export const sosIncidentService = {
  // 1. Create a new SOS Incident immediately upon activation
  async createIncident(protectedUserId: string) {
    if (!protectedUserId) return null;
    
    // Create a new incident document
    const incidentRef = doc(collection(db, "sosIncidents"));
    const incidentId = incidentRef.id;

    await setDoc(incidentRef, {
      id: incidentId,
      protectedUserId,
      status: 'active',
      activatedAt: serverTimestamp(),
      evidenceStatus: 'pending'
    });

    return incidentId;
  },

  // 2. End the SOS Incident
  async endIncident(incidentId: string) {
    if (!incidentId) return;
    const incidentRef = doc(db, "sosIncidents", incidentId);
    await updateDoc(incidentRef, {
      status: 'ended',
      endedAt: serverTimestamp()
    });
  },

  // 3. Update the location for this specific incident (so Guardians can track in real-time)
  async updateLocation(incidentId: string, locationData: any) {
    if (!incidentId || !locationData) return;
    
    // Update the incident document with the latest location for quick reading
    const incidentRef = doc(db, "sosIncidents", incidentId);
    await updateDoc(incidentRef, {
      latestLocation: {
        latitude: locationData.coords.latitude,
        longitude: locationData.coords.longitude,
        accuracy: locationData.coords.accuracy,
        timestamp: locationData.timestamp || Date.now()
      },
      locationUpdatedAt: serverTimestamp()
    });

    // Also push to a sub-collection for historical mapping if needed
    const locUpdateRef = doc(collection(db, `sosIncidents/${incidentId}/sosLocationUpdates`));
    await setDoc(locUpdateRef, {
      ...locationData,
      createdAt: serverTimestamp()
    });
  },

  // 4. Update evidence status (e.g., video URL uploaded)
  async updateEvidenceStatus(incidentId: string, status: string, downloadUrl?: string) {
    if (!incidentId) return;
    const updateData: any = { evidenceStatus: status };
    if (downloadUrl) {
      updateData.evidenceUrl = downloadUrl;
    }
    const incidentRef = doc(db, "sosIncidents", incidentId);
    await updateDoc(incidentRef, updateData);
  },

  // 5. Subscribe to a specific incident for real-time tracking
  listenToIncident(incidentId: string, callback: (incident: SOSIncident | null) => void) {
    const incidentRef = doc(db, "sosIncidents", incidentId);
    return onSnapshot(incidentRef, (docSnap) => {
      if (docSnap.exists()) {
        callback(docSnap.data() as SOSIncident);
      } else {
        callback(null);
      }
    });
  },

  // 6. Listen for active incidents for a list of protected users
  listenToActiveIncidents(protectedUserIds: string[], callback: (incidents: SOSIncident[]) => void) {
    const validIds = (protectedUserIds || []).filter(Boolean);
    if (validIds.length === 0) {
      // Nothing to listen to
      callback([]);
      return () => {};
    }

    // Firestore `in` query is limited to 10. If a user has >10 guardians, we need chunking, 
    // but for simplicity, we assume <10 active connections.
    const chunks = [];
    for (let i = 0; i < validIds.length; i += 10) {
      chunks.push(validIds.slice(i, i + 10));
    }

    const unsubscribes = chunks.map(chunk => {
      const q = query(
        collection(db, "sosIncidents"),
        where("protectedUserId", "in", chunk),
        where("status", "==", "active")
      );
      return onSnapshot(q, (snapshot) => {
        const incidents: SOSIncident[] = [];
        snapshot.forEach((doc) => incidents.push(doc.data() as SOSIncident));
        callback(incidents);
      });
    });

    return () => {
      unsubscribes.forEach(unsub => unsub());
    };
  }
};
