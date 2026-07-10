import { DecisionEngine } from '../services/decision.service';
import { EmergencyStatus } from '../../emergency/types/emergency.types';

describe('False Alarm Prevention', () => {
  let engine: DecisionEngine;

  beforeEach(() => {
    engine = new DecisionEngine();
  });

  const baseSignals = {
    keywordScore: 90,
    emotionScore: 80,
    soundScore: 80,
    motionScore: 90,
    locationScore: 90,
    timeScore: 90,
    isFalseAlarmContext: false,
  };

  it('should filter out direct false alarm phrases', () => {
    const result = engine.evaluate({
      ...baseSignals,
      detectedKeyword: 'help',
      speechText: 'help me with homework',
    });

    expect(result.signals.isFalseAlarmContext).toBe(true);
    expect(result.shouldTrigger).toBe(false);
    expect(result.confidenceScore).toBeLessThanOrEqual(40);
  });

  it('should filter out gaming contexts', () => {
    const result = engine.evaluate({
      ...baseSignals,
      detectedKeyword: 'save me',
      speechText: 'save me they are shooting in pubg',
    });

    expect(result.signals.isFalseAlarmContext).toBe(true);
    expect(result.shouldTrigger).toBe(false);
  });

  it('should filter out question patterns', () => {
    const result = engine.evaluate({
      ...baseSignals,
      detectedKeyword: 'help me',
      speechText: 'can you help me fix this thing',
    });

    expect(result.signals.isFalseAlarmContext).toBe(true);
    expect(result.shouldTrigger).toBe(false);
  });

  it('should ALLOW real emergencies', () => {
    const result = engine.evaluate({
      ...baseSignals,
      detectedKeyword: 'help me',
      speechText: 'please help me he has a knife',
    });

    expect(result.signals.isFalseAlarmContext).toBe(false);
    expect(result.shouldTrigger).toBe(true);
    expect(result.status).toBe(EmergencyStatus.EMERGENCY);
  });
});
