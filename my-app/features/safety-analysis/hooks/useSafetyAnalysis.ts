import { useState, useEffect } from 'react';
import { SafetyAnalysisData } from '../types/safety-analysis.types';
import { DEMO_SAFETY_DATA } from '../constants/safety-analysis.constants';
import { calculateOverallScore, determineSafetyStatus } from '../services/safetyAnalysisService';

export const useSafetyAnalysis = () => {
  const [data, setData] = useState<SafetyAnalysisData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simulate data loading without long artificial delay for demo
    const loadData = () => {
      try {
        setIsLoading(true);
        // Using demo data
        const demoData = { ...DEMO_SAFETY_DATA };
        
        // Recalculate just to prove the service works
        const calculatedScore = calculateOverallScore(
          demoData.categories[0].score, // 75
          demoData.categories[1].score, // 82
          demoData.categories[2].score, // 70
          demoData.categories[3].score  // 85
        );
        
        demoData.overallScore = calculatedScore;
        demoData.status = determineSafetyStatus(calculatedScore);
        
        setData(demoData);
        setError(null);
      } catch (err) {
        setError('Failed to load safety analysis data');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  return {
    data,
    isLoading,
    error,
    refetch: () => {
      setIsLoading(true);
      setTimeout(() => setIsLoading(false), 500);
    }
  };
};
