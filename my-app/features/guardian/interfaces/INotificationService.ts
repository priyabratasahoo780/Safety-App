import { EmergencyEvent } from '../../emergency/types/emergency.types';
import { Guardian } from './IGuardianRepository';

/**
 * Interface for dispatching notifications (e.g. Firebase Cloud Messaging, Twilio).
 */
export interface INotificationService {
  /**
   * Dispatch an emergency alert to a list of guardians.
   * @param guardians The list of trusted guardians to notify.
   * @param event The emergency event data.
   */
  sendEmergencyAlert(guardians: Guardian[], event: EmergencyEvent): Promise<void>;

  /**
   * Send a system or silent update to guardians (e.g. location changed).
   */
  sendLocationUpdate(guardians: Guardian[], eventId: string, latitude: number, longitude: number): Promise<void>;

  /**
   * Notify guardians that an emergency has been resolved or cancelled.
   */
  sendResolutionAlert(guardians: Guardian[], eventId: string, reason: string): Promise<void>;
}
