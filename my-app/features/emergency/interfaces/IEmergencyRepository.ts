import { EmergencyEvent } from '../types/emergency.types';

/**
 * Repository interface for managing Emergency sessions.
 * Independent of the underlying database (e.g. Firebase, MongoDB).
 */
export interface IEmergencyRepository {
  /**
   * Creates a new emergency session in the database.
   */
  createEmergencySession(event: EmergencyEvent): Promise<void>;

  /**
   * Updates an existing emergency session with new data.
   */
  updateEmergencySession(id: string, updates: Partial<EmergencyEvent>): Promise<void>;

  /**
   * Resolves or cancels an emergency session.
   */
  resolveEmergencySession(id: string, reason: string): Promise<void>;

  /**
   * Retrieves an active emergency session by user ID.
   */
  getActiveEmergencyForUser(userId: string): Promise<EmergencyEvent | null>;
}
