// ============================================================================
// AI Voice SOS Module — Risk Service
// SafeSphere AI | Infinity Coders
// Step 6: Multi-Signal Risk Analysis
// ============================================================================

import {
  LocationData,
  NetworkStatus,
  RiskFactors,
} from '../../emergency/types/emergency.types';
import {
  CRITICAL_BATTERY_LEVEL,
  ERRATIC_GYROSCOPE_THRESHOLD,
  HIGH_RISK_HOURS,
  IMPACT_ACCELEROMETER_THRESHOLD,
  MODERATE_RISK_HOURS,
  RUNNING_SPEED_THRESHOLD,
} from '../utils/constants';
import { sosLogger } from '../utils/logger';

const LOG_SOURCE = 'RiskService';

/**
 * Breakdown of individual risk factor scores.
 */
export interface RiskFactorBreakdown {
  timeScore: number;
  locationScore: number;
  crimeAreaScore: number;
  movementScore: number;
  accelerometerScore: number;
  gyroscopeScore: number;
  batteryScore: number;
  networkScore: number;
  safeWalkScore: number;
}

/**
 * Complete risk analysis result.
 */
export interface RiskAnalysisResult {
  /** Combined risk score (0–100) */
  riskScore: number;
  /** Individual factor breakdown */
  breakdown: RiskFactorBreakdown;
  /** The risk factors that were analyzed */
  factors: RiskFactors;
  /** Timestamp of analysis */
  timestamp: number;
}

/**
 * Provider interface for sensor data.
 * External modules implement these to supply real sensor readings.
 * This allows the RiskService to be testable and decoupled from hardware.
 */
export interface SensorDataProvider {
  /** Get current GPS location */
  getLocation(): Promise<LocationData | null>;
  /** Get accelerometer magnitude (m/s²) */
  getAccelerometerMagnitude(): Promise<number>;
  /** Get gyroscope magnitude (rad/s) */
  getGyroscopeMagnitude(): Promise<number>;
  /** Get battery level (0–100) */
  getBatteryLevel(): Promise<number>;
  /** Get network status */
  getNetworkStatus(): Promise<NetworkStatus>;
  /** Get movement speed (m/s) */
  getMovementSpeed(): Promise<number>;
  /** Check if Safe Walk is active */
  isSafeWalkActive(): Promise<boolean>;
  /** Get crime area score for location (0–100) */
  getCrimeAreaScore(location: LocationData): Promise<number>;
}

/**
 * Default sensor data provider — returns safe defaults.
 * Replace with real implementation that reads from expo-sensors, expo-location, etc.
 */
export class DefaultSensorProvider implements SensorDataProvider {
  async getLocation(): Promise<LocationData | null> {
    return null; // No location available by default
  }

  async getAccelerometerMagnitude(): Promise<number> {
    return 9.8; // Normal gravity
  }

  async getGyroscopeMagnitude(): Promise<number> {
    return 0; // No rotation
  }

  async getBatteryLevel(): Promise<number> {
    return 100; // Full battery
  }

  async getNetworkStatus(): Promise<NetworkStatus> {
    return NetworkStatus.ONLINE;
  }

  async getMovementSpeed(): Promise<number> {
    return 0; // Stationary
  }

  async isSafeWalkActive(): Promise<boolean> {
    return false;
  }

  async getCrimeAreaScore(_location: LocationData): Promise<number> {
    return 0; // Unknown area
  }
}

/**
 * RiskService — Step 6 of the AI Voice SOS Pipeline.
 *
 * Collects and analyzes contextual risk factors:
 * - Current Time (late night = higher risk)
 * - GPS Location
 * - Crime Area Data
 * - Movement Speed (running away?)
 * - Accelerometer (impact/struggle)
 * - Gyroscope (erratic movement)
 * - Battery Level (low battery = harder to call for help)
 * - Internet Status (offline = more vulnerable)
 * - Safe Walk Active (user already in safety mode)
 *
 * Each factor is scored independently (0–100), then combined
 * into a single weighted Risk Score.
 *
 * Uses dependency injection (SensorDataProvider) so external modules
 * supply the actual sensor data. This keeps the module decoupled and testable.
 */
export class RiskService {
  private sensorProvider: SensorDataProvider;
  private lastAnalysis: RiskAnalysisResult | null = null;

  constructor(sensorProvider?: SensorDataProvider) {
    this.sensorProvider = sensorProvider ?? new DefaultSensorProvider();
    sosLogger.debug(LOG_SOURCE, 'RiskService initialized');
  }

  // ─── Public API ─────────────────────────────────────────────────────────

