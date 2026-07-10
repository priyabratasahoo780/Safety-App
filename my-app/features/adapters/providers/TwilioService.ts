import { EmergencyEvent } from '../../emergency/types/emergency.types';
import { IWhatsAppService, ISMSService } from './IProviders';
import { Platform, NativeModules } from 'react-native';
import { sosLogger } from '../../voice-sos/utils/logger';

const LOG_SOURCE = 'TwilioService';

export class TwilioService implements IWhatsAppService, ISMSService {
  private accountSid = process.env.EXPO_PUBLIC_TWILIO_ACCOUNT_SID || 'AC_dummy_sid';
  private authToken = process.env.EXPO_PUBLIC_TWILIO_AUTH_TOKEN || 'dummy_auth';
  private twilioNumber = process.env.EXPO_PUBLIC_TWILIO_PHONE_NUMBER || '+1234567890';
  private twilioWhatsAppNumber = process.env.EXPO_PUBLIC_TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886';

  async sendWhatsAppAlert(phoneNumbers: string[], event: EmergencyEvent): Promise<void> {
    sosLogger.info(LOG_SOURCE, 'Sending real Twilio WhatsApp API Request...');
    
    // Prefer the structured JSON payload if available, else fallback to custom string message
    const rawPayload = (event as any).payload || (event as any).customMessage || 'Emergency!';
    
    let msg = '';
    if ((event as any).customMessage) {
        msg = (event as any).customMessage;
    } else if (typeof rawPayload === 'object') {
        msg = JSON.stringify(rawPayload, null, 2);
    } else {
        msg = rawPayload;
    }

    for (const phone of phoneNumbers) {
      const to = phone.startsWith('+') ? phone : `+91${phone.replace(/[^0-9]/g, '')}`;
      if (!to || to === '+91') continue;

      const details = {
        To: `whatsapp:${to}`,
        From: this.twilioWhatsAppNumber,
        Body: msg,
      };

      const formBody = Object.keys(details)
        .map(key => encodeURIComponent(key) + '=' + encodeURIComponent((details as any)[key]))
        .join('&');

      try {
        const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${this.accountSid}/Messages.json`, {
          method: 'POST',
          headers: {
            'Authorization': 'Basic ' + btoa(`${this.accountSid}:${this.authToken}`),
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: formBody
        });
        
        if (!response.ok) {
           const err = await response.text();
           sosLogger.warn(LOG_SOURCE, 'Twilio WhatsApp API Error', { error: err });
        } else {
           sosLogger.info(LOG_SOURCE, 'Twilio WhatsApp Message sent successfully to ' + to);
        }
      } catch (e) {
        sosLogger.warn(LOG_SOURCE, 'Network error while calling Twilio', { error: String(e) });
      }
    }
  }

  async sendOfflineSMS(phoneNumbers: string[], event: EmergencyEvent): Promise<void> {
    sosLogger.info(LOG_SOURCE, 'Evaluating SMS routing...');
    
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
        sosLogger.warn(LOG_SOURCE, 'Native SMS failed. Falling back to Twilio API.', { error: String(e) });
      }
    }

    sosLogger.info(LOG_SOURCE, 'Native SMS unavailable. Routing to backend Twilio SMS API...');

    for (const phone of phoneNumbers) {
      const to = phone.startsWith('+') ? phone : `+91${phone.replace(/[^0-9]/g, '')}`;
      if (!to || to === '+91') continue;

      const details = {
        To: to,
        From: this.twilioNumber,
        Body: msg,
      };

      const formBody = Object.keys(details)
        .map(key => encodeURIComponent(key) + '=' + encodeURIComponent((details as any)[key]))
        .join('&');

      try {
        const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${this.accountSid}/Messages.json`, {
          method: 'POST',
          headers: {
            'Authorization': 'Basic ' + btoa(`${this.accountSid}:${this.authToken}`),
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: formBody
        });
        
        if (!response.ok) {
           const err = await response.text();
           sosLogger.warn(LOG_SOURCE, 'Twilio SMS API Error', { error: err });
        } else {
           sosLogger.info(LOG_SOURCE, 'Twilio SMS sent successfully to ' + to);
        }
      } catch (e) {
        sosLogger.warn(LOG_SOURCE, 'Network error while calling Twilio SMS', { error: String(e) });
      }
    }
  }
}
