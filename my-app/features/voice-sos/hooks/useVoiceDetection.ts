// ============================================================================
// AI Voice SOS Module — useVoiceDetection Hook
// SafeSphere AI | Infinity Coders
// Orchestrates the entire 10-step AI pipeline
// ============================================================================

import { useCallback, useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';

import { DecisionEngine } from '../services/decision.service';
import { EmergencyService } from '../../emergency/services/emergency.service';
import { EmotionService } from '../services/emotion.service';
import { MicrophoneService } from '../services/microphone.service';
import { SpeechService } from '../services/speech.service';
import { SoundService } from '../services/sound.service';
import { WakeWordService } from '../services/wakeword.service';

import { EmotionScore, SoundScore, SupportedLanguage, AudioChunk, VoicePipelineState, EmotionType, SoundType } from '../types/voice.types';
import {
  EmergencyEvent,
  EmergencyTriggerType,
  TriggerHandler,
  NetworkStatus,
  EmergencyStatus,
} from '../../emergency/types/emergency.types';
import { EMERGENCY_THRESHOLD, HIGH_ALERT_THRESHOLD } from '../utils/constants';
import { sosLogger } from '../utils/logger';
import { areSOSPermissionsGranted, checkAllSOSPermissions } from '../utils/permissions';
import { authService } from '../../../src/services/authService';
import { useRiskAnalysis } from './useRiskAnalysis';

import { FirebaseEmergencyRepository } from '../../emergency/repositories/FirebaseEmergencyRepository';
import { FirebaseGuardianRepository } from '../../guardian/repositories/FirebaseGuardianRepository';
import { FirebaseStorageService } from '../../emergency/repositories/FirebaseStorageService';
import { AudioEvidenceService } from '../services/evidence.service';
import { MockNotificationService } from '../../guardian/services/MockNotificationService';
import { TwilioService } from '../../adapters/providers/TwilioService';
import { TwilioCallService } from '../../adapters/providers/TwilioCallService';
import { Linking } from 'react-native';
import { ServiceLocator } from '../utils/ServiceLocator';

const LOG_SOURCE = 'useVoiceDetection';

export interface UseVoiceDetectionOptions {
  /** Whether to auto-start microphone on mount */
  autoStart?: boolean;
  /** Handlers for emergency triggers */
  triggerHandlers?: Partial<Record<EmergencyTriggerType, TriggerHandler>>;
}

/**
 * The master hook that orchestrates the AI Voice SOS Pipeline.
 *
 * Manages the flow:
 * Mic -> Wake Word -> Speech -> Emotion -> Sound -> Decision -> Emergency
 */
export function useVoiceDetection(options: UseVoiceDetectionOptions = {}) {
  const { autoStart = false, triggerHandlers = {} } = options;

  // ─── State ────────────────────────────────────────────────────────────

  const [pipelineState, setPipelineState] = useState<VoicePipelineState>(
    VoicePipelineState.IDLE
  );
  const [error, setError] = useState<string | null>(null);
  const [lastWakeWord, setLastWakeWord] = useState<string | null>(null);
  const [confidenceScore, setConfidenceScore] = useState<number>(0);
  const [isEmergency, setIsEmergency] = useState<boolean>(false);
  const [currentEmergency, setCurrentEmergency] = useState<EmergencyEvent | null>(
    null
  );
  const [currentMetering, setCurrentMetering] = useState<number>(-160);
  const [voiceData, setVoiceData] = useState<{
    dominantEmotion: string;
    panicScore: number;
    detectedWord: string | null;
    confidence: number;
  } | null>(null);

  // ─── External Hooks ───────────────────────────────────────────────────

  // Get risk context (Step 6) to feed into the decision engine
  const { riskScore, riskFactors } = useRiskAnalysis({ autoStart });

  // ─── Service Refs ─────────────────────────────────────────────────────

  const services = useRef(ServiceLocator.getInstance());


  const unsubscribeChunkRef = useRef<(() => void) | null>(null);
  const unsubscribeEmergencyRef = useRef<(() => void) | null>(null);

  // ─── Web Fallback (Speech Recognition) ────────────────────────────────
  useEffect(() => {
    if (Platform.OS === 'web' && autoStart) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = async (event: any) => {
          let transcript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            transcript += event.results[i][0].transcript;
          }

          const text = transcript.toLowerCase();
          if (text.includes('help') || text.includes('emergency') || text.includes('bachao')) {
            sosLogger.info(LOG_SOURCE, 'Web Speech API detected keyword!', { text });
            setIsEmergency(true);
            setPipelineState(VoicePipelineState.EMERGENCY);

            // Trigger emergency service directly for web demo
            await services.current.emergency.triggerEmergency({
              decision: { shouldTrigger: true, confidenceScore: 100, status: EmergencyStatus.EMERGENCY, reason: 'Web Speech API keyword detected', timestamp: Date.now(), signals: {} as any, weights: {} as any },
              emotionBreakdown: [{ emotion: EmotionType.PANIC, confidence: 0.95, intensity: 1 }],
              soundBreakdown: [{ sound: SoundType.SCREAMING, confidence: 0.9 }],
              location: riskFactors?.location ?? null,
              battery: 100,
              network: NetworkStatus.ONLINE,
              keyword: 'help',
              speechText: text,
              language: 'en' as SupportedLanguage,
              timeline: [],
            });
          }
        };

        recognition.onerror = (e: any) => {
          sosLogger.warn(LOG_SOURCE, 'Web Speech Recognition error', { error: e.error });
        };

        try {
          recognition.start();
        } catch (e) { }

        return () => {
          try {
            recognition.stop();
          } catch (e) { }
        };
      }
    }
  }, [autoStart]);

  // ─── Initialization ───────────────────────────────────────────────────

  useEffect(() => {
    const s = services.current;

    // External triggers are no longer registered here (handled automatically by EmergencyService in DI architecture)

    // Listen for emergency events
    unsubscribeEmergencyRef.current = s.emergency.onEmergency((event) => {
      setIsEmergency(true);
      setCurrentEmergency(event);
      setPipelineState(VoicePipelineState.EMERGENCY);
    });

    return () => {
      if (unsubscribeEmergencyRef.current) {
        unsubscribeEmergencyRef.current();
      }
      s.mic.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Core Pipeline Pipeline Processing ────────────────────────────────

  /**
   * Main audio processing callback.
   * Runs every chunk interval (e.g. 500ms) while mic is listening.
   */
  const handleAudioChunk = useCallback(
    async (chunk: AudioChunk) => {
      const s = services.current;

      try {
        // Update live volume in UI
        if (chunk.metering !== undefined) {
          setCurrentMetering(chunk.metering);
        }

        // Step 2: Fast Wake Word Detection on current chunk
        const wakeResult = s.wakeWord.detect(chunk);

        if (wakeResult.detected) {
          sosLogger.debug(LOG_SOURCE, 'Pipeline Step 1: Wake word detected', { word: wakeResult.word });
          setLastWakeWord(wakeResult.word);
          setPipelineState(VoicePipelineState.WAKE_DETECTED);

          // Get the full 5s buffer for deep analysis
          const fullBuffer = s.mic.getBuffer();
          if (!fullBuffer) return;

          setPipelineState(VoicePipelineState.PROCESSING);

          // Run Step 3, 4, 5 in parallel
          sosLogger.debug(LOG_SOURCE, 'Pipeline Step 2: Running Parallel AI Analysis (Speech, Emotion, Sound)');
          const [speechResult, emotionResult, soundResult] = await Promise.all([
            s.speech.transcribe(fullBuffer),
            s.emotion.analyze(fullBuffer),
            s.sound.classify(fullBuffer),
          ]);

          // Step 7 & 10: AI Decision Engine with False Alarm Prevention
          sosLogger.debug(LOG_SOURCE, 'Pipeline Step 3: Decision Engine Evaluation');
          const decision = s.decision.evaluate({
            keywordScore: wakeResult.confidence * 100,
            emotionScore: emotionResult.panicScore,
            soundScore: soundResult.dangerScore,
            motionScore: riskFactors?.accelerometerMagnitude ? (riskFactors.accelerometerMagnitude > 15 ? 80 : 0) : 0, // Simplified motion mapping
            locationScore: riskFactors?.crimeAreaScore ?? 0,
            timeScore: riskFactors ? scoreTime(riskFactors.currentTimeHour) : 0,
            detectedKeyword: wakeResult.word,
            speechText: speechResult.text,
            isFalseAlarmContext: false, // Updated inside evaluate()
          });

          setConfidenceScore(decision.confidenceScore);

          setVoiceData({
            dominantEmotion: emotionResult.emotions[0]?.emotion || 'NEUTRAL',
            panicScore: emotionResult.panicScore,
            detectedWord: wakeResult.word,
            confidence: decision.confidenceScore / 100,
          });

          // Step 8 & 9: Trigger Emergency if threshold met
          if (decision.shouldTrigger) {
            sosLogger.debug(LOG_SOURCE, 'Pipeline Step 4: EMERGENCY TRIGGERED! Initiating Dispatch protocol.');
            await s.emergency.triggerEmergency({
              decision,
              emotionBreakdown: emotionResult.emotions,
              soundBreakdown: soundResult.sounds,
              location: riskFactors?.location ?? null,
              battery: riskFactors?.batteryLevel ?? 100,
              network: riskFactors?.internetStatus ?? NetworkStatus.ONLINE,
              keyword: wakeResult.word,
              speechText: speechResult.text,
              language: wakeResult.language,
              timeline: [],
            });
          } else if (decision.confidenceScore >= HIGH_ALERT_THRESHOLD) {
            setPipelineState(VoicePipelineState.HIGH_ALERT);
          } else {
            // False alarm or low score, return to listening
            setPipelineState(VoicePipelineState.LISTENING);
          }
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        sosLogger.warn(LOG_SOURCE, 'Pipeline processing error', { error: msg });
        setError(msg);
        setPipelineState(VoicePipelineState.LISTENING); // Recover
      }
    },
    [riskFactors]
  );

  // Helper for time score
  const scoreTime = (hour: number) => {
    if (hour >= 22 || hour < 5) return 85;
    if (hour >= 19 && hour < 22) return 50;
    return 10;
  };

  // ─── Public Controls ──────────────────────────────────────────────────

  const start = useCallback(async () => {
    const s = services.current;

    // 1. Check permissions first
    const perms = await checkAllSOSPermissions();
    if (!areSOSPermissionsGranted(perms)) {
      setError('Required permissions not granted (Microphone, Location)');
      return false;
    }

    // 2. Start Microphone
    const started = await s.mic.start();
    if (started) {
      // Subscribe to chunks
      if (unsubscribeChunkRef.current) unsubscribeChunkRef.current();
      unsubscribeChunkRef.current = s.mic.onAudioChunk(handleAudioChunk);

      setPipelineState(VoicePipelineState.LISTENING);
      setError(null);
      return true;
    } else {
      setError('Failed to start microphone');
      return false;
    }
  }, [handleAudioChunk]);

  const stop = useCallback(async () => {
    const s = services.current;

    if (unsubscribeChunkRef.current) {
      unsubscribeChunkRef.current();
      unsubscribeChunkRef.current = null;
    }

    await s.mic.stop();
    setPipelineState(VoicePipelineState.IDLE);
  }, []);

  const cancelEmergency = useCallback(() => {
    services.current.emergency.resolveEmergency();
    setIsEmergency(false);
    setCurrentEmergency(null);
    setPipelineState(VoicePipelineState.LISTENING);
  }, []);

  const resolveEmergency = useCallback(() => {
    services.current.emergency.resolveEmergency();
    setIsEmergency(false);
    setCurrentEmergency(null);
    setPipelineState(VoicePipelineState.IDLE);
    stop();
  }, [stop]);

  // Auto-start
  useEffect(() => {
    if (autoStart) {
      start();
    }
    return () => {
      stop();
    };
  }, [autoStart, start, stop]);

  // ─── Simulation (For Debug/Test UI) ───────────────────────────────────

  const simulateSignals = useCallback(
    async (signals: {
      keywordScore: number;
      emotionScore: number;
      soundScore: number;
      motionScore: number;
      detectedKeyword: string | null;
      speechText: string;
    }) => {
      const s = services.current;
      setPipelineState(VoicePipelineState.PROCESSING);

      const decision = s.decision.evaluate({
        keywordScore: signals.keywordScore,
        emotionScore: signals.emotionScore,
        soundScore: signals.soundScore,
        motionScore: signals.motionScore,
        locationScore: riskFactors?.crimeAreaScore ?? 0,
        timeScore: riskFactors ? scoreTime(riskFactors.currentTimeHour) : 0,
        detectedKeyword: signals.detectedKeyword,
        speechText: signals.speechText,
        isFalseAlarmContext: false,
      });

      setConfidenceScore(decision.confidenceScore);
      setLastWakeWord(signals.detectedKeyword);

      setVoiceData({
        dominantEmotion: signals.emotionScore > 80 ? 'PANIC' : signals.emotionScore > 50 ? 'STRESS' : 'NEUTRAL',
        panicScore: signals.emotionScore,
        detectedWord: signals.detectedKeyword,
        confidence: decision.confidenceScore / 100,
      });

      if (decision.shouldTrigger) {
        await s.emergency.triggerEmergency({
          decision,
          emotionBreakdown: [],
          soundBreakdown: [],
          location: null,
          battery: 100,
          network: NetworkStatus.ONLINE,
          keyword: signals.detectedKeyword || '',
          speechText: signals.speechText,
          language: SupportedLanguage.ENGLISH,
          timeline: [],
        });
      } else if (decision.confidenceScore >= HIGH_ALERT_THRESHOLD) {
        setPipelineState(VoicePipelineState.HIGH_ALERT);
      } else {
        setPipelineState(VoicePipelineState.LISTENING);
      }
    },
    [riskFactors]
  );

  return {
    pipelineState,
    isListening: pipelineState !== VoicePipelineState.IDLE,
    isEmergency,
    currentEmergency,
    lastWakeWord,
    confidenceScore,
    riskScore, // Export risk score for UI
    error,
    start,
    stop,
    cancelEmergency,
    resolveEmergency,
    simulateSignals,
    currentMetering,
    data: voiceData,
    timeline: services.current.emergency.getTimeline(),
  };
}
