import { EmergencyEvent } from '../../emergency/types/emergency.types';
import { IWhatsAppService, ISMSService } from './IProviders';
import { Platform, NativeModules } from 'react-native';
import { sosLogger } from '../../voice-sos/utils/logger';
import { auth } from '../../../src/config/firebaseConfig';

const LOG_SOURCE = 'TwilioService';

// Backend URL configurable via env var. Fallbacks based on environment.
const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:3000';

export class TwilioService implements IWhatsAppService, ISMSService {

  async sendWhatsAppAlert(phoneNumbers: string[], event: EmergencyEvent): Promise<void> {
    sosLogger.info(LOG_SOURCE, 'Sending Emergency Request to Secure Node.js Backend...');
    
    const rawPayload = (event as any).payload || (event as any).customMessage || 'Emergency!';
    let msg = '';
    if ((event as any).customMessage) {
        msg = (event as any).customMessage;
    } else if (typeof rawPayload === 'object') {
        msg = JSON.stringify(rawPayload, null, 2);
    } else {
        msg = rawPayload;
    }

    try {
      const user = auth.currentUser;
      if (!user) {
         sosLogger.warn(LOG_SOURCE, 'No authenticated user found. Aborting secure dispatch.');
         return;
      }
      
      const idToken = await user.getIdToken();

      const response = await fetch(`${BACKEND_URL}/api/emergency/dispatch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({
          phones: phoneNumbers,
          payload: (event as any).payload || {},
          customMessage: msg
        })
      });
      
      if (!response.ok) {
         const err = await response.text();
         sosLogger.warn(LOG_SOURCE, 'Secure Backend API Error', { error: err });
      } else {
         const data = await response.json();
         sosLogger.info(LOG_SOURCE, 'Secure Backend processed emergency dispatch successfully', { results: data.results });
      }
    } catch (e) {
      sosLogger.warn(LOG_SOURCE, 'Network error while calling Secure Backend', { error: String(e) });
      // Fallback to Native SMS if Backend is totally unreachable
      sosLogger.info(LOG_SOURCE, 'Attempting Native SMS fallback due to Backend failure...');
      await this.sendOfflineSMS(phoneNumbers, event);
    }
  }

  async sendOfflineSMS(phoneNumbers: string[], event: EmergencyEvent): Promise<void> {
    sosLogger.info(LOG_SOURCE, 'Evaluating offline/native SMS routing...');
    
    let msg = '';
    if ((event as any).customMessage) {
        msg = (event as any).customMessage;
    } else if ((event as any).payload) {
        msg = JSON.stringify((event as any).payload, null, 2);
    } else {
        msg = 'Emergency!';
    }

    // Check for Native Android Direct SMS Module
    if (Platform.OS === 'android' && NativeModules.DirectSms) {
      sosLogger.info(LOG_SOURCE, 'Android Native Direct SMS available. Dispatching silently...');
      try {
        for (const phone of phoneNumbers) {
          const cleanPhone = phone.replace(/[^0-9+]/g, '');
          if(cleanPhone) {
             NativeModules.DirectSms.sendDirectSms(cleanPhone, msg);
          }
        }
        return;
      } catch (e) {
        sosLogger.warn(LOG_SOURCE, 'Native SMS failed. Falling back to secure backend SMS.', { error: String(e) });
      }
    } else {
       sosLogger.info(LOG_SOURCE, 'Native SMS unavailable. Routing to backend Twilio SMS API...');
    }

    // Backend Fallback for SMS
    try {
      const user = auth.currentUser;
      if (!user) {
         sosLogger.warn(LOG_SOURCE, 'No authenticated user found. Aborting secure SMS dispatch.');
         return;
      }
      const idToken = await user.getIdToken();

      const response = await fetch(`${BACKEND_URL}/api/emergency/dispatch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({
          phones: phoneNumbers,
          payload: (event as any).payload || {},
          customMessage: msg,
          type: 'sms' // Tell backend to force SMS mode
        })
      });
      
      if (!response.ok) {
         const err = await response.text();
         sosLogger.warn(LOG_SOURCE, 'Secure Backend SMS API Error', { error: err });
      } else {
         sosLogger.info(LOG_SOURCE, 'Secure Backend processed emergency SMS successfully');
      }
    } catch (e) {
      sosLogger.warn(LOG_SOURCE, 'Network error while calling Secure Backend for SMS', { error: String(e) });
    }
  }
}
