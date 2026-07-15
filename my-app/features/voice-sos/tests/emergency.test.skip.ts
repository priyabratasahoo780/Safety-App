import { EmergencyService } from '../../emergency/services/emergency.service';
import {
  DecisionResult,
  EmergencyStatus,
  EmergencyTriggerType,
} from '../../emergency/types/emergency.types';
import { SupportedLanguage } from '../types/voice.types';

describe('EmergencyService', () => {
  let service: EmergencyService;

  beforeEach(() => {
    // @ts-ignore
    service = new EmergencyService({ autoDispatchTriggers: false, cooldownMs: 100 });
  });

  const mockDecision: DecisionResult = {
    confidenceScore: 90,
    shouldTrigger: true,
    status: EmergencyStatus.EMERGENCY,
    reason: 'Test',
    timestamp: Date.now(),
    weights: { keyword: 1, emotion: 1, sound: 1, motion: 1, location: 1, time: 1 },
    signals: {
      keywordScore: 90, emotionScore: 90, soundScore: 90, motionScore: 0,
      locationScore: 0, timeScore: 0, detectedKeyword: 'help',
      speechText: 'help me', isFalseAlarmContext: false,
    },
  };

  const triggerParams = {
    decision: mockDecision,
    emotionBreakdown: [],
    soundBreakdown: [],
    location: null,
    battery: 100,
    network: 'ONLINE' as any,
    keyword: 'help',
    speechText: 'help me',
    language: SupportedLanguage.ENGLISH,
    timeline: [],
  };

  it('should generate an emergency event', async () => {
    const event = await service.triggerEmergency(triggerParams);
    
    expect(event.id).toBeDefined();
    expect(event.status).toBe(EmergencyStatus.EMERGENCY);
    expect(event.confidenceScore).toBe(90);
    expect(event.keyword).toBe('help');
    expect(service.getCurrentEmergency()).toBe(event);
  });

  it('should dispatch registered triggers', async () => {
    const mockHandler = jest.fn();
    // @ts-ignore
    service.registerTriggerHandler(EmergencyTriggerType.START_RECORDING, mockHandler);
    
    // Enable auto dispatch for this test
    // @ts-ignore
    service.updateConfig({ autoDispatchTriggers: true });
    
    await service.triggerEmergency(triggerParams);
    
    expect(mockHandler).toHaveBeenCalledTimes(1);
    expect(mockHandler.mock.calls[0][0].id).toBeDefined(); // Event passed to handler
  });

  it('should enforce cooldown period', async () => {
    await service.triggerEmergency(triggerParams);
    
    // Second immediate trigger should throw
    await expect(service.triggerEmergency(triggerParams)).rejects.toThrow(/cooldown/);
  });
});
