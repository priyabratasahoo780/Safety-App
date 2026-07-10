// ============================================================================
// AI Voice SOS Module — Sound Service
// SafeSphere AI | Infinity Coders
// Step 5: Background Sound Detection & Classification
// ============================================================================

import {
  AudioBuffer,
  SoundClassification,
  SoundScore,
  SoundType,
} from '../types/voice.types';
import { sosLogger } from '../utils/logger';

const LOG_SOURCE = 'SoundService';

/**
 * Spectral features used for sound classification.
 */
interface SpectralFeatures {
  /** RMS energy */
  rmsEnergy: number;
  /** Zero Crossing Rate */
  zcr: number;
  /** Spectral centroid (Hz) */
  spectralCentroid: number;
  /** Spectral bandwidth */
  spectralBandwidth: number;
  /** Energy in low frequencies (< 500Hz) */
  lowFreqEnergy: number;
  /** Energy in mid frequencies (500Hz - 2kHz) */
  midFreqEnergy: number;
  /** Energy in high frequencies (> 2kHz) */
  highFreqEnergy: number;
  /** Temporal pattern — how quickly energy changes */
  onsetStrength: number;
  /** Duration of the detected event (ms) */
  eventDurationMs: number;
  /** Whether the sound is impulsive (short burst) */
  isImpulsive: boolean;
}

/**
 * SoundService — Step 5 of the AI Voice SOS Pipeline.
 *
 * Classifies background (non-speech) sounds that indicate danger:
 * - Screaming, Running, Footsteps, Glass Breaking
 * - Physical Struggle, Door Slam, Vehicle Sounds, Crowd Noise
 *
 * Each detected sound has a confidence score and contributes
 * to the emergency danger score.
 *
 * In production, a dedicated audio event detection TFLite model
 * (e.g., YAMNet-based) would be used for classification.
 * This implementation uses spectral feature analysis as a fallback.
 */
export class SoundService {
  private isProcessing: boolean = false;

  constructor() {
    sosLogger.debug(LOG_SOURCE, 'SoundService initialized');
  }

  // ─── Public API ─────────────────────────────────────────────────────────

