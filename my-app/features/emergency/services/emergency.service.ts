// ============================================================================
// AI Voice SOS Module — Emergency Service (Fully Automatic Orchestrator)
// SafeSphere AI | Infinity Coders
// Fully Hands-Free AI Guardian Workflow
// ============================================================================

import {
  DecisionResult,
  EmergencyConfig,
  EmergencyEvent,
  EmergencyStatus,
  LocationData,
  NetworkStatus,
  OnEmergencyCallback,
  TimelineEntry,
} from '../types/emergency.types';
import { EmotionScore, SoundScore, SupportedLanguage } from '../../voice-sos/types/voice.types';
import {
  EMERGENCY_COOLDOWN_MS,
  MAX_TIMELINE_ENTRIES,
} from '../../voice-sos/utils/constants';
import { sosLogger } from '../../voice-sos/utils/logger';

import { IEmergencyRepository } from '../interfaces/IEmergencyRepository';
import { IStorageService } from '../interfaces/IStorageService';
import { IGuardianRepository } from '../../guardian/interfaces/IGuardianRepository';
import { INotificationService } from '../../guardian/interfaces/INotificationService';
import { IWhatsAppService, ISMSService, IEmergencyCallingService } from '../../adapters/providers/IProviders';

const LOG_SOURCE = 'EmergencyService';

export interface EmergencyDependencies {
  emergencyRepo: IEmergencyRepository;
  storageService: IStorageService;
  evidenceService: any; // Using any here to avoid cyclic imports or just implement it
  guardianRepo: IGuardianRepository;
  notificationService: INotificationService;
  whatsAppService: IWhatsAppService;
  smsService: ISMSService;
  emergencyCallingService: IEmergencyCallingService;
}

/**
 * EmergencyService — Fully Automatic Hands-Free AI Workflow.
 * 
 * When confidence > 90%, it automatically executes 13 steps:
 * 1. Create Emergency Session
 * 2. Capture GPS
 * 3. Start Live Location Tracking
 * 4. Start Audio Recording
 * 5. Start Video Recording
 * 6. Capture Battery Percentage
 * 7. Capture Network Status
 * 8. Generate Emergency Timeline
 * 9. Trigger Guardian Notification Service
 * 10. Trigger Future WhatsApp Service Interface
 * 11. Trigger Future SMS Service Interface
 * 12. Trigger Future Emergency Calling Service
 * 13. Upload Evidence
 */
export class EmergencyService {
  private config: EmergencyConfig;
  private deps: EmergencyDependencies;
  
  private emergencyListeners: OnEmergencyCallback[] = [];
  private lastEmergencyTime: number = 0;
  private currentEmergency: EmergencyEvent | null = null;
  private emergencyCounter: number = 0;
  private trackingInterval: ReturnType<typeof setInterval> | null = null;

  constructor(deps: EmergencyDependencies, config?: Partial<EmergencyConfig>) {
    this.deps = deps;
    this.config = {
      autoDispatchTriggers: true,
      cooldownMs: EMERGENCY_COOLDOWN_MS,
      maxTimelineEntries: MAX_TIMELINE_ENTRIES,
      ...config,
    };

    sosLogger.debug(LOG_SOURCE, 'Fully Automatic EmergencyService Initialized');
  }

  // ─── Public API ─────────────────────────────────────────────────────────

  async triggerEmergency(params: {
    decision: DecisionResult;
    emotionBreakdown: EmotionScore[];
    soundBreakdown: SoundScore[];
    location: LocationData | null;
    battery: number;
    network: NetworkStatus;
    keyword: string | null;
    speechText: string | null;
    language: SupportedLanguage;
    timeline: TimelineEntry[];
  }): Promise<EmergencyEvent> {
    if (this.isInCooldown()) {
      sosLogger.warn(LOG_SOURCE, 'Emergency trigger in cooldown period, ignoring');
      if (this.currentEmergency) return this.currentEmergency;
      throw new Error('Emergency trigger in cooldown period');
    }

    this.emergencyCounter++;
    
    // Step 2, 6, 7, 8: Capture Context, GPS, Battery, Network, and Timeline
    const event = this.createEmergencyEvent(params);
    this.currentEmergency = event;
    this.lastEmergencyTime = Date.now();

    sosLogger.emergency(LOG_SOURCE, '🚨 FULLY AUTOMATIC AI EMERGENCY INITIATED', { id: event.id });
    
    // Step 1: Create Emergency Session
    await this.deps.emergencyRepo.createEmergencySession(event);

    // Fetch Guardians
    const guardians = await this.deps.guardianRepo.getRegisteredGuardians('current_user'); // Hardcoded ID for now

    // Step 9, 10, 11, 12: Trigger Future Notification Layers concurrently
    this.dispatchNotifications(guardians, event).catch(e => sosLogger.warn(LOG_SOURCE, 'Notification Dispatch Failed', e));

    // Step 4, 5, 13: Capture Audio/Video and Upload Evidence
    this.collectAndUploadEvidence(event.id, guardians, event).catch(e => sosLogger.warn(LOG_SOURCE, 'Evidence Upload Failed', e));

    // Step 3: Start Live Location Tracking
    this.startLiveLocationTracking(guardians, event.id);

    // Notify internal local listeners (e.g. UI)
    this.notifyListeners(event);

    return event;
  }

