import { DecisionEngine } from '../services/decision.service';
import { EmergencyService } from '../../emergency/services/emergency.service';
import { EmotionService } from '../services/emotion.service';
import { MicrophoneService } from '../services/microphone.service';
import { SpeechService } from '../services/speech.service';
import { SoundService } from '../services/sound.service';
import { WakeWordService } from '../services/wakeword.service';

import { FirebaseEmergencyRepository } from '../../emergency/repositories/FirebaseEmergencyRepository';
import { FirebaseGuardianRepository } from '../../guardian/repositories/FirebaseGuardianRepository';
import { FirebaseStorageService } from '../../emergency/repositories/FirebaseStorageService';
import { AudioEvidenceService } from '../services/evidence.service';
import { MockNotificationService } from '../../guardian/services/MockNotificationService';
import { TwilioService } from '../../adapters/providers/TwilioService';
import { TwilioCallService } from '../../adapters/providers/TwilioCallService';
import { sosLogger } from './logger';

export class ServiceLocator {
  private static instance: ServiceLocator | null = null;

  public readonly mic: MicrophoneService;
  public readonly wakeWord: WakeWordService;
  public readonly speech: SpeechService;
  public readonly emotion: EmotionService;
  public readonly sound: SoundService;
  public readonly decision: DecisionEngine;
  public readonly emergency: EmergencyService;

  private constructor() {
    sosLogger.info('ServiceLocator', 'Application Started - Initializing Services');

    this.mic = new MicrophoneService();
    this.wakeWord = new WakeWordService();
    this.speech = new SpeechService();
    this.emotion = new EmotionService();
    this.sound = new SoundService();
    this.decision = new DecisionEngine();

    sosLogger.info('ServiceLocator', 'Voice SOS Initialized (once)');

    this.emergency = new EmergencyService({
      emergencyRepo: new FirebaseEmergencyRepository(),
      storageService: new FirebaseStorageService(),
      evidenceService: new AudioEvidenceService(),
      guardianRepo: new FirebaseGuardianRepository(),
      notificationService: new MockNotificationService(),
      whatsAppService: new TwilioService(),
      smsService: new TwilioService(),
      emergencyCallingService: new TwilioCallService(),
    });

    sosLogger.info('ServiceLocator', 'EmergencyService Initialized (once)');
  }

  public static getInstance(): ServiceLocator {
    if (!ServiceLocator.instance) {
      ServiceLocator.instance = new ServiceLocator();
    } else {
      sosLogger.debug('ServiceLocator', 'Reusing existing instance');
      if (__DEV__) {
        console.log('Reusing existing instance');
      }
    }
    return ServiceLocator.instance;
  }
}