  /**
   * Classify background sounds in the audio buffer.
   */
  async classify(buffer: AudioBuffer): Promise<SoundClassification> {
    if (this.isProcessing) {
      sosLogger.warn(LOG_SOURCE, 'Already processing, skipping');
      return this.createSilenceResult();
    }

    if (!buffer.hasData || !buffer.samples) {
      return this.createSilenceResult();
    }

    this.isProcessing = true;

    try {
      let dangerScore = 0;
      let dominantSound = SoundType.NORMAL_AMBIENT;
      let sounds: SoundScore[] = [];

      // If we have live microphone metering, use it as a primary heuristic for loud/dangerous sounds
      if (buffer.metering !== undefined) {
        if (buffer.metering > -40) {
          dangerScore = 90;
          dominantSound = SoundType.SCREAMING;
          sounds.push({ sound: SoundType.SCREAMING, confidence: 0.9 });
        } else if (buffer.metering > -50) {
          dangerScore = 50;
          dominantSound = SoundType.PHYSICAL_STRUGGLE;
          sounds.push({ sound: SoundType.PHYSICAL_STRUGGLE, confidence: 0.6 });
        } else {
          dangerScore = 0;
          dominantSound = SoundType.NORMAL_AMBIENT;
          sounds.push({ sound: SoundType.NORMAL_AMBIENT, confidence: 0.9 });
        }
      } else if (buffer.samples && buffer.samples.length > 0) {
        // Step 1: Extract spectral features
        const features = this.extractSpectralFeatures(buffer.samples, buffer.sampleRate);
        // Step 2: Classify each sound type
        sounds = this.classifySounds(features);
        // Step 3: Calculate aggregate danger score
        dangerScore = this.calculateDangerScore(sounds);
        // Step 4: Find dominant sound
        dominantSound = this.findDominantSound(sounds);
      } else {
        return this.createSilenceResult();
      }

      const result: SoundClassification = {
        sounds,
        dangerScore,
        dominantSound,
        timestamp: Date.now(),
      };

      sosLogger.info(LOG_SOURCE, 'Sound classification complete', {
        dangerScore,
        dominantSound,
        detectedCount: sounds.filter((s) => s.confidence > 0.3).length,
      });

      if (dangerScore > 40) {
        sosLogger.addTimelineEntry(
          'DANGER_SOUND_DETECTED',
          `Dangerous sound detected: ${dominantSound} (danger: ${dangerScore})`,
          { dangerScore, dominantSound }
        );
      }

      return result;
    } catch (error) {
      sosLogger.warn(LOG_SOURCE, 'Sound classification failed', {
        error: error instanceof Error ? error.message : String(error),
      });
      return this.createSilenceResult();
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Quick danger score without full classification.
   */
  getSoundScore(buffer: AudioBuffer): number {
    if (!buffer.hasData || !buffer.samples) return 0;

    const features = this.extractSpectralFeatures(buffer.samples, buffer.sampleRate);
    const sounds = this.classifySounds(features);
    return this.calculateDangerScore(sounds);
  }

  /**
   * Check if the service is busy.
   */
  isBusy(): boolean {
    return this.isProcessing;
  }

  // ─── Feature Extraction ────────────────────────────────────────────────

  /**
   * Extract spectral features for sound classification.
   */
  private extractSpectralFeatures(
    samples: Float32Array,
    sampleRate: number
  ): SpectralFeatures {
    const rmsEnergy = this.calculateRMS(samples);
    const zcr = this.calculateZCR(samples);

    // Approximate frequency band energies
    const { lowFreqEnergy, midFreqEnergy, highFreqEnergy } =
      this.estimateFrequencyBands(samples, sampleRate);

    // Spectral centroid approximation
    const totalEnergy = lowFreqEnergy + midFreqEnergy + highFreqEnergy;
    const spectralCentroid =
      totalEnergy > 0
        ? (lowFreqEnergy * 250 + midFreqEnergy * 1250 + highFreqEnergy * 4000) /
          totalEnergy
        : 0;

    // Spectral bandwidth
    const spectralBandwidth = this.estimateSpectralBandwidth(
      lowFreqEnergy,
      midFreqEnergy,
      highFreqEnergy,
      spectralCentroid
    );

    // Onset strength (how quickly energy changes)
    const onsetStrength = this.calculateOnsetStrength(samples, sampleRate);

    // Detect impulsive sounds (glass break, door slam)
    const { isImpulsive, eventDurationMs } = this.detectImpulsiveEvent(
      samples,
      sampleRate
    );

    return {
      rmsEnergy,
      zcr,
      spectralCentroid,
      spectralBandwidth,
      lowFreqEnergy,
      midFreqEnergy,
      highFreqEnergy,
      onsetStrength,
      eventDurationMs,
      isImpulsive,
    };
  }

  private calculateRMS(samples: Float32Array): number {
    let sum = 0;
    for (let i = 0; i < samples.length; i++) {
      sum += samples[i] * samples[i];
    }
    return Math.sqrt(sum / samples.length);
  }

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
   * Estimate energy in frequency bands using ZCR-based approximation.
   * In production, FFT-based analysis would provide more accurate results.
   */
  private estimateFrequencyBands(
    samples: Float32Array,
    sampleRate: number
  ): { lowFreqEnergy: number; midFreqEnergy: number; highFreqEnergy: number } {
    // Split signal and analyze sub-bands using downsampling approximation
    const frameSize = Math.floor(sampleRate * 0.025); // 25ms frames
    let lowEnergy = 0;
    let midEnergy = 0;
    let highEnergy = 0;
    let frameCount = 0;

    for (let i = 0; i < samples.length - frameSize; i += frameSize) {
      let frameRMS = 0;
      let frameZCR = 0;
      let frameCrossings = 0;

      for (let j = 0; j < frameSize; j++) {
        frameRMS += samples[i + j] * samples[i + j];
        if (
          j > 0 &&
          ((samples[i + j] >= 0 && samples[i + j - 1] < 0) ||
            (samples[i + j] < 0 && samples[i + j - 1] >= 0))
        ) {
          frameCrossings++;
        }
      }

      frameRMS = Math.sqrt(frameRMS / frameSize);
      frameZCR = frameCrossings / frameSize;

      // Approximate frequency from ZCR
      const approxFreq = (frameZCR * sampleRate) / 2;

      if (approxFreq < 500) {
        lowEnergy += frameRMS;
      } else if (approxFreq < 2000) {
        midEnergy += frameRMS;
      } else {
        highEnergy += frameRMS;
      }

      frameCount++;
    }

    return {
      lowFreqEnergy: frameCount > 0 ? lowEnergy / frameCount : 0,
      midFreqEnergy: frameCount > 0 ? midEnergy / frameCount : 0,
      highFreqEnergy: frameCount > 0 ? highEnergy / frameCount : 0,
    };
  }

  private estimateSpectralBandwidth(
    low: number,
    mid: number,
    high: number,
    centroid: number
  ): number {
    const total = low + mid + high;
    if (total === 0) return 0;

    const variance =
      (low * (250 - centroid) ** 2 +
        mid * (1250 - centroid) ** 2 +
        high * (4000 - centroid) ** 2) /
      total;

    return Math.sqrt(variance);
  }

  /**
   * Calculate onset strength — how rapidly energy changes.
   * Sharp onsets indicate impulsive/sudden sounds.
   */
  private calculateOnsetStrength(samples: Float32Array, sampleRate: number): number {
    const frameSize = Math.floor(sampleRate * 0.01); // 10ms frames
    let maxDelta = 0;
    let prevEnergy = 0;

    for (let i = 0; i < samples.length - frameSize; i += frameSize) {
      let energy = 0;
      for (let j = 0; j < frameSize; j++) {
        energy += samples[i + j] * samples[i + j];
      }
      energy = Math.sqrt(energy / frameSize);

      const delta = Math.abs(energy - prevEnergy);
      if (delta > maxDelta) maxDelta = delta;

      prevEnergy = energy;
    }

    return maxDelta;
  }

  /**
   * Detect if there's an impulsive (short, sharp) sound event.
   * Used for glass breaking, door slams, impacts.
   */
  private detectImpulsiveEvent(
    samples: Float32Array,
    sampleRate: number
  ): { isImpulsive: boolean; eventDurationMs: number } {
    const frameSize = Math.floor(sampleRate * 0.005); // 5ms frames
    const threshold = 0.15;
    let eventStart = -1;
    let eventEnd = -1;

    for (let i = 0; i < samples.length - frameSize; i += frameSize) {
      let energy = 0;
      for (let j = 0; j < frameSize; j++) {
        energy += Math.abs(samples[i + j]);
      }
      energy /= frameSize;

      if (energy > threshold && eventStart === -1) {
        eventStart = i;
      } else if (energy < threshold * 0.3 && eventStart !== -1 && eventEnd === -1) {
        eventEnd = i;
      }
    }

    if (eventStart === -1) {
      return { isImpulsive: false, eventDurationMs: 0 };
    }

    if (eventEnd === -1) eventEnd = samples.length;

    const durationMs = ((eventEnd - eventStart) / sampleRate) * 1000;

    // Impulsive sounds are typically < 300ms
    return {
      isImpulsive: durationMs < 300,
      eventDurationMs: durationMs,
    };
  }

  // ─── Sound Classification ─────────────────────────────────────────────

  /**
   * Classify all sound types based on spectral features.
   */
  private classifySounds(features: SpectralFeatures): SoundScore[] {
    return [
      this.classifyScreaming(features),
      this.classifyRunning(features),
      this.classifyFootsteps(features),
      this.classifyGlassBreaking(features),
      this.classifyPhysicalStruggle(features),
      this.classifyDoorSlam(features),
      this.classifyVehicleSounds(features),
      this.classifyCrowdNoise(features),
      this.classifySilence(features),
      this.classifyNormalAmbient(features),
    ];
  }

  /**
   * Screaming: Very high energy, high frequency, high ZCR.
   */
  private classifyScreaming(f: SpectralFeatures): SoundScore {
    let score = 0;
    if (f.rmsEnergy > 0.2) score += 0.3;
    if (f.highFreqEnergy > 0.05) score += 0.25;
    if (f.zcr > 0.12) score += 0.2;
    if (f.spectralCentroid > 2500) score += 0.15;
    if (!f.isImpulsive) score += 0.1; // Screaming is sustained

    return { sound: SoundType.SCREAMING, confidence: Math.min(1, score) };
  }

  /**
   * Running: Rhythmic low-frequency impacts, moderate energy.
   */
  private classifyRunning(f: SpectralFeatures): SoundScore {
    let score = 0;
    if (f.lowFreqEnergy > 0.02) score += 0.3;
    if (f.rmsEnergy > 0.03 && f.rmsEnergy < 0.15) score += 0.2;
    if (f.onsetStrength > 0.05) score += 0.2;
    if (f.spectralCentroid < 1000) score += 0.15;
    if (!f.isImpulsive) score += 0.15; // Running is rhythmic, not impulsive

    return { sound: SoundType.RUNNING, confidence: Math.min(1, score) };
  }

  /**
   * Footsteps: Rhythmic low-freq impacts, lower energy than running.
   */
  private classifyFootsteps(f: SpectralFeatures): SoundScore {
    let score = 0;
    if (f.lowFreqEnergy > 0.01 && f.lowFreqEnergy < 0.04) score += 0.3;
    if (f.rmsEnergy > 0.01 && f.rmsEnergy < 0.08) score += 0.2;
    if (f.onsetStrength > 0.02 && f.onsetStrength < 0.08) score += 0.25;
    if (f.spectralCentroid < 800) score += 0.15;
    if (f.isImpulsive && f.eventDurationMs < 100) score += 0.1;

    return { sound: SoundType.FOOTSTEPS, confidence: Math.min(1, score) };
  }

  /**
   * Glass Breaking: Impulsive, very high frequency, sharp onset.
   */
  private classifyGlassBreaking(f: SpectralFeatures): SoundScore {
    let score = 0;
    if (f.isImpulsive) score += 0.35;
    if (f.highFreqEnergy > 0.04) score += 0.25;
    if (f.onsetStrength > 0.1) score += 0.2;
    if (f.spectralCentroid > 3000) score += 0.15;
    if (f.eventDurationMs < 200) score += 0.1;

    return { sound: SoundType.GLASS_BREAKING, confidence: Math.min(1, score) };
  }

  /**
   * Physical Struggle: Irregular high energy, varied frequency.
   */
  private classifyPhysicalStruggle(f: SpectralFeatures): SoundScore {
    let score = 0;
    if (f.rmsEnergy > 0.08) score += 0.2;
    if (f.spectralBandwidth > 1500) score += 0.25; // Wide frequency range
    if (f.onsetStrength > 0.06) score += 0.2;
    if (!f.isImpulsive) score += 0.15;
    if (f.midFreqEnergy > 0.03) score += 0.1;

    return { sound: SoundType.PHYSICAL_STRUGGLE, confidence: Math.min(1, score) };
  }

  /**
   * Door Slam: Impulsive, low frequency, very strong onset.
   */
  private classifyDoorSlam(f: SpectralFeatures): SoundScore {
    let score = 0;
    if (f.isImpulsive) score += 0.3;
    if (f.lowFreqEnergy > 0.05) score += 0.25;
    if (f.onsetStrength > 0.12) score += 0.2;
    if (f.spectralCentroid < 1000) score += 0.15;
    if (f.eventDurationMs > 50 && f.eventDurationMs < 250) score += 0.1;

    return { sound: SoundType.DOOR_SLAM, confidence: Math.min(1, score) };
  }

  /**
   * Vehicle Sounds: Low frequency rumble, sustained, moderate energy.
   */
  private classifyVehicleSounds(f: SpectralFeatures): SoundScore {
    let score = 0;
    if (f.lowFreqEnergy > 0.03) score += 0.3;
    if (f.spectralCentroid < 600) score += 0.25;
    if (!f.isImpulsive) score += 0.2;
    if (f.rmsEnergy > 0.02 && f.rmsEnergy < 0.12) score += 0.15;
    if (f.onsetStrength < 0.05) score += 0.1; // Steady, not sudden

    return { sound: SoundType.VEHICLE_SOUNDS, confidence: Math.min(1, score) };
  }

  /**
   * Crowd Noise: Broadband, moderate energy, sustained.
   */
  private classifyCrowdNoise(f: SpectralFeatures): SoundScore {
    let score = 0;
    if (f.spectralBandwidth > 2000) score += 0.25;
    if (f.rmsEnergy > 0.03 && f.rmsEnergy < 0.15) score += 0.2;
    if (!f.isImpulsive) score += 0.2;
    if (f.midFreqEnergy > 0.02) score += 0.15;
    if (f.lowFreqEnergy > 0.01 && f.highFreqEnergy > 0.01) score += 0.1;

    return { sound: SoundType.CROWD_NOISE, confidence: Math.min(1, score) };
  }

  /**
   * Silence: Very low energy, low ZCR.
   */
  private classifySilence(f: SpectralFeatures): SoundScore {
    let score = 0;
    if (f.rmsEnergy < 0.005) score += 0.5;
    if (f.zcr < 0.01) score += 0.3;
    if (f.onsetStrength < 0.005) score += 0.2;

    return { sound: SoundType.SILENCE, confidence: Math.min(1, score) };
  }

  /**
   * Normal Ambient: Low-moderate energy, stable, no sharp events.
   */
  private classifyNormalAmbient(f: SpectralFeatures): SoundScore {
    let score = 0;
    if (f.rmsEnergy > 0.005 && f.rmsEnergy < 0.05) score += 0.3;
    if (f.onsetStrength < 0.03) score += 0.25;
    if (!f.isImpulsive) score += 0.2;
    if (f.spectralCentroid > 200 && f.spectralCentroid < 2000) score += 0.15;

    return { sound: SoundType.NORMAL_AMBIENT, confidence: Math.min(1, score) };
  }

  // ─── Aggregation ──────────────────────────────────────────────────────

  /**
   * Calculate aggregate danger score (0–100) from classified sounds.
   */
  private calculateDangerScore(sounds: SoundScore[]): number {
    const dangerWeights: Record<SoundType, number> = {
      [SoundType.SCREAMING]: 1.0,
      [SoundType.GLASS_BREAKING]: 0.9,
      [SoundType.PHYSICAL_STRUGGLE]: 0.95,
      [SoundType.DOOR_SLAM]: 0.5,
      [SoundType.RUNNING]: 0.4,
      [SoundType.FOOTSTEPS]: 0.2,
      [SoundType.VEHICLE_SOUNDS]: 0.15,
      [SoundType.CROWD_NOISE]: 0.1,
      [SoundType.SILENCE]: 0.0,
      [SoundType.NORMAL_AMBIENT]: -0.2,
    };

    let weightedSum = 0;
    let totalPositiveWeight = 0;

    for (const sound of sounds) {
      const weight = dangerWeights[sound.sound] ?? 0;
      if (weight > 0) {
        weightedSum += sound.confidence * weight * 100;
        totalPositiveWeight += weight;
      } else if (weight < 0) {
        weightedSum += sound.confidence * weight * 30;
      }
    }

    const score =
      totalPositiveWeight > 0 ? weightedSum / totalPositiveWeight : 0;
    return Math.max(0, Math.min(100, Math.round(score)));
  }

  /**
   * Find the dominant (highest confidence, excluding silence/ambient) sound.
   */
  private findDominantSound(sounds: SoundScore[]): SoundType {
    const dangerousSounds = sounds.filter(
      (s) =>
        s.sound !== SoundType.SILENCE &&
        s.sound !== SoundType.NORMAL_AMBIENT
    );

    if (dangerousSounds.length === 0) return SoundType.NORMAL_AMBIENT;

    let maxConfidence = 0;
    let dominant = SoundType.NORMAL_AMBIENT;

    for (const sound of dangerousSounds) {
      if (sound.confidence > maxConfidence) {
        maxConfidence = sound.confidence;
        dominant = sound.sound;
      }
    }

    return maxConfidence > 0.2 ? dominant : SoundType.NORMAL_AMBIENT;
  }

  /**
   * Create a silence result.
   */
  private createSilenceResult(): SoundClassification {
    return {
      sounds: [{ sound: SoundType.SILENCE, confidence: 1.0 }],
      dangerScore: 0,
      dominantSound: SoundType.SILENCE,
      timestamp: Date.now(),
    };
  }
}
