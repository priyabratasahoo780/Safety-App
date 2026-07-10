export interface Guardian {
  id: string;
  userId: string;
  name: string;
  phone: string;
  relationship: string;
  fcmToken?: string;
}

/**
 * Interface for fetching and managing trusted guardians.
 */
export interface IGuardianRepository {
  /**
   * Fetch all registered guardians for a given user.
   */
  getRegisteredGuardians(userId: string): Promise<Guardian[]>;

  /**
   * Add a new guardian for the user.
   */
  addGuardian(userId: string, guardian: Omit<Guardian, 'id'>): Promise<Guardian>;

  /**
   * Remove a guardian.
   */
  removeGuardian(guardianId: string): Promise<void>;
}
