// ============================================================================
// AI Voice SOS Module — Voice Types
// SafeSphere AI | Infinity Coders
// ============================================================================

/**
 * State of the voice detection pipeline.
 */
export enum VoicePipelineState {
  /** Module is idle, not listening */
  IDLE = 'IDLE',
  /** Microphone is active, listening in low-power mode */
  LISTENING = 'LISTENING',
  /** Wake word has been detected, escalating analysis */
  WAKE_DETECTED = 'WAKE_DETECTED',
  /** Processing audio through emotion/sound/speech pipeline */
  PROCESSING = 'PROCESSING',
  /** Emergency has been confirmed and triggered */
  EMERGENCY = 'EMERGENCY',
  /** High alert — elevated monitoring, not yet emergency */
  HIGH_ALERT = 'HIGH_ALERT',
  /** Module encountered an error */
  ERROR = 'ERROR',
}

/**
 * Supported languages for wake word and speech detection.
 */
export enum SupportedLanguage {
  ENGLISH = 'en',
  HINDI = 'hi',
  URDU = 'ur',
}

/**
 * Circular audio buffer metadata.
 * The actual audio data lives in memory and is never persisted.
 */
export interface AudioBuffer {
  /** Sample rate in Hz (e.g. 16000) */
  sampleRate: number;
  /** Duration of the buffer in milliseconds */
  durationMs: number;
  /** Number of audio channels (1 = mono) */
  channels: number;
  /** Timestamp when the buffer was last updated */
  lastUpdatedAt: number;
  /** Whether the buffer contains valid audio data */
  hasData: boolean;
  /** Raw audio samples (Float32Array in memory, never persisted) */
  samples: Float32Array | null;
  /** Current microphone metering value (-160 to 0 dB) */
  metering?: number;
}

/**
 * Result of wake word detection.
 */
export interface WakeWordResult {
  /** Whether a wake word was detected */
  detected: boolean;
  /** The detected wake word (if any) */
  word: string | null;
  /** Confidence score (0–1) */
  confidence: number;
  /** Detected language */
  language: SupportedLanguage;
  /** Timestamp of detection */
  timestamp: number;
  /** Fuzzy match distance (0 = exact match) */
  matchDistance: number;
}

/**
 * A single speech segment with its own confidence.
 */
export interface SpeechSegment {
  /** Transcribed text for this segment */
  text: string;
  /** Confidence score (0–1) for this segment */
  confidence: number;
  /** Start time offset in milliseconds */
  startMs: number;
  /** End time offset in milliseconds */
  endMs: number;
}

/**
 * Result of speech-to-text transcription.
 */
export interface SpeechResult {
  /** Full transcribed text */
  text: string;
  /** Detected language of the speech */
  language: SupportedLanguage;
  /** Overall confidence score (0–1) */
  confidence: number;
  /** Individual speech segments */
  segments: SpeechSegment[];
  /** Whether noise reduction was applied */
  noiseReduced: boolean;
  /** Timestamp of transcription */
  timestamp: number;
}

/**
 * Types of emotions the system can detect.
 */
export enum EmotionType {
  FEAR = 'FEAR',
  STRESS = 'STRESS',
  PANIC = 'PANIC',
  CRYING = 'CRYING',
  FAST_BREATHING = 'FAST_BREATHING',
  VOICE_TREMBLING = 'VOICE_TREMBLING',
  SHOUTING = 'SHOUTING',
  NEUTRAL = 'NEUTRAL',
}

/**
 * Individual emotion detection result.
 */
export interface EmotionScore {
  /** Type of emotion */
  emotion: EmotionType;
  /** Confidence score (0–1) */
  confidence: number;
  /** Intensity score (0–100) */
  intensity: number;
}

/**
 * Aggregate emotion analysis result.
 */
export interface EmotionResult {
  /** Individual emotion scores */
  emotions: EmotionScore[];
  /** Aggregate panic score (0–100) */
  panicScore: number;
  /** Dominant emotion detected */
  dominantEmotion: EmotionType;
  /** Timestamp of analysis */
  timestamp: number;
}

/**
 * Types of background sounds the system can classify.
 */
export enum SoundType {
  SCREAMING = 'SCREAMING',
  RUNNING = 'RUNNING',
  FOOTSTEPS = 'FOOTSTEPS',
  GLASS_BREAKING = 'GLASS_BREAKING',
  PHYSICAL_STRUGGLE = 'PHYSICAL_STRUGGLE',
  DOOR_SLAM = 'DOOR_SLAM',
  VEHICLE_SOUNDS = 'VEHICLE_SOUNDS',
  CROWD_NOISE = 'CROWD_NOISE',
  SILENCE = 'SILENCE',
  NORMAL_AMBIENT = 'NORMAL_AMBIENT',
}

/**
 * Individual sound classification result.
 */
export interface SoundScore {
  /** Type of sound */
  sound: SoundType;
  /** Confidence score (0–1) */
  confidence: number;
}

/**
 * Aggregate background sound classification result.
 */
export interface SoundClassification {
  /** Classified sounds with confidence */
  sounds: SoundScore[];
  /** Aggregate danger score from sounds (0–100) */
  dangerScore: number;
  /** Dominant sound detected */
  dominantSound: SoundType;
  /** Timestamp of classification */
  timestamp: number;
}

/**
 * Audio chunk emitted by the microphone service for downstream processing.
 */
export interface AudioChunk {
  /** Raw audio data */
  samples: Float32Array;
  /** Sample rate */
  sampleRate: number;
  /** Timestamp when the chunk was captured */
  timestamp: number;
  /** Duration of the chunk in milliseconds */
  durationMs: number;
  /** Real-time microphone metering (volume level in dB), if available */
  metering?: number;
}

/**
 * Callback type for audio chunk processing.
 */
export type OnAudioChunkCallback = (chunk: AudioChunk) => void;

/**
 * Microphone service configuration.
 */
export interface MicrophoneConfig {
  /** Sample rate in Hz */
  sampleRate: number;
  /** Buffer duration in milliseconds */
  bufferDurationMs: number;
  /** Number of channels */
  channels: number;
  /** Chunk size in milliseconds for processing callbacks */
  chunkSizeMs: number;
}
