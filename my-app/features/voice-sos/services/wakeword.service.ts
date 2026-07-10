// ============================================================================
// AI Voice SOS Module — Wake Word Service
// SafeSphere AI | Infinity Coders
// Step 2: Wake Word Detection with Fuzzy Matching
// ============================================================================

import { AudioChunk, SupportedLanguage, WakeWordResult } from '../types/voice.types';
import {
  MAX_FUZZY_DISTANCE,
  WAKE_WORD_MIN_CONFIDENCE,
  WAKE_WORDS,
  WakeWordEntry,
} from '../utils/constants';
import { sosLogger } from '../utils/logger';

const LOG_SOURCE = 'WakeWordService';

/**
 * WakeWordService — Step 2 of the AI Voice SOS Pipeline.
 *
 * Detects emergency-indicating wake words/phrases from audio input.
 * - Supports multiple languages (English, Hindi, Urdu)
 * - Uses fuzzy matching (Levenshtein distance) for pronunciation variants
 * - Customizable wake word list
 * - Returns confidence scores and match metadata
 *
 * The service does NOT trigger emergencies by itself — it feeds
 * results into the Decision Engine which requires multiple corroborating signals.
 */
export class WakeWordService {
  private wakeWords: WakeWordEntry[];
  private customWakeWords: WakeWordEntry[] = [];

  constructor(wakeWords: WakeWordEntry[] = WAKE_WORDS) {
    this.wakeWords = wakeWords;
    sosLogger.debug(LOG_SOURCE, 'WakeWordService initialized', {
      wordCount: wakeWords.length,
    });
  }

  // ─── Public API ─────────────────────────────────────────────────────────

  /**
   * Detect wake words in an audio chunk.
   *
   * In production, this would use an on-device model (e.g., TFLite keyword spotter)
   * to first identify candidate words, then match against the wake word list.
   *
   * Current implementation works with pre-transcribed text for the matching logic.
   */
  detect(audioChunk: AudioChunk): WakeWordResult {
    // In production: audio → on-device keyword model → candidate text
    // Here we define the matching pipeline that processes the model output

    // Step 1: Extract candidate text from audio (simulated for pipeline architecture)
    const candidateText = this.extractCandidateText(audioChunk);

    // Step 2: Match against wake word list
    if (candidateText) {
      return this.matchWakeWord(candidateText);
    }

    return this.createNoDetectionResult();
  }

  /**
   * Match a text string against the wake word list.
   * This is the core matching logic — usable independently of audio.
   */
  matchText(text: string): WakeWordResult {
    return this.matchWakeWord(text);
  }

  /**
   * Add a custom wake word to the detection list.
   */
  addCustomWakeWord(entry: WakeWordEntry): void {
    this.customWakeWords.push(entry);
    sosLogger.info(LOG_SOURCE, 'Custom wake word added', {
      word: entry.primary,
      language: entry.language,
    });
  }

  /**
   * Remove a custom wake word.
   */
  removeCustomWakeWord(primary: string): boolean {
    const before = this.customWakeWords.length;
    this.customWakeWords = this.customWakeWords.filter(
      (w) => w.primary.toLowerCase() !== primary.toLowerCase()
    );
    return this.customWakeWords.length < before;
  }

  /**
   * Get all active wake words (built-in + custom).
   */
  getWakeWords(): WakeWordEntry[] {
    return [...this.wakeWords, ...this.customWakeWords];
  }

  /**
   * Get wake words for a specific language.
   */
  getWakeWordsByLanguage(language: SupportedLanguage): WakeWordEntry[] {
    return this.getWakeWords().filter((w) => w.language === language);
  }

  // ─── Core Matching Logic ───────────────────────────────────────────────

