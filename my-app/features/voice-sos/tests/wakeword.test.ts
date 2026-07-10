import { WakeWordService } from '../services/wakeword.service';
import { SupportedLanguage } from '../types/voice.types';

describe('WakeWordService', () => {
  let service: WakeWordService;

  beforeEach(() => {
    service = new WakeWordService();
  });

  it('should detect exact English wake words', () => {
    const result = service.matchText('help me');
    expect(result.detected).toBe(true);
    expect(result.word).toBe('help me');
    expect(result.confidence).toBeGreaterThan(0.9);
  });

  it('should detect exact Hindi wake words', () => {
    const result = service.matchText('bachao');
    expect(result.detected).toBe(true);
    expect(result.word).toBe('bachao');
    expect(result.language).toBe(SupportedLanguage.HINDI);
  });

  it('should detect wake words with fuzzy matching (typos)', () => {
    const result = service.matchText('hlp me');
    expect(result.detected).toBe(true);
    expect(result.word).toBe('help'); // Matches closest primary
  });

  it('should ignore normal conversation', () => {
    const result = service.matchText('hello how are you doing today');
    expect(result.detected).toBe(false);
  });

  it('should handle custom wake words', () => {
    service.addCustomWakeWord({
      primary: 'pineapple',
      variants: ['pinapple'],
      language: SupportedLanguage.ENGLISH,
      priority: 0.9,
    });

    const result = service.matchText('pineapple');
    expect(result.detected).toBe(true);
    expect(result.word).toBe('pineapple');
  });
});
