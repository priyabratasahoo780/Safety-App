// ============================================================================
// AI Voice SOS Module — Emotion Service
// SafeSphere AI | Infinity Coders
// Step 4: Emotion Recognition from Audio Features
// ============================================================================

import {
  AudioBuffer,
  EmotionResult,
  EmotionScore,
  EmotionType,
} from '../types/voice.types';
import { sosLogger } from '../utils/logger';

const LOG_SOURCE = 'EmotionService';

/**
 * Audio feature set extracted for emotion analysis.
 */
interface AudioFeatures {
  /** Root Mean Square energy */
  rmsEnergy: number;
  /** Zero Crossing Rate */
  zcr: number;
  /** Estimated fundamental frequency (Hz) */
  pitchHz: number;
  /** Pitch variance (stability indicator) */
  pitchVariance: number;
  /** Speaking rate estimate (syllables per second) */
  speakingRate: number;
  /** Energy variance (shouting detection) */
  energyVariance: number;
  /** Spectral centroid (brightness of sound) */
  spectralCentroid: number;
  /** Temporal energy pattern (trembling detection) */
  energyModulationRate: number;
}

/**
 * EmotionService — Step 4 of the AI Voice SOS Pipeline.
 *
 * Analyzes audio features to detect emotional state:
 * - Fear, Stress, Panic, Crying, Fast Breathing, Voice Trembling, Shouting
 *
 * Returns individual emotion scores and an aggregate Panic Score (0–100).
 *
 * Feature extraction approach:
 * - Pitch: High/erratic pitch → fear, panic
 * - Energy: High energy → shouting; energy modulation → trembling, crying
 * - Speaking rate: Fast → panic, stress; slow with breaks → fear
 * - Zero-crossing rate: High ZCR + high energy → screaming
 * - Spectral centroid: High brightness → distress
 *
 * In production, a dedicated emotion recognition TFLite model would be used.
 * The feature-based approach here provides a robust fallback.
 */
export class EmotionService {
  private isProcessing: boolean = false;

  constructor() {
    sosLogger.debug(LOG_SOURCE, 'EmotionService initialized');
  }

  // ─── Public API ─────────────────────────────────────────────────────────

