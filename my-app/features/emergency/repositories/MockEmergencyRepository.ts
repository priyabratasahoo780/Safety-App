import { IEmergencyRepository } from '../interfaces/IEmergencyRepository';
import { EmergencyEvent, EmergencyStatus } from '../types/emergency.types';

export class MockEmergencyRepository implements IEmergencyRepository {
  private memoryDb: Map<string, EmergencyEvent> = new Map();

  async createEmergencySession(event: EmergencyEvent): Promise<void> {
    // console.log(`[MockEmergencyRepository] Creating Emergency Session: ${event.id}`);
    this.memoryDb.set(event.id, event);
  }

  async updateEmergencySession(id: string, updates: Partial<EmergencyEvent>): Promise<void> {
    // console.log(`[MockEmergencyRepository] Updating Emergency Session: ${id}`, updates);
    const existing = this.memoryDb.get(id);
    if (existing) {
      this.memoryDb.set(id, { ...existing, ...updates });
    }
  }

  async resolveEmergencySession(id: string, reason: string): Promise<void> {
    // console.log(`[MockEmergencyRepository] Resolving Emergency Session: ${id} - Reason: ${reason}`);
    const existing = this.memoryDb.get(id);
    if (existing) {
      existing.status = EmergencyStatus.RESOLVED;
      this.memoryDb.set(id, existing);
    }
  }

  async getActiveEmergencyForUser(userId: string): Promise<EmergencyEvent | null> {
    for (const [_, event] of this.memoryDb.entries()) {
      if (event.id.includes(userId) && event.status === EmergencyStatus.EMERGENCY) {
        return event;
      }
    }
    return null;
  }
}
