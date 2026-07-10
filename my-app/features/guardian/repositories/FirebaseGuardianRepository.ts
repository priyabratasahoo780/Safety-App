import { IGuardianRepository, Guardian } from '../interfaces/IGuardianRepository';
import { authService } from '../../../src/services/authService';

export class FirebaseGuardianRepository implements IGuardianRepository {
  async getRegisteredGuardians(userId: string): Promise<Guardian[]> {
    console.log(`[FirebaseGuardianRepository] Fetching guardians from Firestore...`);
    const profile = await authService.getUserProfile();
    
    if (profile && profile.trustedContacts && Array.isArray(profile.trustedContacts)) {
      return profile.trustedContacts.map((contact: any, index: number) => ({
        id: `fb_g_${index}`,
        userId: userId,
        name: contact.name,
        phone: contact.phone || '',
        relationship: contact.relation || 'Family'
      }));
    }
    
    // Fallback if no contacts found
    return [];
  }

  async addGuardian(userId: string, guardian: Omit<Guardian, 'id'>): Promise<Guardian> {
    throw new Error('Method not implemented. Use authService.updateUserProfile instead.');
  }

  async removeGuardian(guardianId: string): Promise<void> {
    throw new Error('Method not implemented. Use authService.updateUserProfile instead.');
  }
}
