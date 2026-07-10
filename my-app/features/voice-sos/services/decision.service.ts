// ============================================================================
// AI Voice SOS Module — Decision Engine Service
// SafeSphere AI | Infinity Coders
// Step 7: AI Decision Engine — The Brain of the Module
// ============================================================================

import {
  DecisionResult,
  DecisionSignals,
  DecisionWeights,
  EmergencyStatus,
} from '../../emergency/types/emergency.types';
import {
  DEFAULT_DECISION_WEIGHTS,
  EMERGENCY_THRESHOLD,
  FALSE_ALARM_PHRASES,
  HARMLESS_CONTEXT_WORDS,
  HIGH_ALERT_THRESHOLD,
} from '../utils/constants';
import { sosLogger } from '../utils/logger';

const LOG_SOURCE = 'DecisionEngine';

/**
 * DecisionEngine — Step 7 of the AI Voice SOS Pipeline.
 * THE BRAIN OF THE MODULE.
 *
 * This service NEVER triggers an emergency based on a single keyword.
 * It combines ALL signals with configurable weights:
 *
 *   Final Score = (keyword × 0.15) + (emotion × 0.30) + (sound × 0.20)
 *                + (motion × 0.10) + (location × 0.15) + (time × 0.10)
 *
 * Decision logic:
 *   confidence > 85  → TRIGGER EMERGENCY
 *   confidence 70–85 → HIGH ALERT (elevated monitoring)
 *   confidence < 70  → MONITORING (keep listening)
 *
 * False Alarm Prevention (Step 10):
 *   - Context-aware NLP filters harmless phrases
 *   - "Help me with homework" → filtered out
 *   - "Stop the music" → filtered out
 *   - "Save me in PUBG" → filtered out
 *   - Only triggers when panic + emotion + sound + context all indicate danger
 */
export class DecisionEngine {
  private weights: DecisionWeights;
  private lastDecision: DecisionResult | null = null;
  private consecutiveHighAlerts: number = 0;
  private keywordHistory: number[] = [];


  constructor(weights: DecisionWeights = DEFAULT_DECISION_WEIGHTS) {
    this.weights = weights;
    this.validateWeights(weights);
    sosLogger.debug(LOG_SOURCE, 'DecisionEngine initialized', { weights });
  }

  // ─── Public API ─────────────────────────────────────────────────────────

  /**
   * Evaluate all signals and make a decision.
   * This is the core method — it determines whether to trigger emergency.
   */
  evaluate(signals: DecisionSignals): DecisionResult {
    sosLogger.info(LOG_SOURCE, 'Evaluating signals', {
      keywordScore: signals.keywordScore,
      emotionScore: signals.emotionScore,
      soundScore: signals.soundScore,
      motionScore: signals.motionScore,
      locationScore: signals.locationScore,
      timeScore: signals.timeScore,
      detectedKeyword: signals.detectedKeyword,
    });

    if (signals.keywordScore > 50) {
      this.keywordHistory.push(Date.now());
      this.keywordHistory = this.keywordHistory.filter(t => Date.now() - t <= 10000);
    }

    // Step 1: Check for false alarm context FIRST

    const isFalseAlarm = this.checkFalseAlarm(
      signals.detectedKeyword,
      signals.speechText
    );

    const adjustedSignals: DecisionSignals = {
      ...signals,
      isFalseAlarmContext: isFalseAlarm,
    };

    // Step 2: If false alarm context detected, dramatically reduce keyword score
    let effectiveKeywordScore = signals.keywordScore;
    if (isFalseAlarm) {
      effectiveKeywordScore = Math.max(0, signals.keywordScore * 0.1);
      sosLogger.info(LOG_SOURCE, 'False alarm context detected, reducing keyword score', {
        original: signals.keywordScore,
        reduced: effectiveKeywordScore,
        speechText: signals.speechText,
      });

      sosLogger.addTimelineEntry(
        'FALSE_ALARM_FILTERED',
        `False alarm context detected in: "${signals.speechText}"`,
        { speechText: signals.speechText }
      );
    }

    // Step 3: Calculate weighted confidence score
    const confidenceScore = this.calculateConfidence(
      effectiveKeywordScore,
      signals.emotionScore,
      signals.soundScore,
      signals.motionScore,
      signals.locationScore,
      signals.timeScore
    );

    // Step 4: Apply additional false alarm safeguards
    const finalScore = this.applyFalseAlarmSafeguards(
      confidenceScore,
      adjustedSignals
    );

    // Step 5: Make decision based on threshold
    const { status, reason } = this.makeDecision(finalScore, adjustedSignals);

    // Track consecutive high alerts (for escalation)
    if (status === EmergencyStatus.HIGH_ALERT) {
      this.consecutiveHighAlerts++;
    } else if (status === EmergencyStatus.MONITORING) {
      this.consecutiveHighAlerts = 0;
    }

    const result: DecisionResult = {
      confidenceScore: finalScore,
      shouldTrigger: status === EmergencyStatus.EMERGENCY,
      status,
      signals: adjustedSignals,
      weights: this.weights,
      reason,
      timestamp: Date.now(),
    };

    this.lastDecision = result;

    sosLogger.info(LOG_SOURCE, 'Decision made', {
      confidenceScore: finalScore,
      status,
      reason,
      shouldTrigger: result.shouldTrigger,
    });

    sosLogger.addTimelineEntry(
      'DECISION_MADE',
      `Decision: ${status} (confidence: ${finalScore}%) — ${reason}`,
      {
        confidenceScore: finalScore,
        status,
        reason,
        signals: {
          keyword: effectiveKeywordScore,
          emotion: signals.emotionScore,
          sound: signals.soundScore,
          motion: signals.motionScore,
          location: signals.locationScore,
          time: signals.timeScore,
        },
      }
    );

    return result;
  }