  /**
   * Perform a full risk analysis by collecting all sensor data.
   */
  async analyze(): Promise<RiskAnalysisResult> {
    sosLogger.debug(LOG_SOURCE, 'Starting risk analysis');

    // Collect all risk factors
    const factors = await this.collectFactors();

    // Analyze with collected factors
    return this.analyzeFactors(factors);
  }

  /**
   * Analyze pre-collected risk factors (useful for testing).
   */
  analyzeFactors(factors: RiskFactors): RiskAnalysisResult {
    // Score each factor
    const breakdown: RiskFactorBreakdown = {
      timeScore: this.scoreTime(factors.currentTimeHour),
      locationScore: factors.location ? 20 : 0, // Base score if location available
      crimeAreaScore: factors.crimeAreaScore,
      movementScore: this.scoreMovement(factors.movementSpeed),
      accelerometerScore: this.scoreAccelerometer(factors.accelerometerMagnitude),
      gyroscopeScore: this.scoreGyroscope(factors.gyroscopeMagnitude),
      batteryScore: this.scoreBattery(factors.batteryLevel),
      networkScore: this.scoreNetwork(factors.internetStatus),
      safeWalkScore: factors.safeWalkActive ? 30 : 0,
    };

    // Calculate combined risk score
    const riskScore = this.combineScores(breakdown);

    const result: RiskAnalysisResult = {
      riskScore,
      breakdown,
      factors,
      timestamp: Date.now(),
    };

    this.lastAnalysis = result;

    sosLogger.info(LOG_SOURCE, 'Risk analysis complete', {
      riskScore,
      breakdown,
    });

    if (riskScore > 50) {
      sosLogger.addTimelineEntry(
        'HIGH_RISK_CONTEXT',
        `Elevated risk context detected (score: ${riskScore})`,
        { riskScore, breakdown }
      );
    }

    return result;
  }

  /**
   * Get the most recent risk score.
   */
  getRiskScore(): number {
    return this.lastAnalysis?.riskScore ?? 0;
  }

  /**
   * Get the most recent factor breakdown.
   */
  getFactorBreakdown(): RiskFactorBreakdown | null {
    return this.lastAnalysis?.breakdown ?? null;
  }

  /**
   * Get the last complete analysis result.
   */
  getLastAnalysis(): RiskAnalysisResult | null {
    return this.lastAnalysis;
  }

  /**
   * Set a custom sensor data provider.
   */
  setSensorProvider(provider: SensorDataProvider): void {
    this.sensorProvider = provider;
    sosLogger.debug(LOG_SOURCE, 'Sensor provider updated');
  }

  // ─── Data Collection ───────────────────────────────────────────────────

  /**
   * Collect all risk factors from sensor provider.
   */
  private async collectFactors(): Promise<RiskFactors> {
    const [
      location,
      accelerometerMagnitude,
      gyroscopeMagnitude,
      batteryLevel,
      internetStatus,
      movementSpeed,
      safeWalkActive,
    ] = await Promise.all([
      this.sensorProvider.getLocation(),
      this.sensorProvider.getAccelerometerMagnitude(),
      this.sensorProvider.getGyroscopeMagnitude(),
      this.sensorProvider.getBatteryLevel(),
      this.sensorProvider.getNetworkStatus(),
      this.sensorProvider.getMovementSpeed(),
      this.sensorProvider.isSafeWalkActive(),
    ]);

    // Get crime area score if location is available
    let crimeAreaScore = 0;
    if (location) {
      crimeAreaScore = await this.sensorProvider.getCrimeAreaScore(location);
    }

    return {
      currentTimeHour: new Date().getHours() + new Date().getMinutes() / 60,
      location,
      crimeAreaScore,
      movementSpeed,
      accelerometerMagnitude,
      gyroscopeMagnitude,
      batteryLevel,
      internetStatus,
      safeWalkActive,
      timestamp: Date.now(),
    };
  }

  // ─── Individual Factor Scoring ──────────────────────────────────────────