  /**
   * Match input text against all wake words using exact + fuzzy matching.
   */
  private matchWakeWord(text: string): WakeWordResult {
    const normalizedInput = text.toLowerCase().trim();

    if (!normalizedInput) {
      return this.createNoDetectionResult();
    }

    let bestMatch: {
      entry: WakeWordEntry;
      distance: number;
      matchedVariant: string;
    } | null = null;

    const allWords = this.getWakeWords();

    for (const entry of allWords) {
      // Check primary word
      const primaryDistance = this.levenshteinDistance(
        normalizedInput,
        entry.primary.toLowerCase()
      );

      if (primaryDistance <= MAX_FUZZY_DISTANCE) {
        if (!bestMatch || primaryDistance < bestMatch.distance) {
          bestMatch = {
            entry,
            distance: primaryDistance,
            matchedVariant: entry.primary,
          };
        }
      }

      // Check variants
      for (const variant of entry.variants) {
        const variantDistance = this.levenshteinDistance(
          normalizedInput,
          variant.toLowerCase()
        );

        if (variantDistance <= MAX_FUZZY_DISTANCE) {
          if (!bestMatch || variantDistance < bestMatch.distance) {
            bestMatch = {
              entry,
              distance: variantDistance,
              matchedVariant: variant,
            };
          }
        }
      }

      // Check if input contains the wake word as a substring
      if (normalizedInput.includes(entry.primary.toLowerCase())) {
        const substringDistance = 0;
        if (!bestMatch || substringDistance < bestMatch.distance) {
          bestMatch = {
            entry,
            distance: substringDistance,
            matchedVariant: entry.primary,
          };
        }
      }
    }

    if (bestMatch) {
      // Calculate confidence based on match distance and priority
      const distanceConfidence = 1 - bestMatch.distance / (MAX_FUZZY_DISTANCE + 1);
      const confidence = distanceConfidence * bestMatch.entry.priority;

      if (confidence >= WAKE_WORD_MIN_CONFIDENCE) {
        const result: WakeWordResult = {
          detected: true,
          word: bestMatch.entry.primary,
          confidence,
          language: bestMatch.entry.language,
          timestamp: Date.now(),
          matchDistance: bestMatch.distance,
        };

        sosLogger.info(LOG_SOURCE, 'Wake word detected', {
          word: result.word,
          confidence: result.confidence,
          matchDistance: result.matchDistance,
          language: result.language,
        });

        sosLogger.addTimelineEntry(
          'WAKE_WORD_DETECTED',
          `Wake word "${result.word}" detected (confidence: ${(result.confidence * 100).toFixed(1)}%)`,
          { word: result.word, confidence: result.confidence }
        );

        return result;
      }
    }

    return this.createNoDetectionResult();
  }

  /**
   * Extract candidate text from audio chunk.
   * In production, this would use an on-device keyword spotting model.
   * The actual speech-to-text is handled by SpeechService (Step 3).
   */
  private extractCandidateText(audioChunk: AudioChunk): string | null {
    // Simulated Wake Word Detection for Expo Go
    // If the user speaks (metering > -50dB), we simulate a detected keyword
    if (audioChunk.metering !== undefined && audioChunk.metering > -50) {
      return 'help';
    }
    return null;
  }

  /**
   * Create a result indicating no wake word was detected.
   */
  private createNoDetectionResult(): WakeWordResult {
    return {
      detected: false,
      word: null,
      confidence: 0,
      language: SupportedLanguage.ENGLISH,
      timestamp: Date.now(),
      matchDistance: -1,
    };
  }

  // ─── String Matching Utilities ──────────────────────────────────────────

  /**
   * Calculate Levenshtein distance between two strings.
   * Used for fuzzy matching of pronunciation variants.
   */
  private levenshteinDistance(a: string, b: string): number {
    const m = a.length;
    const n = b.length;

    // Create distance matrix
    const dp: number[][] = Array.from({ length: m + 1 }, () =>
      Array(n + 1).fill(0)
    );

    // Initialize base cases
    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;

    // Fill the matrix
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (a[i - 1] === b[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1];
        } else {
          dp[i][j] = 1 + Math.min(
            dp[i - 1][j],     // deletion
            dp[i][j - 1],     // insertion
            dp[i - 1][j - 1]  // substitution
          );
        }
      }
    }

    return dp[m][n];
  }
}
