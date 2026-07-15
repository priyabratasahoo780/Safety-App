import { sosLogger } from '../../voice-sos/utils/logger';
import { VoiceAIProvider } from '../../fake-call/providers/VoiceAIProvider';
import { OfflineNativeProvider } from '../../fake-call/providers/offlineNativeProvider';

const LOG_SOURCE = 'AIFakeCallService';

const FATHER_SYSTEM_PROMPT = `
You are a loving and caring father on a phone call with your child. 
Listen carefully to whatever your child says and reply to it DYNAMICALLY and naturally in Hindi or Hinglish.
If they talk about casual things, reply casually like a real dad.
If they sound scared or talk about walking alone at night, be protective and reassuring to deter threats.
Keep your responses VERY brief, natural, and conversational (1-2 short sentences maximum).
You MUST speak completely in Hindi or natural Hinglish.
Do not use emojis or markdown. Just plain spoken Hindi text.
`;

export interface FakeCallMessage {
  role: 'user' | 'model';
  text: string;
}

export class AIFakeCallService implements VoiceAIProvider {
  name = 'Gemini / Offline Router';
  private static instance: AIFakeCallService | null = null;
  private conversationHistory: any[] = [];
  
  private offlineProvider = new OfflineNativeProvider();

  private constructor() {}

  public static getInstance(): AIFakeCallService {
    if (!AIFakeCallService.instance) {
      AIFakeCallService.instance = new AIFakeCallService();
    }
    return AIFakeCallService.instance;
  }
  
  isAvailable(): boolean {
    return true; // The router is always available
  }
  
  async initialize(): Promise<void> {
    if (this.offlineProvider.isAvailable()) {
      await this.offlineProvider.initialize();
    }
  }
  
  async destroy(): Promise<void> {
    if (this.offlineProvider.isAvailable()) {
      await this.offlineProvider.destroy();
    }
    this.conversationHistory = [];
  }

  public resetHistory() {
    this.conversationHistory = [];
  }
  
  public async getResponseFromAudio(audioBase64: string): Promise<string> {
    return this.processAudio(audioBase64, this.conversationHistory);
  }

  public async processAudio(audioBase64: string, history: any[]): Promise<string> {
    // 1. If we are running in an EAS Build, use the fully offline Whisper + Qwen provider!
    if (this.offlineProvider.isAvailable()) {
      try {
        const response = await this.offlineProvider.processAudio(audioBase64, history);
        return response;
      } catch (error) {
        console.warn("Offline provider failed, falling back to cloud if possible", error);
      }
    }
    // 2. If we are in Expo Go, we must NOT use cloud fallbacks (no exposed API keys allowed).
    // Instead, we strictly classify that native models are required.
    sosLogger.warn(LOG_SOURCE, 'Offline native models are unavailable. Returning Requires Development Build classification.');
    return "REQUIRES DEVELOPMENT BUILD";
  }
}
