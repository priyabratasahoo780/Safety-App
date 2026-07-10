import { IGuardianRepository, Guardian } from '../interfaces/IGuardianRepository';
import { authService } from '../../../src/services/authService';
import { auth } from '../../../src/config/firebaseConfig';

export class FirebaseGuardianRepository implements IGuardianRepository {
  async getRegisteredGuardians(userId: string): Promise<Guardian[]> {
    console.log(`[FirebaseGuardianRepository] Fetching guardians from Firestore...`);
    const user = auth.currentUser;
    if (!user) {
      console.warn('[FirebaseGuardianRepository] No authenticated user found.');
      return [];
    }

    const profile = await authService.getUserProfile();
    
    if (profile && profile.trustedContacts && Array.isArray(profile.trustedContacts)) {
      return profile.trustedContacts.map((contact: any, index: number) => ({
        id: `fb_g_${index}`,
        userId: user.uid,
        name: contact.name,
        phone: contact.phone || (contact.name && /\d/.test(contact.name) ? contact.name : ''),
        relationship: contact.relation || 'Family'
      })).filter((g: Guardian) => g.phone && g.phone.length >= 10);
    }
    
    return [];
  }

  async addGuardian(userId: string, guardian: Omit<Guardian, 'id'>): Promise<Guardian> {
    throw new Error('Method not implemented. Use authService.updateUserProfile instead.');
  }

  async removeGuardian(guardianId: string): Promise<void> {
    throw new Error('Method not implemented. Use authService.updateUserProfile instead.');
  }
}