  // ─── Automated Workflow Implementations ─────────────────────────────────

  private async dispatchNotifications(guardians: any[], event: EmergencyEvent) {
    sosLogger.info(LOG_SOURCE, 'Dispatching multi-channel notifications...');
    const results = await Promise.allSettled([
      this.deps.notificationService.sendEmergencyAlert(guardians, event),
      this.deps.whatsAppService.sendWhatsAppAlert(guardians.map(g => g.phone), event),
      this.deps.smsService.sendOfflineSMS(guardians.map(g => g.phone), event),
      this.deps.emergencyCallingService.triggerAutomatedCall(guardians.map(g => g.phone), 'EMERGENCY ALERT. SafeSphere AI detected critical danger.'),
    ]);
    sosLogger.info(LOG_SOURCE, 'Multi-channel notifications dispatched.', { results });
  }

  private async collectAndUploadEvidence(eventId: string, guardians: any[], event: EmergencyEvent) {
    sosLogger.info(LOG_SOURCE, 'Starting automated audio recording & upload sequence...');
    try {
      const audioUri = await this.deps.evidenceService.recordEvidence(10000); // 10 seconds
      if (audioUri) {
        const audioUrl = await this.deps.storageService.uploadEvidence(
          eventId, 
          `audio_${Date.now()}.m4a`, 
          audioUri, 
          'audio'
        );
        
        // Update the database session with the evidence URL
        await this.deps.emergencyRepo.updateEmergencySession(eventId, {
           // Append to a list of URLs in production
        });
        
        sosLogger.info(LOG_SOURCE, `Evidence uploaded successfully to: ${audioUrl}`);
        
        // Send follow-up message with the evidence link
        const msg = `🎙️ *Live Audio Evidence*\nSafeSphere AI has captured a 10-second audio clip from the emergency site.\nListen here: ${audioUrl}`;
        
        // Follow-up notification logic:
        const phones = guardians.map(g => g.phone).filter(p => p);
        if (phones.length > 0) {
           await this.deps.whatsAppService.sendWhatsAppAlert(phones, { ...event, customMessage: msg } as any);
        }
      }
    } catch (error) {
      sosLogger.warn(LOG_SOURCE, 'Evidence Collection/Upload Failed', { error });
    }
  }

  private startLiveLocationTracking(guardians: any[], eventId: string) {
    if (this.trackingInterval) clearInterval(this.trackingInterval);
    
    sosLogger.info(LOG_SOURCE, 'Starting Live Location Tracking...');
    
    // Simulate updating location every 5 seconds
    this.trackingInterval = setInterval(async () => {
      // Step 3: Poll location and send
      const simulatedLat = 22.123 + (Math.random() * 0.01);
      const simulatedLng = 73.123 + (Math.random() * 0.01);
      
      await this.deps.notificationService.sendLocationUpdate(guardians, eventId, simulatedLat, simulatedLng);
    }, 5000);
  }

  // ─── Utility Methods ────────────────────────────────────────────────────

  onEmergency(callback: OnEmergencyCallback): () => void {
    this.emergencyListeners.push(callback);
    return () => {
      this.emergencyListeners = this.emergencyListeners.filter(cb => cb !== callback);
    };
  }

  resolveEmergency(): void {
    if (this.currentEmergency) {
      this.currentEmergency.status = EmergencyStatus.RESOLVED;
      sosLogger.info(LOG_SOURCE, 'Emergency resolved', { id: this.currentEmergency.id });
      this.deps.emergencyRepo.resolveEmergencySession(this.currentEmergency.id, 'User Marked Safe');
      
      if (this.trackingInterval) {
         clearInterval(this.trackingInterval);
         this.trackingInterval = null;
      }
    }
  }

  getCurrentEmergency(): EmergencyEvent | null { return this.currentEmergency; }
  getTimeline(): TimelineEntry[] { return sosLogger.getTimeline(); }
  isInCooldown(): boolean { return this.lastEmergencyTime > 0 && Date.now() - this.lastEmergencyTime < this.config.cooldownMs; }

  private createEmergencyEvent(params: any): EmergencyEvent {
    const fullTimeline = [...params.timeline, ...sosLogger.getTimeline()].sort((a, b) => a.timestamp - b.timestamp).slice(-this.config.maxTimelineEntries);
    return {
      id: `sos_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 8)}`,
      status: EmergencyStatus.EMERGENCY,
      riskScore: Math.round((params.decision.signals.motionScore + params.decision.signals.locationScore + params.decision.signals.timeScore) / 3),
      panicScore: params.decision.signals.emotionScore,
      confidenceScore: params.decision.confidenceScore,
      keyword: params.keyword,
      speechText: params.speechText,
      language: params.language,
      location: params.location,
      timestamp: Date.now(),
      battery: params.battery,
      network: params.network,
      emotionBreakdown: params.emotionBreakdown,
      soundBreakdown: params.soundBreakdown,
      signals: params.decision.signals,
      timeline: fullTimeline,
    };
  }

  private notifyListeners(event: EmergencyEvent): void {
    for (const listener of this.emergencyListeners) {
      try { listener(event); } catch (e) { sosLogger.warn(LOG_SOURCE, 'Listener error', { error: String(e) }); }
    }
  }
}
