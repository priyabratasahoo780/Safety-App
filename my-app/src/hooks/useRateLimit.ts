import { useState, useCallback } from 'react';
import { Alert } from 'react-native';

interface RateLimitConfig {
  maxAttempts: number;
  timeWindowMs: number;
  lockoutTimeMs: number;
}

export function useRateLimit(config: RateLimitConfig = { maxAttempts: 5, timeWindowMs: 60000, lockoutTimeMs: 60000 }) {
  const [attempts, setAttempts] = useState<number[]>([]);
  const [lockoutUntil, setLockoutUntil] = useState<number | null>(null);

  const checkRateLimit = useCallback((): boolean => {
    const now = Date.now();

    // Check if currently locked out
    if (lockoutUntil && now < lockoutUntil) {
      const remainingSeconds = Math.ceil((lockoutUntil - now) / 1000);
      Alert.alert('Too Many Attempts', `Please wait ${remainingSeconds} seconds before trying again.`);
      return false;
    }

    // Filter attempts to only keep those within the time window
    const recentAttempts = attempts.filter(time => now - time < config.timeWindowMs);
    
    if (recentAttempts.length >= config.maxAttempts) {
      // Trigger lockout
      const newLockoutUntil = now + config.lockoutTimeMs;
      setLockoutUntil(newLockoutUntil);
      Alert.alert('Too Many Attempts', `You have been temporarily locked out. Please wait ${config.lockoutTimeMs / 1000} seconds.`);
      return false;
    }

    // Record this attempt
    setAttempts([...recentAttempts, now]);
    return true;
  }, [attempts, lockoutUntil, config]);

  const resetRateLimit = useCallback(() => {
    setAttempts([]);
    setLockoutUntil(null);
  }, []);

  return { checkRateLimit, resetRateLimit };
}
