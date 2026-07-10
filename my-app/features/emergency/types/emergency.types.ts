// ============================================================================
// AI Voice SOS Module — Emergency Types
// SafeSphere AI | Infinity Coders
// ============================================================================

import { EmotionScore, SoundScore, SupportedLanguage } from '../../voice-sos/types/voice.types';

/**
 * Emergency status levels.
 */
export enum EmergencyStatus {
  /** No emergency — system is monitoring */
  MONITORING = 'MONITORING',
  /** Elevated risk — increased sensitivity */
  HIGH_ALERT = 'HIGH_ALERT',
  /** Confirmed emergency — triggers dispatched */
  EMERGENCY = 'EMERGENCY',
  /** Emergency was cancelled (false alarm acknowledged) */
  CANCELLED = 'CANCELLED',
  /** Emergency resolved by user or guardian */
  RESOLVED = 'RESOLVED',
}

/**
 * Network connectivity status.
 */
export enum NetworkStatus {
  ONLINE = 'ONLINE',
  OFFLINE = 'OFFLINE',
  LIMITED = 'LIMITED',
}

/**
 * GPS location data.
 */
export interface LocationData {
  /** Latitude */
  latitude: number;
  /** Longitude */
  longitude: number;
  /** Accuracy in meters */
  accuracy: number;
  /** Altitude in meters (if available) */
  altitude: number | null;
  /** Speed in m/s (if available) */
  speed: number | null;
  /** Heading in degrees (if available) */
  heading: number | null;
  /** Timestamp of the location fix */
  timestamp: number;
}

/**
 * Risk factors collected from device sensors and context.
 */
export interface RiskFactors {
  /** Current time of day (24-hour format, e.g. 23.5 for 11:30 PM) */
  currentTimeHour: number;
  /** GPS location */
  location: LocationData | null;
  /** Whether the current area is a known crime area (0–100 score) */
  crimeAreaScore: number;
  /** Movement speed in m/s */
  movementSpeed: number;
  /** Accelerometer magnitude (m/s²) */
  accelerometerMagnitude: number;
  /** Gyroscope angular velocity (rad/s) */
  gyroscopeMagnitude: number;
  /** Battery level (0–100) */
  batteryLevel: number;
  /** Internet connectivity status */
  internetStatus: NetworkStatus;
  /** Whether the user has Safe Walk active */
  safeWalkActive: boolean;
  /** Timestamp when factors were collected */
  timestamp: number;
}

/**
 * Configurable weights for the decision engine.
 * All weights should sum to 1.0.
 */
export interface DecisionWeights {
  /** Weight for keyword/wake word score */
  keyword: number;
  /** Weight for emotion/panic score */
  emotion: number;
  /** Weight for background sound score */
  sound: number;
  /** Weight for motion/accelerometer score */
  motion: number;
  /** Weight for location/crime area score */
  location: number;
  /** Weight for time-of-day score */
  time: number;
}

/**
 * All signal scores fed into the decision engine.
 */
export interface DecisionSignals {
  /** Keyword/wake word detection score (0–100) */
  keywordScore: number;
  /** Emotion/panic score (0–100) */
  emotionScore: number;
  /** Background sound danger score (0–100) */
  soundScore: number;
  /** Motion anomaly score (0–100) */
  motionScore: number;
  /** Location risk score (0–100) */
  locationScore: number;
  /** Time-of-day risk score (0–100) */
  timeScore: number;
  /** The detected keyword (if any) */
  detectedKeyword: string | null;
  /** The transcribed speech text */
  speechText: string | null;
  /** Whether context indicates a false alarm */
  isFalseAlarmContext: boolean;
}

/**
 * Result from the decision engine.
 */
export interface DecisionResult {
  /** Final confidence score (0–100) */
  confidenceScore: number;
  /** Whether emergency should be triggered */
  shouldTrigger: boolean;
  /** Current emergency status */
  status: EmergencyStatus;
  /** Breakdown of individual scores */
  signals: DecisionSignals;
  /** Weights used for calculation */
  weights: DecisionWeights;
  /** Reason for the decision */
  reason: string;
  /** Timestamp */
  timestamp: number;
}

/**
 * Entry in the emergency timeline.
 */
export interface TimelineEntry {
  /** Unique ID for this entry */
  id: string;
  /** Timestamp */
  timestamp: number;
  /** Event type */
  event: string;
  /** Human-readable description */
  description: string;
  /** Associated data (scores, results, etc.) */
  data?: Record<string, unknown>;
}

/**
 * Emergency trigger function names.
 */
export enum EmergencyTriggerType {
  START_RECORDING = 'startRecording',
  START_LOCATION_SHARING = 'startLocationSharing',
  NOTIFY_GUARDIAN = 'notifyGuardian',
  SEND_OFFLINE_SMS = 'sendOfflineSMS',
  START_EVIDENCE_COLLECTION = 'startEvidenceCollection',
}

/**
 * Type for external trigger handler functions.
 */
export type TriggerHandler = (event: EmergencyEvent) => Promise<void> | void;

/**
 * Registry of external trigger handlers.
 */
export type TriggerRegistry = Partial<Record<EmergencyTriggerType, TriggerHandler>>;

/**
 * The core Emergency Event object.
 * This is the primary output of the AI Voice SOS Module.
 * Other modules receive this object to handle UI, Firebase, Maps, Notifications.
 */
export interface EmergencyEvent {
  /** Unique ID for this emergency event */
  id: string;
  /** Emergency status */
  status: EmergencyStatus;
  /** Final risk score (0–100) */
  riskScore: number;
  /** Panic score from emotion analysis (0–100) */
  panicScore: number;
  /** Final confidence score from decision engine (0–100) */
  confidenceScore: number;
  /** Detected wake word / keyword that initiated the pipeline */
  keyword: string | null;
  /** Transcribed speech text */
  speechText: string | null;
  /** Detected language */
  language: SupportedLanguage;
  /** GPS location at time of emergency */
  location: LocationData | null;
  /** Timestamp of emergency trigger */
  timestamp: number;
  /** Device battery level (0–100) */
  battery: number;
  /** Network connectivity status */
  network: NetworkStatus;
  /** Breakdown of detected emotions */
  emotionBreakdown: EmotionScore[];
  /** Breakdown of detected background sounds */
  soundBreakdown: SoundScore[];
  /** Decision engine signal breakdown */
  signals: DecisionSignals;
  /** Chronological timeline of events leading to this emergency */
  timeline: TimelineEntry[];
  /** Audio URL of initial evidence */
  audioUrl?: string | null;
  /** Video URL of initial evidence */
  videoUrl?: string | null;
  /** Latest Audio URL of continuous evidence */
  latestAudioUrl?: string | null;
  /** Latest Video URL of continuous evidence */
  latestVideoUrl?: string | null;
  /** Dictionary of evidence chunks */
  evidenceChunks?: Record<string, { audioUrl: string; videoUrl: string; timestamp: number }>;
}

/**
 * Callback type for emergency event listeners.
 */
export type OnEmergencyCallback = (event: EmergencyEvent) => void;

/**
 * Configuration for the emergency service.
 */
export interface EmergencyConfig {
  /** Whether to auto-dispatch triggers on emergency */
  autoDispatchTriggers: boolean;
  /** Cooldown period in ms before a new emergency can be triggered */
  cooldownMs: number;
  /** Maximum timeline entries to keep */
  maxTimelineEntries: number;
}
