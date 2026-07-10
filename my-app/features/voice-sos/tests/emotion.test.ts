import { EmotionService } from '../services/emotion.service';
import { AudioBuffer } from '../types/voice.types';

describe('EmotionService', () => {
  let service: EmotionService;

  beforeEach(() => {
    service = new EmotionService();
  });

  // Helper to create a dummy audio buffer
  const createDummyBuffer = (hasData = true): AudioBuffer => ({
    sampleRate: 16000,
    durationMs: 5000,
    channels: 1,
    lastUpdatedAt: Date.now(),
    hasData,
    samples: hasData ? new Float32Array(16000) : null,
  });

  it('should return neutral for empty buffer', async () => {
    const result = await service.analyze(createDummyBuffer(false));
    expect(result.panicScore).toBe(0);
    expect(result.dominantEmotion).toBe('NEUTRAL');
  });

  it('should not throw on valid audio data', async () => {
    const buffer = createDummyBuffer(true);
    // Fill with some noise
    for (let i = 0; i < buffer.samples!.length; i++) {
      buffer.samples![i] = (Math.random() - 0.5) * 0.1;
    }
    
    const result = await service.analyze(buffer);
    expect(result.emotions).toBeDefined();
    expect(typeof result.panicScore).toBe('number');
  });


});
