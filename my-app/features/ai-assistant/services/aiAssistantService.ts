import { AIChatRequest, AIChatResponse } from '../types/ai-assistant.types';
import { SYSTEM_INSTRUCTION } from '../constants/assistant.constants';

export const sendMessageToAI = async (request: AIChatRequest): Promise<AIChatResponse> => {
  // ⚠️ SECURITY: API keys must NEVER be hardcoded or accessed from React Native for production secrets.
  // The backend AI endpoint is not currently configured.
  
  await new Promise(resolve => setTimeout(resolve, 800));
  
  return {
    text: "BLOCKED BY CONFIGURATION. Secure AI backend is currently unavailable.",
    isFallback: false,
  };
};
