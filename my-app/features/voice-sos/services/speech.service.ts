// ============================================================================
// AI Voice SOS Module — Speech Service
// SafeSphere AI | Infinity Coders
// Step 3: Speech-to-Text with Multi-Language Support
// ============================================================================

import {
  AudioBuffer,
  SpeechResult,
  SpeechSegment,
  SupportedLanguage,
} from '../types/voice.types';
import { sosLogger } from '../utils/logger';

const LOG_SOURCE = 'SpeechService';

/**
 * SpeechService — Step 3 of the AI Voice SOS Pipeline.
 *
 * Converts detected speech (from the audio buffer) into text.
 * - Supports multiple languages (English, Hindi, Urdu)
 * - Applies noise reduction pre-processing
 * - Generates per-segment confidence scores
 * - Provides the full transcript for the Decision Engine's false-alarm NLP
 *
 * In production, this service uses:
 * - On-device: React Native Voice / platform native STT
 * - Fallback: Cloud-based STT (Google/Azure) when online
 */
export class SpeechService {
  private preferredLanguage: SupportedLanguage;
  private isProcessing: boolean = false;

  constructor(preferredLanguage: SupportedLanguage = SupportedLanguage.ENGLISH) {
    this.preferredLanguage = preferredLanguage;
    sosLogger.debug(LOG_SOURCE, 'SpeechService initialized', {
      language: preferredLanguage,
    });
  }

  // ─── Public API ─────────────────────────────────────────────────────────

