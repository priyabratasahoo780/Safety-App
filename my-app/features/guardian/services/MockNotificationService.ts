import { INotificationService } from '../interfaces/INotificationService';
import { Guardian } from '../interfaces/IGuardianRepository';
import { EmergencyEvent } from '../../emergency/types/emergency.types';

export class MockNotificationService implements INotificationService {
  async sendEmergencyAlert(guardians: Guardian[], event: EmergencyEvent): Promise<void> {
    // console.log(`[MockNotificationService] 🚨 Dispatching EMERGENCY ALERT to ${guardians.length} guardians for user!`);
    guardians.forEach(g => {
      // console.log(` -> SMS/Push sent to ${g.name} (${g.phone}): "Emergency detected at ${event.location?.latitude}, ${event.location?.longitude}."`);
    });
  }

  async sendLocationUpdate(guardians: Guardian[], eventId: string, latitude: number, longitude: number): Promise<void> {
    // console.log(`[MockNotificationService] 📍 Live Location Update for Emergency ${eventId}: ${latitude}, ${longitude}`);
  }

  async sendResolutionAlert(guardians: Guardian[], eventId: string, reason: string): Promise<void> {
    // console.log(`[MockNotificationService] ✅ Emergency ${eventId} resolved. Reason: ${reason}`);
    guardians.forEach(g => {
      // console.log(` -> Sent to ${g.name}: "User has marked themselves as safe."`);
    });
  }
}
