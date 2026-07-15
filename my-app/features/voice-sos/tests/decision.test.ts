import { DecisionEngine } from '../services/decision.service';
import { EmergencyStatus } from '../../emergency/types/emergency.types';

describe('DecisionEngine', () => {
  let engine: DecisionEngine;

  beforeEach(() => {
    engine = new DecisionEngine();
  });

  const baseSignals = {
    keywordScore: 0,
    emotionScore: 0,
    soundScore: 0,
    motionScore: 90,
    locationScore: 90,
    timeScore: 90,
    detectedKeyword: null,
    speechText: null,
    isFalseAlarmContext: false,
  };

  it('should trigger emergency when all signals are high', () => {
    const result = engine.evaluate({
      ...baseSignals,
      keywordScore: 90,
      emotionScore: 90,
      soundScore: 90,
      detectedKeyword: 'help',
    });

    expect(result.shouldTrigger).toBe(true);
    expect(result.status).toBe(EmergencyStatus.EMERGENCY);
    expect(result.confidenceScore).toBeGreaterThanOrEqual(85);
  });

  it('should stay in monitoring when signals are low', () => {
    const result = engine.evaluate({
      ...baseSignals,
      keywordScore: 20,
      emotionScore: 30,
    });

    expect(result.shouldTrigger).toBe(false);
    expect(result.status).toBe(EmergencyStatus.MONITORING);
  });

  it('should enter high alert for moderate signals', () => {
    const result = engine.evaluate({
      ...baseSignals,
      keywordScore: 80,
      emotionScore: 60,
      soundScore: 60,
      detectedKeyword: 'stop',
    });

    console.log('TEST RESULT OBJECT:', result);
    expect(result.shouldTrigger).toBe(false);
    expect(result.status).toBe(EmergencyStatus.HIGH_ALERT);
  });

  it('should cap keyword-only detections (safeguard)', () => {
    const result = engine.evaluate({
      ...baseSignals,
      keywordScore: 100, // Perfect keyword match
      emotionScore: 10,  // But calm voice
      soundScore: 10,    // And no background noise
      detectedKeyword: 'emergency',
    });

    // Should be capped below HIGH_ALERT threshold due to safeguard 3
    expect(result.shouldTrigger).toBe(false);
    expect(result.confidenceScore).toBeLessThanOrEqual(70);
  });
});