  /**
   * Transcribe audio buffer to text.
   *
   * In production:
   * 1. Pre-process audio (noise reduction, normalization)
   * 2. Run through on-device STT model
   * 3. Fall back to cloud STT if on-device fails
   * 4. Return structured result with confidence scores
   */
  async transcribe(buffer: AudioBuffer): Promise<SpeechResult> {
    if (this.isProcessing) {
      sosLogger.warn(LOG_SOURCE, 'Already processing, skipping transcription');
      return this.createEmptyResult();
    }

    if (!buffer.hasData || !buffer.samples) {
      sosLogger.debug(LOG_SOURCE, 'No audio data in buffer, skipping');
      return this.createEmptyResult();
    }

    this.isProcessing = true;

    try {
      sosLogger.debug(LOG_SOURCE, 'Starting transcription');

      // Step 1: Pre-process audio (noise reduction)
      const processedSamples = this.reduceNoise(buffer.samples);

      // Step 2: Check if there's meaningful audio (not just silence/noise)
      let hasVoice = this.detectVoiceActivity(processedSamples);

      // Retry mechanism if VAD fails initially
      if (!hasVoice) {
        sosLogger.debug(LOG_SOURCE, 'No voice activity detected, retrying VAD with lower threshold...');
        hasVoice = this.detectVoiceActivity(processedSamples, true); // true = use lower threshold for retry
      }

      if (!hasVoice) {
        sosLogger.debug(LOG_SOURCE, 'Still no voice activity detected after retry');
        return this.createEmptyResult();
      }

      // Step 3: Perform speech-to-text
      let result = await this.performSTT(processedSamples, buffer.sampleRate);

      // Retry mechanism if STT is unavailable or yields no text
      if (!result.text) {
        sosLogger.debug(LOG_SOURCE, 'STT failed or unavailable, retrying speech recognition...');
        result = await this.performSTT(processedSamples, buffer.sampleRate);
      }


      sosLogger.info(LOG_SOURCE, 'Transcription complete', {
        text: result.text,
        confidence: result.confidence,
        language: result.language,
        segmentCount: result.segments.length,
      });

      if (result.text) {
        sosLogger.addTimelineEntry(
          'SPEECH_RECOGNIZED',
          `Speech recognized: "${result.text}" (confidence: ${(result.confidence * 100).toFixed(1)}%)`,
          { text: result.text, confidence: result.confidence }
        );
      }

      return result;
    } catch (error) {
      sosLogger.warn(LOG_SOURCE, 'Transcription failed', {
        error: error instanceof Error ? error.message : String(error),
      });
      return this.createEmptyResult();
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Get supported languages for speech recognition.
   */
  getSupportedLanguages(): SupportedLanguage[] {
    return [
      SupportedLanguage.ENGLISH,
      SupportedLanguage.HINDI,
      SupportedLanguage.URDU,
    ];
  }

  /**
   * Set the preferred language for recognition.
   */
  setPreferredLanguage(language: SupportedLanguage): void {
    this.preferredLanguage = language;
    sosLogger.debug(LOG_SOURCE, 'Preferred language updated', { language });
  }

  /**
   * Get current preferred language.
   */
  getPreferredLanguage(): SupportedLanguage {
    return this.preferredLanguage;
  }

  /**
   * Check if the service is currently processing audio.
   */
  isBusy(): boolean {
    return this.isProcessing;
  }

  // ─── Audio Pre-Processing ──────────────────────────────────────────────

  /**
   * Basic noise reduction using spectral subtraction approximation.
   * Estimates noise floor from the first 200ms and subtracts it.
   */
  private reduceNoise(samples: Float32Array): Float32Array {
    const output = new Float32Array(samples.length);

    // Estimate noise floor from first 200ms (assuming it's background noise)
    const noiseFrameSize = Math.min(3200, Math.floor(samples.length * 0.1));
    let noiseFloor = 0;

    for (let i = 0; i < noiseFrameSize; i++) {
      noiseFloor += Math.abs(samples[i]);
    }
    noiseFloor = (noiseFloor / noiseFrameSize) * 1.5; // 1.5x margin

    // Apply soft noise gate
    for (let i = 0; i < samples.length; i++) {
      const magnitude = Math.abs(samples[i]);
      if (magnitude > noiseFloor) {
        output[i] = samples[i];
      } else {
        // Soft attenuation instead of hard gate
        output[i] = samples[i] * (magnitude / noiseFloor);
      }
    }

    return output;
  }

  /**
   * Simple voice activity detection (VAD).
   * Checks if the audio energy exceeds a threshold indicating human speech.
   */
  private detectVoiceActivity(samples: Float32Array, isRetry = false): boolean {
    if (samples.length === 0) return false;

    // Calculate RMS energy
    let sumSquares = 0;
    for (let i = 0; i < samples.length; i++) {
      sumSquares += samples[i] * samples[i];
    }
    const rms = Math.sqrt(sumSquares / samples.length);

    // Threshold for voice detection (lowered for Android real mic)
    const VOICE_THRESHOLD = isRetry ? 0.002 : 0.005;

    // Also check zero-crossing rate (speech has characteristic ZCR)
    let zeroCrossings = 0;
    for (let i = 1; i < samples.length; i++) {
      if (
        (samples[i] >= 0 && samples[i - 1] < 0) ||
        (samples[i] < 0 && samples[i - 1] >= 0)
      ) {
        zeroCrossings++;
      }
    }
    const zcr = zeroCrossings / samples.length;

    // Speech typically has ZCR between 0.01 and 0.25 on raw mic input
    const hasVoiceEnergy = rms > VOICE_THRESHOLD;
    const hasVoiceZCR = zcr > 0.005 && zcr < 0.30;

    return hasVoiceEnergy && hasVoiceZCR;
  }

  /**
   * Perform speech-to-text using platform capabilities.
   * In production, this would use React Native Voice or platform native STT.
   */
  private async performSTT(
    samples: Float32Array,
    sampleRate: number
  ): Promise<SpeechResult> {
    try {
      // Attempt to use platform STT
      return await this.platformSTT(samples, sampleRate);
    } catch {
      sosLogger.debug(LOG_SOURCE, 'Platform STT unavailable, using analysis mode');
      // Fall back to audio analysis mode (extract features for other services)
      return this.analyzeAudioFeatures(samples, sampleRate);
    }
  }

  /**
   * Platform-specific speech-to-text.
   * Wraps React Native Voice or expo-speech for STT.
   */
  private async platformSTT(
    _samples: Float32Array,
    _sampleRate: number
  ): Promise<SpeechResult> {
    // If native STT is not configured, throw so it falls back to empty result
    // We NO LONGER mock transcription with hardcoded 'help me' based on user request.
    throw new Error('Native STT not implemented yet');
  }

  /**
   * Analyze audio features when full STT is unavailable.
   * Extracts energy, pitch, and temporal patterns to assist other services.
   */
  private analyzeAudioFeatures(
    samples: Float32Array,
    sampleRate: number
  ): SpeechResult {
    // Calculate basic audio features
    const energy = this.calculateEnergy(samples);
    const pitchEstimate = this.estimatePitch(samples, sampleRate);

    // Create segments based on energy peaks
    const segments = this.segmentByEnergy(samples, sampleRate);

    return {
      text: '',
      language: this.preferredLanguage,
      confidence: 0,
      segments,
      noiseReduced: true,
      timestamp: Date.now(),
    };
  }

  /**
   * Calculate RMS energy of audio samples.
   */
  private calculateEnergy(samples: Float32Array): number {
    let sum = 0;
    for (let i = 0; i < samples.length; i++) {
      sum += samples[i] * samples[i];
    }
    return Math.sqrt(sum / samples.length);
  }

  /**
   * Simple pitch estimation using zero-crossing rate.
   * Returns estimated fundamental frequency in Hz.
   */
  private estimatePitch(samples: Float32Array, sampleRate: number): number {
    let zeroCrossings = 0;
    for (let i = 1; i < samples.length; i++) {
      if (
        (samples[i] >= 0 && samples[i - 1] < 0) ||
        (samples[i] < 0 && samples[i - 1] >= 0)
      ) {
        zeroCrossings++;
      }
    }

    // Fundamental frequency ≈ zeroCrossings / (2 * duration)
    const durationSeconds = samples.length / sampleRate;
    return zeroCrossings / (2 * durationSeconds);
  }

  /**
   * Segment audio based on energy peaks (basic word boundary detection).
   */
  private segmentByEnergy(
    samples: Float32Array,
    sampleRate: number
  ): SpeechSegment[] {
    const segments: SpeechSegment[] = [];
    const frameSize = Math.floor(sampleRate * 0.025); // 25ms frames
    const hopSize = Math.floor(sampleRate * 0.01); // 10ms hop

    let inSegment = false;
    let segStart = 0;
    const threshold = 0.03;

    for (let i = 0; i < samples.length - frameSize; i += hopSize) {
      let frameEnergy = 0;
      for (let j = 0; j < frameSize; j++) {
        frameEnergy += samples[i + j] * samples[i + j];
      }
      frameEnergy = Math.sqrt(frameEnergy / frameSize);

      if (frameEnergy > threshold && !inSegment) {
        inSegment = true;
        segStart = i;
      } else if (frameEnergy <= threshold && inSegment) {
        inSegment = false;
        segments.push({
          text: '', // Would be filled by actual STT
          confidence: frameEnergy / 0.1, // Normalized confidence
          startMs: Math.floor((segStart / sampleRate) * 1000),
          endMs: Math.floor((i / sampleRate) * 1000),
        });
      }
    }

    return segments;
  }

  /**
   * Create an empty speech result (no speech detected).
   */
  private createEmptyResult(): SpeechResult {
    return {
      text: '',
      language: this.preferredLanguage,
      confidence: 0,
      segments: [],
      noiseReduced: false,
      timestamp: Date.now(),
    };
  }
}