  /**
   * Score time of day (0–100).
   * Late night / early morning is higher risk.
   */
  private scoreTime(hour: number): number {
    // 10 PM - 5 AM: High risk (80-100)
    if (hour >= HIGH_RISK_HOURS.start || hour < HIGH_RISK_HOURS.end) {
      // Peak danger at 1-3 AM
      if (hour >= 1 && hour < 3) return 100;
      if (hour >= 0 && hour < 1) return 90;
      if (hour >= 3 && hour < HIGH_RISK_HOURS.end) return 80;
      return 85; // 10 PM - midnight
    }

    // 7 PM - 10 PM: Moderate risk (40-70)
    if (hour >= MODERATE_RISK_HOURS.start && hour < MODERATE_RISK_HOURS.end) {
      // Linear increase from 7 PM to 10 PM
      const progress =
        (hour - MODERATE_RISK_HOURS.start) /
        (MODERATE_RISK_HOURS.end - MODERATE_RISK_HOURS.start);
      return Math.round(40 + progress * 30);
    }

    // 5 AM - 7 AM: Low-moderate risk (20-40)
    if (hour >= 5 && hour < 7) {
      return Math.round(40 - ((hour - 5) / 2) * 20);
    }

    // Daytime (7 AM - 7 PM): Low risk (0-20)
    return 10;
  }

  /**
   * Score movement speed (0–100).
   * Running speed indicates potential danger.
   */
  private scoreMovement(speedMs: number): number {
    if (speedMs <= 0) return 0;

    // Walking (< 1.5 m/s): normal
    if (speedMs < 1.5) return 10;

    // Fast walking (1.5 - 3.0 m/s): slight concern
    if (speedMs < RUNNING_SPEED_THRESHOLD) {
      return Math.round(10 + ((speedMs - 1.5) / 1.5) * 30);
    }

    // Running (3.0 - 6.0 m/s): concerning
    if (speedMs < 6.0) {
      return Math.round(40 + ((speedMs - 3.0) / 3.0) * 40);
    }

    // Sprinting (> 6.0 m/s): high risk
    return Math.min(100, Math.round(80 + (speedMs - 6.0) * 5));
  }

  /**
   * Score accelerometer data (0–100).
   * High G-forces indicate impacts, falls, or struggles.
   */
  private scoreAccelerometer(magnitude: number): number {
    // Normal gravity is ~9.8 m/s²
    const deviation = Math.abs(magnitude - 9.8);

    if (deviation < 1) return 0; // Normal movement

    if (deviation < 5) {
      // Moderate activity
      return Math.round((deviation / 5) * 30);
    }

    if (deviation < IMPACT_ACCELEROMETER_THRESHOLD - 9.8) {
      // Strong movement
      return Math.round(30 + ((deviation - 5) / 10) * 40);
    }

    // Impact level
    return Math.min(100, Math.round(70 + (deviation - 15) * 3));
  }

  /**
   * Score gyroscope data (0–100).
   * Erratic rotation indicates struggle or fall.
   */
  private scoreGyroscope(magnitude: number): number {
    if (magnitude < 1) return 0;

    if (magnitude < 3) {
      return Math.round((magnitude / 3) * 30);
    }

    if (magnitude < ERRATIC_GYROSCOPE_THRESHOLD) {
      return Math.round(30 + ((magnitude - 3) / 2) * 40);
    }

    return Math.min(100, Math.round(70 + (magnitude - 5) * 6));
  }

  /**
   * Score battery level (0–100).
   * Low battery makes it harder to call for help.
   */
  private scoreBattery(level: number): number {
    if (level > 50) return 0;
    if (level > 30) return 10;
    if (level > CRITICAL_BATTERY_LEVEL) return 30;
    if (level > 5) return 60;
    return 80; // Almost dead
  }

  /**
   * Score network status (0–100).
   * Offline means can't stream location or notify guardians over data.
   */
  private scoreNetwork(status: NetworkStatus): number {
    switch (status) {
      case NetworkStatus.ONLINE:
        return 0;
      case NetworkStatus.LIMITED:
        return 30;
      case NetworkStatus.OFFLINE:
        return 50;
      default:
        return 20;
    }
  }

  // ─── Score Combination ─────────────────────────────────────────────────

  /**
   * Combine individual risk factor scores into a single risk score (0–100).
   * Uses weighted averaging with emphasis on the most dangerous signals.
   */
  private combineScores(breakdown: RiskFactorBreakdown): number {
    const weights = {
      timeScore: 0.15,
      locationScore: 0.05,
      crimeAreaScore: 0.20,
      movementScore: 0.15,
      accelerometerScore: 0.15,
      gyroscopeScore: 0.10,
      batteryScore: 0.05,
      networkScore: 0.05,
      safeWalkScore: 0.10,
    };

    let weightedSum = 0;
    let totalWeight = 0;

    for (const [key, weight] of Object.entries(weights)) {
      const score = breakdown[key as keyof RiskFactorBreakdown];
      weightedSum += score * weight;
      totalWeight += weight;
    }

    const combined = totalWeight > 0 ? weightedSum / totalWeight : 0;
    return Math.max(0, Math.min(100, Math.round(combined)));
  }
}