  /**
   * Analyze audio buffer for emotional content.
   * Returns individual emotion scores and aggregate panic score.
   */
  async analyze(buffer: AudioBuffer): Promise<EmotionResult> {
    if (this.isProcessing) {
      sosLogger.warn(LOG_SOURCE, 'Already processing, skipping');
      return this.createNeutralResult();
    }

    if (!buffer.hasData || !buffer.samples) {
      return this.createNeutralResult();
    }

    this.isProcessing = true;

    try {
      let panicScore = 0;
      let dominantEmotion = EmotionType.NEUTRAL;
      let emotions: EmotionScore[] = [];

      // If we have live microphone metering, use it as a primary heuristic for shouting/panic
      if (buffer.metering !== undefined) {
        if (buffer.metering > -10) {
          panicScore = 95;
          dominantEmotion = EmotionType.SHOUTING;
          emotions.push({ emotion: EmotionType.SHOUTING, confidence: 0.95, intensity: 95 });
        } else if (buffer.metering > -25) {
          panicScore = 65;
          dominantEmotion = EmotionType.STRESS;
          emotions.push({ emotion: EmotionType.STRESS, confidence: 0.65, intensity: 65 });
        } else {
          panicScore = 0;
          dominantEmotion = EmotionType.NEUTRAL;
          emotions.push({ emotion: EmotionType.NEUTRAL, confidence: 0.9, intensity: 0 });
        }
      } else if (buffer.samples && buffer.samples.length > 0) {
        // Step 1: Extract audio features
        const features = this.extractFeatures(buffer.samples, buffer.sampleRate);
        // Step 2: Score each emotion based on features
        emotions = this.scoreEmotions(features);
        // Step 3: Calculate aggregate panic score
        panicScore = this.calculatePanicScore(emotions);
        // Step 4: Find dominant emotion
        dominantEmotion = this.findDominantEmotion(emotions);
      } else {
        return this.createNeutralResult();
      }

      const result: EmotionResult = {
        emotions,
        panicScore,
        dominantEmotion,
        timestamp: Date.now(),
      };

      sosLogger.info(LOG_SOURCE, 'Emotion analysis complete', {
        panicScore,
        dominantEmotion,
        emotionCount: emotions.filter((e) => e.confidence > 0.3).length,
      });

      if (panicScore > 50) {
        sosLogger.addTimelineEntry(
          'HIGH_EMOTION_DETECTED',
          `High emotion detected: ${dominantEmotion} (panic: ${panicScore})`,
          { panicScore, dominantEmotion }
        );
      }

      return result;
    } catch (error) {
      sosLogger.warn(LOG_SOURCE, 'Emotion analysis failed', {
        error: error instanceof Error ? error.message : String(error),
      });
      return this.createNeutralResult();
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Quick panic score without full analysis (for polling).
   */
  getPanicScore(buffer: AudioBuffer): number {
    if (!buffer.hasData || !buffer.samples) return 0;

    const features = this.extractFeatures(buffer.samples, buffer.sampleRate);
    const emotions = this.scoreEmotions(features);
    return this.calculatePanicScore(emotions);
  }

  /**
   * Check if the service is currently processing.
   */
  isBusy(): boolean {
    return this.isProcessing;
  }

  // ─── Feature Extraction ────────────────────────────────────────────────

  /**
   * Extract audio features relevant to emotion detection.
   */
  private extractFeatures(samples: Float32Array, sampleRate: number): AudioFeatures {
    return {
      rmsEnergy: this.calculateRMS(samples),
      zcr: this.calculateZCR(samples),
      pitchHz: this.estimatePitch(samples, sampleRate),
      pitchVariance: this.calculatePitchVariance(samples, sampleRate),
      speakingRate: this.estimateSpeakingRate(samples, sampleRate),
      energyVariance: this.calculateEnergyVariance(samples, sampleRate),
      spectralCentroid: this.calculateSpectralCentroid(samples, sampleRate),
      energyModulationRate: this.calculateEnergyModulation(samples, sampleRate),
    };
  }

  /**
   * RMS energy calculation.
   */
  private calculateRMS(samples: Float32Array): number {
    let sum = 0;
    for (let i = 0; i < samples.length; i++) {
      sum += samples[i] * samples[i];
    }
    return Math.sqrt(sum / samples.length);
  }

  /**
   * Zero Crossing Rate — how often the signal crosses zero.
   */
  private calculateZCR(samples: Float32Array): number {
    let crossings = 0;
    for (let i = 1; i < samples.length; i++) {
      if (
        (samples[i] >= 0 && samples[i - 1] < 0) ||
        (samples[i] < 0 && samples[i - 1] >= 0)
      ) {
        crossings++;
      }
    }
    return crossings / samples.length;
  }

  /**
   * Pitch estimation using autocorrelation.
   */
  private estimatePitch(samples: Float32Array, sampleRate: number): number {
    // Simple autocorrelation-based pitch detection
    const minPeriod = Math.floor(sampleRate / 500); // Max 500Hz
    const maxPeriod = Math.floor(sampleRate / 50);  // Min 50Hz
    const frameSize = Math.min(samples.length, sampleRate); // 1 second max

    let bestCorrelation = 0;
    let bestPeriod = 0;

    for (let period = minPeriod; period < Math.min(maxPeriod, frameSize / 2); period++) {
      let correlation = 0;
      let count = 0;

      for (let i = 0; i < frameSize - period; i++) {
        correlation += samples[i] * samples[i + period];
        count++;
      }

      correlation = count > 0 ? correlation / count : 0;

      if (correlation > bestCorrelation) {
        bestCorrelation = correlation;
        bestPeriod = period;
      }
    }

    return bestPeriod > 0 ? sampleRate / bestPeriod : 0;
  }

  /**
   * Calculate pitch variance across frames (erratic pitch → panic/fear).
   */
  private calculatePitchVariance(samples: Float32Array, sampleRate: number): number {
    const frameSize = Math.floor(sampleRate * 0.05); // 50ms frames
    const pitches: number[] = [];

    for (let i = 0; i < samples.length - frameSize; i += frameSize) {
      const frame = samples.slice(i, i + frameSize);
      const pitch = this.estimatePitch(frame, sampleRate);
      if (pitch > 50) pitches.push(pitch); // Only voiced frames
    }

    if (pitches.length < 2) return 0;

    const mean = pitches.reduce((a, b) => a + b, 0) / pitches.length;
    const variance =
      pitches.reduce((sum, p) => sum + (p - mean) * (p - mean), 0) / pitches.length;

    return Math.sqrt(variance);
  }

  /**
   * Estimate speaking rate (energy peaks per second ≈ syllable rate).
   */
  private estimateSpeakingRate(samples: Float32Array, sampleRate: number): number {
    const frameSize = Math.floor(sampleRate * 0.02); // 20ms frames
    const energies: number[] = [];

    for (let i = 0; i < samples.length - frameSize; i += frameSize) {
      let energy = 0;
      for (let j = 0; j < frameSize; j++) {
        energy += samples[i + j] * samples[i + j];
      }
      energies.push(Math.sqrt(energy / frameSize));
    }

    // Count energy peaks (syllable approximation)
    let peaks = 0;
    const threshold = 0.03;
    for (let i = 1; i < energies.length - 1; i++) {
      if (
        energies[i] > threshold &&
        energies[i] > energies[i - 1] &&
        energies[i] > energies[i + 1]
      ) {
        peaks++;
      }
    }

    const durationSec = samples.length / sampleRate;
    return durationSec > 0 ? peaks / durationSec : 0;
  }

  /**
   * Energy variance across frames (high variance → shouting, crying).
   */
  private calculateEnergyVariance(samples: Float32Array, sampleRate: number): number {
    const frameSize = Math.floor(sampleRate * 0.025);
    const energies: number[] = [];

    for (let i = 0; i < samples.length - frameSize; i += frameSize) {
      let e = 0;
      for (let j = 0; j < frameSize; j++) {
        e += samples[i + j] * samples[i + j];
      }
      energies.push(Math.sqrt(e / frameSize));
    }

    if (energies.length < 2) return 0;

    const mean = energies.reduce((a, b) => a + b, 0) / energies.length;
    return (
      energies.reduce((sum, e) => sum + (e - mean) * (e - mean), 0) / energies.length
    );
  }

  /**
   * Spectral centroid — weighted mean of frequencies.
   * Higher centroid → brighter/sharper sound → distress indicator.
   */
  private calculateSpectralCentroid(samples: Float32Array, sampleRate: number): number {
    // Simple spectral centroid approximation using ZCR relationship
    const zcr = this.calculateZCR(samples);
    // ZCR correlates with spectral centroid for speech
    return zcr * sampleRate * 0.5;
  }

  /**
   * Energy modulation rate — periodic energy fluctuations.
   * Detects trembling, crying, fast breathing patterns.
   */
  private calculateEnergyModulation(samples: Float32Array, sampleRate: number): number {
    const frameSize = Math.floor(sampleRate * 0.03); // 30ms frames
    const energies: number[] = [];

    for (let i = 0; i < samples.length - frameSize; i += frameSize) {
      let e = 0;
      for (let j = 0; j < frameSize; j++) {
        e += Math.abs(samples[i + j]);
      }
      energies.push(e / frameSize);
    }

    // Count modulation cycles (zero crossings of energy envelope)
    let modCrossings = 0;
    const meanEnergy = energies.reduce((a, b) => a + b, 0) / energies.length;

    for (let i = 1; i < energies.length; i++) {
      if (
        (energies[i] >= meanEnergy && energies[i - 1] < meanEnergy) ||
        (energies[i] < meanEnergy && energies[i - 1] >= meanEnergy)
      ) {
        modCrossings++;
      }
    }

    const durationSec = samples.length / sampleRate;
    return durationSec > 0 ? modCrossings / (2 * durationSec) : 0;
  }

  // ─── Emotion Scoring ──────────────────────────────────────────────────

  /**
   * Score each emotion based on extracted audio features.
   */
  private scoreEmotions(features: AudioFeatures): EmotionScore[] {
    return [
      this.scoreFear(features),
      this.scoreStress(features),
      this.scorePanic(features),
      this.scoreCrying(features),
      this.scoreFastBreathing(features),
      this.scoreVoiceTrembling(features),
      this.scoreShouting(features),
      this.scoreNeutral(features),
    ];
  }

  /**
   * Fear: High pitch, low energy, erratic pitch, slow speaking rate.
   */
  private scoreFear(f: AudioFeatures): EmotionScore {
    let score = 0;

    // High pitch (fear raises pitch)
    if (f.pitchHz > 200) score += 0.25;
    if (f.pitchHz > 300) score += 0.15;

    // Erratic pitch variance
    if (f.pitchVariance > 30) score += 0.2;
    if (f.pitchVariance > 60) score += 0.15;

    // Lower energy (whispering in fear)
    if (f.rmsEnergy > 0.02 && f.rmsEnergy < 0.15) score += 0.15;

    // Slow speaking rate (hesitant)
    if (f.speakingRate < 3) score += 0.1;

    const confidence = Math.min(1, score);
    return {
      emotion: EmotionType.FEAR,
      confidence,
      intensity: Math.round(confidence * 100),
    };
  }

  /**
   * Stress: Elevated pitch, moderate energy, fast speaking rate.
   */
  private scoreStress(f: AudioFeatures): EmotionScore {
    let score = 0;

    if (f.pitchHz > 180) score += 0.2;
    if (f.speakingRate > 4) score += 0.25;
    if (f.speakingRate > 6) score += 0.15;
    if (f.energyVariance > 0.001) score += 0.15;
    if (f.rmsEnergy > 0.05) score += 0.15;
    if (f.pitchVariance > 20) score += 0.1;

    const confidence = Math.min(1, score);
    return {
      emotion: EmotionType.STRESS,
      confidence,
      intensity: Math.round(confidence * 100),
    };
  }

  /**
   * Panic: Very high pitch, very fast speaking, high energy, erratic everything.
   */
  private scorePanic(f: AudioFeatures): EmotionScore {
    let score = 0;

    if (f.pitchHz > 250) score += 0.2;
    if (f.pitchHz > 350) score += 0.15;
    if (f.speakingRate > 5) score += 0.2;
    if (f.speakingRate > 7) score += 0.1;
    if (f.rmsEnergy > 0.1) score += 0.15;
    if (f.pitchVariance > 50) score += 0.15;
    if (f.energyVariance > 0.002) score += 0.1;

    const confidence = Math.min(1, score);
    return {
      emotion: EmotionType.PANIC,
      confidence,
      intensity: Math.round(confidence * 100),
    };
  }

  /**
   * Crying: Energy modulation, mid-high pitch, characteristic rhythm.
   */
  private scoreCrying(f: AudioFeatures): EmotionScore {
    let score = 0;

    // Crying has characteristic energy modulation (sobbing rhythm)
    if (f.energyModulationRate > 2 && f.energyModulationRate < 8) score += 0.3;
    if (f.pitchHz > 200 && f.pitchHz < 400) score += 0.2;
    if (f.energyVariance > 0.001) score += 0.2;
    if (f.pitchVariance > 40) score += 0.15;
    if (f.spectralCentroid > 1000) score += 0.15;

    const confidence = Math.min(1, score);
    return {
      emotion: EmotionType.CRYING,
      confidence,
      intensity: Math.round(confidence * 100),
    };
  }

  /**
   * Fast Breathing: Characteristic modulation rate, low pitch, specific ZCR.
   */
  private scoreFastBreathing(f: AudioFeatures): EmotionScore {
    let score = 0;

    // Fast breathing: 15-40 breaths/min → modulation at 0.25-0.67 Hz
    if (f.energyModulationRate > 0.2 && f.energyModulationRate < 1.0) score += 0.35;
    // Low fundamental frequency (breathing is not speech)
    if (f.pitchHz < 100 || f.pitchHz === 0) score += 0.2;
    // Moderate ZCR (breath noise)
    if (f.zcr > 0.05 && f.zcr < 0.15) score += 0.2;
    // Low-moderate energy
    if (f.rmsEnergy > 0.01 && f.rmsEnergy < 0.08) score += 0.15;

    const confidence = Math.min(1, score);
    return {
      emotion: EmotionType.FAST_BREATHING,
      confidence,
      intensity: Math.round(confidence * 100),
    };
  }

  /**
   * Voice Trembling: High energy modulation rate, pitch instability.
   */
  private scoreVoiceTrembling(f: AudioFeatures): EmotionScore {
    let score = 0;

    // Trembling: 4-12 Hz modulation in voice
    if (f.energyModulationRate > 3 && f.energyModulationRate < 15) score += 0.3;
    // Pitch instability
    if (f.pitchVariance > 25) score += 0.25;
    if (f.pitchVariance > 50) score += 0.15;
    // Moderate energy
    if (f.rmsEnergy > 0.03) score += 0.15;
    // Voiced speech present
    if (f.pitchHz > 80) score += 0.1;

    const confidence = Math.min(1, score);
    return {
      emotion: EmotionType.VOICE_TREMBLING,
      confidence,
      intensity: Math.round(confidence * 100),
    };
  }

  /**
   * Shouting: Very high energy, high ZCR, high spectral centroid.
   */
  private scoreShouting(f: AudioFeatures): EmotionScore {
    let score = 0;

    // Very high RMS energy
    if (f.rmsEnergy > 0.15) score += 0.3;
    if (f.rmsEnergy > 0.25) score += 0.15;
    // High ZCR
    if (f.zcr > 0.1) score += 0.15;
    // High spectral centroid (bright/harsh sound)
    if (f.spectralCentroid > 2000) score += 0.15;
    // Some pitch (it's voiced, not just noise)
    if (f.pitchHz > 100) score += 0.1;
    // High energy variance
    if (f.energyVariance > 0.003) score += 0.15;

    const confidence = Math.min(1, score);
    return {
      emotion: EmotionType.SHOUTING,
      confidence,
      intensity: Math.round(confidence * 100),
    };
  }

  /**
   * Neutral: Low energy, stable pitch, normal speaking rate.
   */
  private scoreNeutral(f: AudioFeatures): EmotionScore {
    let score = 0;

    // Normal energy range
    if (f.rmsEnergy > 0.01 && f.rmsEnergy < 0.08) score += 0.25;
    // Stable pitch
    if (f.pitchVariance < 20) score += 0.25;
    // Normal speaking rate (3-5 syllables/sec)
    if (f.speakingRate > 2 && f.speakingRate < 6) score += 0.25;
    // Low energy modulation
    if (f.energyModulationRate < 3) score += 0.15;
    // Normal pitch range
    if (f.pitchHz > 80 && f.pitchHz < 250) score += 0.1;

    const confidence = Math.min(1, score);
    return {
      emotion: EmotionType.NEUTRAL,
      confidence,
      intensity: Math.round(confidence * 100),
    };
  }

  // ─── Aggregation ──────────────────────────────────────────────────────

  /**
   * Calculate aggregate panic score (0–100) from individual emotions.
   * Distress emotions (fear, panic, shouting, etc.) increase the score.
   * Neutral decreases it.
   */
  private calculatePanicScore(emotions: EmotionScore[]): number {
    // Weights for each emotion's contribution to panic score
    const panicWeights: Record<EmotionType, number> = {
      [EmotionType.FEAR]: 0.85,
      [EmotionType.STRESS]: 0.60,
      [EmotionType.PANIC]: 1.00,
      [EmotionType.CRYING]: 0.75,
      [EmotionType.FAST_BREATHING]: 0.65,
      [EmotionType.VOICE_TREMBLING]: 0.70,
      [EmotionType.SHOUTING]: 0.80,
      [EmotionType.NEUTRAL]: -0.50, // Neutral reduces panic score
    };

    let weightedSum = 0;
    let totalWeight = 0;

    for (const emotion of emotions) {
      const weight = panicWeights[emotion.emotion] ?? 0;
      if (weight > 0) {
        weightedSum += emotion.confidence * weight * 100;
        totalWeight += Math.abs(weight);
      } else if (weight < 0) {
        // Neutral dampens the score
        weightedSum += emotion.confidence * weight * 50;
        totalWeight += Math.abs(weight);
      }
    }

    const score = totalWeight > 0 ? weightedSum / totalWeight : 0;
    return Math.max(0, Math.min(100, Math.round(score)));
  }

  /**
   * Find the dominant (highest confidence) emotion.
   */
  private findDominantEmotion(emotions: EmotionScore[]): EmotionType {
    let maxConfidence = 0;
    let dominant = EmotionType.NEUTRAL;

    for (const emotion of emotions) {
      if (emotion.confidence > maxConfidence) {
        maxConfidence = emotion.confidence;
        dominant = emotion.emotion;
      }
    }

    return dominant;
  }

  /**
   * Create a neutral emotion result.
   */
  private createNeutralResult(): EmotionResult {
    return {
      emotions: [
        {
          emotion: EmotionType.NEUTRAL,
          confidence: 1.0,
          intensity: 0,
        },
      ],
      panicScore: 0,
      dominantEmotion: EmotionType.NEUTRAL,
      timestamp: Date.now(),
    };
  }
}
