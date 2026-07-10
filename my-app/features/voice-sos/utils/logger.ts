// ============================================================================
// AI Voice SOS Module — Logger
// SafeSphere AI | Infinity Coders
// ============================================================================

import { TimelineEntry } from '../../emergency/types/emergency.types';
import { LogLevel, MAX_LOG_ENTRIES } from './constants';

/**
 * A single log entry.
 * IMPORTANT: Never contains raw audio data — only metadata and scores.
 */
export interface LogEntry {
  /** Log level */
  level: LogLevel;
  /** Timestamp */
  timestamp: number;
  /** Component that generated the log */
  source: string;
  /** Human-readable message */
  message: string;
  /** Optional structured data (scores, results, etc.) */
  data?: Record<string, unknown>;
}

/**
 * Structured SOS Logger.
 *
 * Security: This logger NEVER captures or stores raw audio data.
 * It only logs metadata, scores, decisions, and pipeline events.
 *
 * The logger also doubles as the emergency timeline generator —
 * significant events are tagged and can be exported as TimelineEntry[].
 */
export class SOSLogger {
  private entries: LogEntry[] = [];
  private timelineEntries: TimelineEntry[] = [];
  private maxEntries: number;
  private enabled: boolean = true;
  private timelineCounter: number = 0;

  constructor(maxEntries: number = MAX_LOG_ENTRIES) {
    this.maxEntries = maxEntries;
  }

  // ─── Public API ─────────────────────────────────────────────────────────

  /**
   * Log a debug message.
   */
  debug(source: string, message: string, data?: Record<string, unknown>): void {
    this.log(LogLevel.DEBUG, source, message, data);
  }

  /**
   * Log an info message.
   */
  info(source: string, message: string, data?: Record<string, unknown>): void {
    this.log(LogLevel.INFO, source, message, data);
  }

  /**
   * Log a warning.
   */
  warn(source: string, message: string, data?: Record<string, unknown>): void {
    this.log(LogLevel.WARN, source, message, data);
  }

  /**
   * Log an emergency-level event.
   * This is also automatically added to the emergency timeline.
   */
  emergency(source: string, message: string, data?: Record<string, unknown>): void {
    this.log(LogLevel.EMERGENCY, source, message, data);
    this.addTimelineEntry(message, message, data);
  }

  /**
   * Add a significant event to the emergency timeline.
   * Timeline entries are separate from general logs — they represent
   * the chronological sequence of events for an emergency report.
   */
  addTimelineEntry(
    event: string,
    description: string,
    data?: Record<string, unknown>
  ): void {
    if (!this.enabled) return;

    this.timelineCounter++;

    const entry: TimelineEntry = {
      id: `timeline_${this.timelineCounter}_${Date.now()}`,
      timestamp: Date.now(),
      event,
      description,
      data,
    };

    this.timelineEntries.push(entry);

    // Cap timeline entries
    if (this.timelineEntries.length > this.maxEntries) {
      this.timelineEntries.shift();
    }
  }

  /**
   * Get all timeline entries (for emergency event reporting).
   */
  getTimeline(): TimelineEntry[] {
    return [...this.timelineEntries];
  }

  /**
   * Get all log entries.
   */
  getLogs(): LogEntry[] {
    return [...this.entries];
  }

  /**
   * Get logs filtered by level.
   */
  getLogsByLevel(level: LogLevel): LogEntry[] {
    return this.entries.filter((e) => e.level === level);
  }

  /**
   * Get logs filtered by source component.
   */
  getLogsBySource(source: string): LogEntry[] {
    return this.entries.filter((e) => e.source === source);
  }

  /**
   * Clear all logs and timeline entries.
   */
  clear(): void {
    this.entries = [];
    this.timelineEntries = [];
    this.timelineCounter = 0;
  }

  /**
   * Clear only timeline entries (for new emergency cycle).
   */
  clearTimeline(): void {
    this.timelineEntries = [];
    this.timelineCounter = 0;
  }

  /**
   * Enable or disable logging.
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  /**
   * Check if logging is enabled.
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  // ─── Internal ──────────────────────────────────────────────────────────

  private log(
    level: LogLevel,
    source: string,
    message: string,
    data?: Record<string, unknown>
  ): void {
    if (!this.enabled) return;

    // SECURITY: Strip any 'audio', 'samples', 'buffer' keys from data
    const sanitizedData = data ? this.sanitizeData(data) : undefined;

    const entry: LogEntry = {
      level,
      timestamp: Date.now(),
      source,
      message,
      data: sanitizedData,
    };

    this.entries.push(entry);

    // Cap log entries to prevent memory leaks
    if (this.entries.length > this.maxEntries) {
      this.entries.shift();
    }

    // Also output to console in development
    if (__DEV__) {
      const prefix = `[SOS:${level}][${source}]`;
      switch (level) {
        case LogLevel.DEBUG:
          console.debug(prefix, message, sanitizedData ?? '');
          break;
        case LogLevel.INFO:
          console.info(prefix, message, sanitizedData ?? '');
          break;
        case LogLevel.WARN:
          console.warn(prefix, message, sanitizedData ?? '');
          break;
        case LogLevel.EMERGENCY:
          console.log(prefix, message, sanitizedData ?? '');
          break;
      }
    }
  }

  /**
   * Remove any audio-related data from log entries for security.
   * We NEVER store raw audio samples, buffers, or recordings in logs.
   */
  private sanitizeData(data: Record<string, unknown>): Record<string, unknown> {
    const sanitized: Record<string, unknown> = {};

    const FORBIDDEN_KEYS = [
      'audio', 'samples', 'buffer', 'recording', 'rawAudio',
      'audioData', 'audioBuffer', 'waveform', 'pcm',
    ];

    for (const [key, value] of Object.entries(data)) {
      if (FORBIDDEN_KEYS.includes(key.toLowerCase())) {
        sanitized[key] = '[REDACTED - audio data]';
      } else if (value instanceof Float32Array || value instanceof ArrayBuffer) {
        sanitized[key] = '[REDACTED - binary data]';
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }
}

/**
 * Singleton logger instance for the SOS module.
 */
export const sosLogger = new SOSLogger();

// Declare __DEV__ for TypeScript (React Native provides this globally)
declare const __DEV__: boolean;