  /**
   * Get the current confidence score without re-evaluating.
   */
  getConfidence(): number {
    return this.lastDecision?.confidenceScore ?? 0;
  }

  /**
   * Check if the last evaluation determined an emergency.
   */
  isEmergency(): boolean {
    return this.lastDecision?.shouldTrigger ?? false;
  }

  /**
   * Get the last decision result.
   */
  getLastDecision(): DecisionResult | null {
    return this.lastDecision;
  }

  /**
   * Update decision weights.
   */
  setWeights(weights: DecisionWeights): void {
    this.validateWeights(weights);
    this.weights = weights;
    sosLogger.debug(LOG_SOURCE, 'Weights updated', { weights });
  }

  /**
   * Get current weights.
   */
  getWeights(): DecisionWeights {
    return { ...this.weights };
  }

  /**
   * Reset the engine state.
   */
  reset(): void {
    this.lastDecision = null;
    this.consecutiveHighAlerts = 0;
    sosLogger.debug(LOG_SOURCE, 'Decision engine reset');
  }

  // ─── Core Calculation ──────────────────────────────────────────────────

  /**
   * Calculate weighted confidence score from all signals.
   */
  private calculateConfidence(
    keywordScore: number,
    emotionScore: number,
    soundScore: number,
    motionScore: number,
    locationScore: number,
    timeScore: number
  ): number {
    const weighted =
      keywordScore * this.weights.keyword +
      emotionScore * this.weights.emotion +
      soundScore * this.weights.sound +
      motionScore * this.weights.motion +
      locationScore * this.weights.location +
      timeScore * this.weights.time;

    return Math.max(0, Math.min(100, Math.round(weighted)));
  }

