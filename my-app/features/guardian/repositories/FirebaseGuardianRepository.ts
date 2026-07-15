import { IGuardianRepository, Guardian } from '../interfaces/IGuardianRepository';
import { authService } from '../../../src/services/authService';

export class FirebaseGuardianRepository implements IGuardianRepository {
  async getRegisteredGuardians(userId: string): Promise<Guardian[]> {
    // console.log(`[FirebaseGuardianRepository] Fetching guardians from Firestore...`);
    const id = userId !== 'current_user' ? userId : authService.clerkUserId;
    if (!id) {
      console.warn('[FirebaseGuardianRepository] No authenticated user found. Returning mock Guardian for Hackathon Demo!');
      return [{
        id: 'mock_demo_guardian',
        userId: 'demo_user',
        name: 'Demo Guardian',
        phone: '+917870929584',
        relationship: 'Demo'
      }];
    }

    const profile = await authService.getUserProfile(id);
    
    if (profile && profile.trustedContacts && Array.isArray(profile.trustedContacts)) {
      const guardians = profile.trustedContacts.map((contact: any, index: number) => ({
        id: `fb_g_${index}`,
        userId: id,
        name: contact.name,
        phone: contact.phone || (contact.name && /\d/.test(contact.name) ? contact.name : ''),
        relationship: contact.relation || 'Family'
      })).filter((g: Guardian) => g.phone && g.phone.length >= 10);
      
      if (guardians.length > 0) return guardians;
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
