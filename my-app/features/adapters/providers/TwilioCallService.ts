import { IEmergencyCallingService } from './IProviders';
import { sosLogger } from '../../voice-sos/utils/logger';
import { auth } from '../../../src/config/firebaseConfig';

const LOG_SOURCE = 'TwilioCallService';
const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:3000';

export class TwilioCallService implements IEmergencyCallingService {
  async triggerAutomatedCall(phoneNumbers: string[], textToSpeech: string): Promise<void> {
    sosLogger.info(LOG_SOURCE, 'Sending Emergency Call Request to Secure Node.js Backend...');
    
    try {
      const user = auth.currentUser;
      const idToken = user ? await user.getIdToken() : 'mock_token_for_unauthenticated_state';

      const response = await fetch(`${BACKEND_URL}/api/emergency/call`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({
          phones: phoneNumbers,
          message: textToSpeech
        })
      });
      
      if (!response.ok) {
         const err = await response.text();
         sosLogger.warn(LOG_SOURCE, 'Secure Backend Call API Error', { error: err });
      } else {
         sosLogger.info(LOG_SOURCE, 'Secure Backend processed emergency calls successfully');
      }
    } catch (e) {
      sosLogger.warn(LOG_SOURCE, 'Network error while calling Secure Backend for Voice Call', { error: String(e) });
    }
  }
}
