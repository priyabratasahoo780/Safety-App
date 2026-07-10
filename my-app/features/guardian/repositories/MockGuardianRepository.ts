import { IGuardianRepository, Guardian } from '../interfaces/IGuardianRepository';

export class MockGuardianRepository implements IGuardianRepository {
  private memoryDb: Guardian[] = [
    { id: 'g1', userId: 'u1', name: 'Papa', phone: '+919876543210', relationship: 'Father' },
    { id: 'g2', userId: 'u1', name: 'Brother', phone: '+919876543211', relationship: 'Brother' },
  ];

  async getRegisteredGuardians(userId: string): Promise<Guardian[]> {
    console.log(`[MockGuardianRepository] Fetching guardians for user: ${userId}`);
    return this.memoryDb.filter(g => g.userId === userId || userId === 'default');
  }

  async addGuardian(userId: string, guardian: Omit<Guardian, 'id'>): Promise<Guardian> {
    const newGuardian = { ...guardian, id: `g${Date.now()}`, userId };
    this.memoryDb.push(newGuardian);
    return newGuardian;
  }

  async removeGuardian(guardianId: string): Promise<void> {
    this.memoryDb = this.memoryDb.filter(g => g.id !== guardianId);
  }
}
