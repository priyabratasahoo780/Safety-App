// ============================================================================
// AI Voice SOS Module — Constants
// SafeSphere AI | Infinity Coders
// ============================================================================

import { DecisionWeights } from '../../emergency/types/emergency.types';
import { MicrophoneConfig, SupportedLanguage } from '../types/voice.types';

// ─── Wake Words ─────────────────────────────────────────────────────────────

/**
 * Wake word entry with pronunciation variants for fuzzy matching.
 */
export interface WakeWordEntry {
  /** Primary wake word */
  primary: string;
  /** Pronunciation variants and common misheard versions */
  variants: string[];
  /** Language of this wake word */
  language: SupportedLanguage;
  /** Priority weight (higher = more dangerous) */
  priority: number;
}

/**
 * Complete wake word dictionary with pronunciation variants.
 * These are emergency-indicating phrases in English, Hindi, and Urdu.
 */
export const WAKE_WORDS: WakeWordEntry[] = [
  {
    primary: 'help',
    variants: ['halp', 'helpp', 'heelp', 'hellp'],
    language: SupportedLanguage.ENGLISH,
    priority: 0.9,
  },
  {
    primary: 'help me',
    variants: ['help mee', 'helpp me', 'help mi'],
    language: SupportedLanguage.ENGLISH,
    priority: 0.95,
  },
  {
    primary: 'save me',
    variants: ['savee me', 'save mee', 'sayv me'],
    language: SupportedLanguage.ENGLISH,
    priority: 0.95,
  },
  {
    primary: 'bachao',
    variants: ['bachaao', 'bachaaao', 'bachaoo', 'bachav', 'bacho'],
    language: SupportedLanguage.HINDI,
    priority: 0.95,
  },
  {
    primary: 'emergency',
    variants: ['emergancy', 'emergensee', 'emerjensi'],
    language: SupportedLanguage.ENGLISH,
    priority: 0.9,
  },
  {
    primary: 'stop',
    variants: ['stopp', 'stahp', 'staap'],
    language: SupportedLanguage.ENGLISH,
    priority: 0.7,
  },
  {
    primary: 'leave me',
    variants: ['leev me', 'leave mee', 'leavee me'],
    language: SupportedLanguage.ENGLISH,
    priority: 0.85,
  },
  {
    primary: 'call police',
    variants: ['call the police', 'kall police', 'call polis', 'police bulao'],
    language: SupportedLanguage.ENGLISH,
    priority: 1.0,
  },
  {
    primary: "don't touch me",
    variants: ['dont touch me', 'do not touch me', 'dontt touch me', 'mujhe mat chuo'],
    language: SupportedLanguage.ENGLISH,
    priority: 1.0,
  },
  {
    primary: 'chhodo',
    variants: ['chodo', 'chhodho', 'chhod do', 'chod do'],
    language: SupportedLanguage.HINDI,
    priority: 0.9,
  },
  {
    primary: 'madad',
    variants: ['madaat', 'maddad', 'madat karo'],
    language: SupportedLanguage.HINDI,
    priority: 0.9,
  },
  {
    primary: 'koi hai',
    variants: ['koi he', 'koi hain', 'koii hai'],
    language: SupportedLanguage.HINDI,
    priority: 0.8,
  },
];

// ─── False Alarm Phrases ────────────────────────────────────────────────────

/**
 * Phrases that contain wake words but do NOT indicate real emergencies.
 * The decision engine uses these to filter false positives.
 */
export const FALSE_ALARM_PHRASES: string[] = [
  // "help" in harmless context
  'help me with homework',
  'help me with this',
  'help me understand',
  'help me find',
  'help me cook',
  'help me study',
  'help me with the project',
  'can you help me',
  'i need help with',
  'help me set up',
  'help me fix this',
  'help me choose',

  // "stop" in harmless context
  'stop the music',
  'stop the video',
  'stop playing',
  'stop recording',
  'stop timer',
  'stop alarm',
  'stop it',
  'stop that song',
  'stop the movie',
  'stop navigation',

  // "save" in harmless context
  'save me in pubg',
  'save me in the game',
  'save the file',
  'save this photo',
  'save the document',
  'save my progress',
  'save the video',

  // "emergency" in harmless context
  'emergency meeting',
  'emergency contact',
  'emergency exit',
  'emergency supplies',

  // "call" in harmless context
  'call mom',
  'call dad',
  'call my friend',
  'call back later',
];

/**
 * Contextual words that, when present alongside wake words,
 * indicate a non-emergency situation.
 */