  /**
   * Apply additional false alarm safeguards.
   *
   * KEY RULE: A single signal alone should NEVER trigger emergency.
   * At least 2 signals must be significantly elevated.
   */
  private applyFalseAlarmSafeguards(
    score: number,
    signals: DecisionSignals
  ): number {
    let adjustedScore = score;

    // SAFEGUARD 1: Require at least 2 elevated signals (> 50)
    const elevatedSignals = [
      signals.keywordScore > 50,
      signals.emotionScore > 50,
      signals.soundScore > 50,
      signals.motionScore > 50,
      signals.locationScore > 50,
      signals.timeScore > 50,
    ].filter(Boolean).length;

    if (elevatedSignals < 2 && adjustedScore >= EMERGENCY_THRESHOLD) {
      // Cap at HIGH_ALERT if only one signal is elevated
      adjustedScore = Math.min(adjustedScore, HIGH_ALERT_THRESHOLD);
      sosLogger.info(LOG_SOURCE, 'Safeguard: insufficient corroborating signals', {
        elevatedSignals,
        cappedScore: adjustedScore,
      });
    }

    // EXTREME DISTRESS OVERRIDE (National Hackathon Rule)
    // Trigger immediately only when:
    // - An emergency keyword is repeated (for example "HELP HELP", "BACHAO BACHAO").
    // - Keyword score is greater than 80.
    // - Emotion score is greater than 80 OR danger sound score is greater than 80.
    
    const textLower = (signals.speechText || '').toLowerCase();
    const keywordLower = (signals.detectedKeyword || '').toLowerCase();
    
    let isRepeated = false;
    if (keywordLower && textLower) {
      const escapedKeyword = keywordLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`\\b${escapedKeyword}\\b`, 'g');
      const matches = textLower.match(regex);
      if (matches && matches.length >= 2) {
        isRepeated = true;
      }
    }

    // Fallback: If STT fails, check if the wake word was detected repeatedly in a short time window (e.g., last 10 seconds)
    if (!isRepeated && this.keywordHistory.length >= 2) {
      isRepeated = true;
    }

    if (isRepeated && signals.keywordScore > 80 && (signals.emotionScore > 80 || signals.soundScore > 80)) {

      adjustedScore = Math.max(adjustedScore, 100); // Force to 100
      sosLogger.info(LOG_SOURCE, 'Escalation bypass: EXTREME DISTRESS OVERRIDE applied', {
        keywordScore: signals.keywordScore,
        emotionScore: signals.emotionScore,
        soundScore: signals.soundScore,
        isRepeated,
        boostedScore: adjustedScore,
      });
    }

    // SAFEGUARD 2: If it's a false alarm context, cap well below emergency
    if (signals.isFalseAlarmContext) {
      adjustedScore = Math.min(adjustedScore, 40);
      sosLogger.info(LOG_SOURCE, 'Safeguard: false alarm context cap applied');
    }

    // SAFEGUARD 3: Keyword-only detection (emotion and sound both low)
    // should never exceed HIGH_ALERT
    if (
      signals.keywordScore > 70 &&
      signals.emotionScore < 30 &&
      signals.soundScore < 30
    ) {
      adjustedScore = Math.min(adjustedScore, HIGH_ALERT_THRESHOLD - 5);
      sosLogger.info(LOG_SOURCE, 'Safeguard: keyword-only detection capped');
    }

    // BOOST: If 3+ high alerts in a row, escalate faster
    // (genuine emergencies produce sustained signals)
    if (this.consecutiveHighAlerts >= 3 && adjustedScore >= HIGH_ALERT_THRESHOLD) {
      adjustedScore = Math.min(100, adjustedScore + 10);
      sosLogger.info(LOG_SOURCE, 'Escalation boost: consecutive high alerts', {
        consecutive: this.consecutiveHighAlerts,
        boostedScore: adjustedScore,
      });
    }

