import { EmergencyEvent } from '../../emergency/types/emergency.types';

export interface IWhatsAppService {
  sendWhatsAppAlert(phoneNumbers: string[], event: EmergencyEvent): Promise<void>;
}

export interface ISMSService {
  sendOfflineSMS(phoneNumbers: string[], event: EmergencyEvent): Promise<void>;
}

export interface IEmergencyCallingService {
  triggerAutomatedCall(phoneNumbers: string[], textToSpeech: string): Promise<void>;
}
