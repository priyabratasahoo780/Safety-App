// ============================================================================
// AI Voice SOS Module — useRiskAnalysis Hook
// SafeSphere AI | Infinity Coders
// ============================================================================

import { useEffect, useRef, useState } from 'react';
import { RiskService, SensorDataProvider, RiskAnalysisResult } from '../services/risk.service';
import { LocationData, NetworkStatus, RiskFactors } from '../../emergency/types/emergency.types';
import { sosLogger } from '../utils/logger';

const LOG_SOURCE = 'useRiskAnalysis';

/**
 * Configuration for the useRiskAnalysis hook.
 */
export interface UseRiskAnalysisOptions {
  /** How often to poll sensors and recalculate risk (ms). Default: 10000ms */
  pollingIntervalMs?: number;
  /** Custom sensor provider implementation */
  sensorProvider?: SensorDataProvider;
  /** Whether to start analysis immediately on mount. Default: true */
  autoStart?: boolean;
}

/**
 * React Hook for real-time risk analysis.
 *
 * Periodically polls sensors (via SensorDataProvider) and calculates
 * the current Risk Score (0-100).
 *
 * Exposes the score, factor breakdown, and a high-risk boolean indicator.
 */
export function useRiskAnalysis(options: UseRiskAnalysisOptions = {}) {
  const {
    pollingIntervalMs = 10000,
    sensorProvider,
    autoStart = true,
  } = options;

  // State
  const [isActive, setIsActive] = useState(false);
  const [lastAnalysis, setLastAnalysis] = useState<RiskAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isHighRisk, setIsHighRisk] = useState(false);

  // Refs
  const riskServiceRef = useRef<RiskService | null>(null);
  const pollingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Initialize service
  useEffect(() => {
    if (!riskServiceRef.current) {
      riskServiceRef.current = new RiskService(sensorProvider);
    } else if (sensorProvider) {
      riskServiceRef.current.setSensorProvider(sensorProvider);
    }
  }, [sensorProvider]);

  /**
   * Perform a single risk analysis immediately.
   */
  const analyzeNow = async () => {
    if (!riskServiceRef.current) return;

    try {
      const result = await riskServiceRef.current.analyze();
      setLastAnalysis(result);
      setIsHighRisk(result.riskScore > 50);
      setError(null);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
      sosLogger.warn(LOG_SOURCE, 'Risk analysis failed', { error: msg });
    }
  };

  /**
   * Start periodic risk analysis polling.
   */
  const start = () => {
    if (isActive) return;

    setIsActive(true);
    analyzeNow(); // Initial run

    pollingIntervalRef.current = setInterval(analyzeNow, pollingIntervalMs);
    sosLogger.debug(LOG_SOURCE, 'Risk analysis polling started', {
      interval: pollingIntervalMs,
    });
  };

  /**
   * Stop periodic risk analysis polling.
   */
  const stop = () => {
    if (!isActive) return;

    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }

    setIsActive(false);
    sosLogger.debug(LOG_SOURCE, 'Risk analysis polling stopped');
  };

  // Auto-start on mount if configured
  useEffect(() => {
    if (autoStart) {
      start();
    }
    return () => {
      stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoStart, pollingIntervalMs]);

  return {
    /** Current combined risk score (0-100) */
    riskScore: lastAnalysis?.riskScore ?? 0,
    /** Breakdown of individual factor scores */
    riskBreakdown: lastAnalysis?.breakdown ?? null,
    /** Raw sensor values collected */
    riskFactors: lastAnalysis?.factors ?? null,
    /** True if risk score > 50 */
    isHighRisk,
    /** True if actively polling */
    isActive,
    /** Any error encountered during analysis */
    error,
    /** Start polling */
    start,
    /** Stop polling */
    stop,
    /** Force an immediate analysis */
    analyzeNow,
  };
}