    return adjustedScore;
  }

  /**
   * Make the final decision based on score and thresholds.
   */
  private makeDecision(
    score: number,
    signals: DecisionSignals
  ): { status: EmergencyStatus; reason: string } {
    if (score >= EMERGENCY_THRESHOLD) {
      return {
        status: EmergencyStatus.EMERGENCY,
        reason: this.buildEmergencyReason(signals, score),
      };
    }

    if (score >= HIGH_ALERT_THRESHOLD) {
      return {
        status: EmergencyStatus.HIGH_ALERT,
        reason: `Elevated risk detected (${score}%). Monitoring with increased sensitivity.`,
      };
    }

    return {
      status: EmergencyStatus.MONITORING,
      reason: `Risk level within normal range (${score}%). Continuing monitoring.`,
    };
  }

  /**
   * Build a human-readable reason for emergency trigger.
   */
  private buildEmergencyReason(signals: DecisionSignals, score: number): string {
    const reasons: string[] = [];

    if (signals.keywordScore > 50) {
      reasons.push(`distress keyword "${signals.detectedKeyword}" detected`);
    }
    if (signals.emotionScore > 50) {
      reasons.push('high emotional distress in voice');
    }
    if (signals.soundScore > 50) {
      reasons.push('dangerous background sounds detected');
    }
    if (signals.motionScore > 50) {
      reasons.push('erratic/impact motion detected');
    }
    if (signals.locationScore > 50) {
      reasons.push('high-risk location/time context');
    }

    return `Emergency triggered (${score}%): ${reasons.join(', ')}.`;
  }

  // ─── False Alarm Prevention (Step 10) ──────────────────────────────────

  /**
   * Check if the speech context indicates a false alarm.
   *
   * This is the core of Step 10 — False Alarm Prevention.
   * Analyzes the full speech transcript to determine if a wake word
   * was used in a harmless context.
   */
  private checkFalseAlarm(
    keyword: string | null,
    speechText: string | null
  ): boolean {
    if (!speechText || !keyword) return false;

    const normalizedText = speechText.toLowerCase().trim();

    // Check 1: Direct match against known false alarm phrases
    for (const phrase of FALSE_ALARM_PHRASES) {
      if (normalizedText.includes(phrase.toLowerCase())) {
        sosLogger.debug(LOG_SOURCE, 'False alarm: matched known phrase', {
          phrase,
          speechText: normalizedText,
        });
        return true;
      }
    }

    // Check 2: Context word analysis
    // If the speech contains harmless context words alongside the wake word,
    // it's likely not a real emergency
    const words = normalizedText.split(/\s+/);
    const harmlessWordCount = words.filter((word) =>
      HARMLESS_CONTEXT_WORDS.includes(word.toLowerCase())
    ).length;

    // If more than 30% of words are harmless context, likely false alarm
    if (words.length > 2 && harmlessWordCount / words.length > 0.3) {
      sosLogger.debug(LOG_SOURCE, 'False alarm: high harmless context ratio', {
        harmlessWordCount,
        totalWords: words.length,
        ratio: harmlessWordCount / words.length,
      });
      return true;
    }

    // Check 3: Question pattern detection
    // "Can you help me with X?" — question format often indicates request, not emergency
    const questionPatterns = [
      /^can (you|someone|anybody)/i,
      /^could (you|someone)/i,
      /^would (you|someone)/i,
      /^please help (me )?(with|to|find|fix)/i,
      /^i need help (with|to|for)/i,
      /help me (with|to|find|fix|choose|understand|set)/i,
    ];

    for (const pattern of questionPatterns) {
      if (pattern.test(normalizedText)) {
        sosLogger.debug(LOG_SOURCE, 'False alarm: question/request pattern', {
          pattern: pattern.source,
        });
        return true;
      }
    }

    // Check 4: Gaming / entertainment context
    const gamingPatterns = [
      /\b(game|gaming|play|playing|pubg|fortnite|minecraft|cod|valorant)\b/i,
      /\b(movie|film|show|series|episode|season)\b/i,
      /\b(song|music|playlist|album|track)\b/i,
      /\b(video|youtube|tiktok|stream|streaming)\b/i,
    ];

    for (const pattern of gamingPatterns) {
      if (pattern.test(normalizedText)) {
        sosLogger.debug(LOG_SOURCE, 'False alarm: gaming/entertainment context');
        return true;
      }
    }

    return false;
  }

  // ─── Validation ────────────────────────────────────────────────────────

  /**
   * Validate that weights are properly configured.
   */
  private validateWeights(weights: DecisionWeights): void {
    const sum =
      weights.keyword +
      weights.emotion +
      weights.sound +
      weights.motion +
      weights.location +
      weights.time;

    const tolerance = 0.01;
    if (Math.abs(sum - 1.0) > tolerance) {
      sosLogger.warn(LOG_SOURCE, `Decision weights sum to ${sum.toFixed(3)}, expected 1.0`);
    }

    // Verify no negative weights
    for (const [key, value] of Object.entries(weights)) {
      if (value < 0) {
        throw new Error(`Decision weight "${key}" cannot be negative: ${value}`);
      }
    }
  }
}
