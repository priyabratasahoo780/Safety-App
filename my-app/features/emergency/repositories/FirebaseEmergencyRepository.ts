import { IEmergencyRepository } from '../interfaces/IEmergencyRepository';
import { EmergencyEvent, EmergencyStatus } from '../types/emergency.types';
import { doc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../../src/config/firebaseConfig';
import { sosLogger } from '../../voice-sos/utils/logger';

const LOG_SOURCE = 'FirebaseEmergencyRepo';

export class FirebaseEmergencyRepository implements IEmergencyRepository {
  async createEmergencySession(event: EmergencyEvent): Promise<void> {
    try {
      const emergencyRef = doc(db, 'emergencies', event.id);
      await setDoc(emergencyRef, {
        ...event,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      sosLogger.info(LOG_SOURCE, `Created real emergency session in Firestore: ${event.id}`);
    } catch (error) {
      sosLogger.warn(LOG_SOURCE, 'Failed to create emergency session in Firestore', { error });
    }
  }

  async updateEmergencySession(id: string, updates: Partial<EmergencyEvent>): Promise<void> {
    try {
      const emergencyRef = doc(db, 'emergencies', id);
      // CRITICAL FIX: Use setDoc with merge: true to avoid 'No document to update' errors
      // if the background update happens before the initial create finishes.
      await setDoc(emergencyRef, {
        ...updates,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      sosLogger.info(LOG_SOURCE, `Updated emergency session in Firestore: ${id}`);
    } catch (error) {
      sosLogger.warn(LOG_SOURCE, 'Failed to update emergency session in Firestore', { error: String(error) });
    }
  }

  async resolveEmergencySession(id: string, resolutionNotes?: string): Promise<void> {
    try {
      const emergencyRef = doc(db, 'emergencies', id);
      await updateDoc(emergencyRef, {
        status: EmergencyStatus.RESOLVED,
        resolvedAt: new Date().toISOString(),
        resolutionNotes,
        updatedAt: new Date().toISOString()
      });
      sosLogger.info(LOG_SOURCE, `Resolved emergency session in Firestore: ${id}`);
    } catch (error) {
      sosLogger.warn(LOG_SOURCE, 'Failed to resolve emergency session in Firestore', { error });
    }
  }

  async getActiveEmergencyForUser(userId: string): Promise<EmergencyEvent | null> {
    // Basic implementation, a real one would query Firestore where userId == userId and status == 'EMERGENCY'
    return null;
  }
}