export const HARMLESS_CONTEXT_WORDS: string[] = [
  'homework', 'assignment', 'project', 'game', 'pubg', 'fortnite',
  'minecraft', 'music', 'song', 'video', 'movie', 'alarm', 'timer',
  'file', 'document', 'photo', 'cooking', 'recipe', 'study',
  'understand', 'explain', 'meeting', 'schedule', 'class',
  'setting', 'settings', 'navigation', 'directions', 'download',
];

// ─── High Priority Phrases (Level 1 Emergency) ──────────────────────────────

/**
 * Phrases that indicate an IMMEDIATE emergency.
 * If detected with high confidence, these bypass emotion/sound checks.
 */
export const HIGH_PRIORITY_PHRASES: string[] = [
  'help',          // Single 'help' = immediate emergency
  'help help',
  'help me',
  'bachao',
  'save me',
  'call police',
  'police ko call karo',
  'don\'t touch me',
  'leave me alone',
  'he\'s attacking me',
  'somebody help me',
  'emergency',
  'madad',
  'chhodo',
  'koi hai',
];

// ─── Decision Thresholds ────────────────────────────────────────────────────

/** Confidence threshold to trigger emergency (0–100) */
export const EMERGENCY_THRESHOLD = 85;

/** Confidence threshold for high alert mode (0–100) */
export const HIGH_ALERT_THRESHOLD = 70;

/** Confidence threshold below which system stays in monitoring mode */
export const MONITORING_THRESHOLD = 50;

/** Minimum wake word confidence to consider it detected (0–1) */
export const WAKE_WORD_MIN_CONFIDENCE = 0.6;

/** Maximum Levenshtein distance for fuzzy wake word matching */
export const MAX_FUZZY_DISTANCE = 2;

// ─── Decision Weights ───────────────────────────────────────────────────────

/**
 * Default weights for the decision engine.
 * Emotion and sound carry the most weight to reduce keyword-only false alarms.
 * All weights sum to 1.0.
 */
export const DEFAULT_DECISION_WEIGHTS: DecisionWeights = {
  keyword: 0.55,  // KEYWORD is now the primary signal
  emotion: 0.15,  // Emotion is secondary
  sound: 0.15,    // Sound is secondary
  motion: 0.05,
  location: 0.05,
  time: 0.05,
};

// ─── Audio Configuration ────────────────────────────────────────────────────

/** Default microphone configuration */
export const DEFAULT_MICROPHONE_CONFIG: MicrophoneConfig = {
  sampleRate: 16000,
  bufferDurationMs: 5000,
  channels: 1,
  chunkSizeMs: 500,
};

/** Maximum audio buffer duration in milliseconds (privacy: only keep last N seconds) */
export const MAX_BUFFER_DURATION_MS = 5000;

/** Audio chunk processing interval in milliseconds */
export const CHUNK_INTERVAL_MS = 500;

// ─── Time Risk Configuration ────────────────────────────────────────────────

/** Hours considered high risk (late night / early morning) */
export const HIGH_RISK_HOURS = {
  start: 22, // 10 PM
  end: 5,    // 5 AM
};

/** Hours considered moderate risk */
export const MODERATE_RISK_HOURS = {
  start: 19, // 7 PM
  end: 22,   // 10 PM
};

// ─── Emergency Configuration ────────────────────────────────────────────────

/** Cooldown period in ms before a new emergency can be triggered */
export const EMERGENCY_COOLDOWN_MS = 30000; // 30 seconds

/** Maximum timeline entries to retain per emergency */
export const MAX_TIMELINE_ENTRIES = 100;

/** Timeout for trigger handler execution in ms */
export const TRIGGER_TIMEOUT_MS = 10000; // 10 seconds

// ─── Risk Score Configuration ───────────────────────────────────────────────

/** Speed threshold in m/s that indicates running (potential danger) */
export const RUNNING_SPEED_THRESHOLD = 3.0; // ~10.8 km/h

/** Accelerometer threshold for impact/struggle detection (m/s²) */
export const IMPACT_ACCELEROMETER_THRESHOLD = 15.0;

/** Gyroscope threshold for erratic movement detection (rad/s) */
export const ERRATIC_GYROSCOPE_THRESHOLD = 5.0;

/** Battery level considered critically low */
export const CRITICAL_BATTERY_LEVEL = 15;

// ─── Logger Configuration ───────────────────────────────────────────────────

/** Maximum log entries to keep in memory */
export const MAX_LOG_ENTRIES = 500;

/** Log levels */
export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  EMERGENCY = 'EMERGENCY',
}
