// ============================================================================
// AI Voice SOS Module — Public API
// SafeSphere AI | Infinity Coders
// ============================================================================

// Export Types
export * from './types/voice.types';
export * from '../emergency/types/emergency.types';

// Export Services (for advanced usage/testing)
export * from './services/microphone.service';
export * from './services/wakeword.service';
export * from './services/speech.service';
export * from './services/emotion.service';
export * from './services/sound.service';
export * from './services/risk.service';
export * from './services/decision.service';
export * from './services/geminiVoice.service';
export * from '../emergency/services/emergency.service';

// Export Hooks (Primary interface for React Native app)
export * from './hooks/useVoiceDetection';
export * from './hooks/useRiskAnalysis';

// Export Utils
export { SOSLogger, sosLogger } from './utils/logger';
export { 
  checkAllSOSPermissions, 
  areSOSPermissionsGranted 
} from './utils/permissions';
export * from './utils/constants';
