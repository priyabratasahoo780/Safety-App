import { sosLogger } from '../../voice-sos/utils/logger';
import { VoiceAIProvider } from '../fake-call/providers/VoiceAIProvider';
import { OfflineNativeProvider } from '../fake-call/providers/offlineNativeProvider';

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
    
    // 2. If we are in Expo Go, fallback to Gemini Cloud (Because Expo Go cannot run local models)
    try {
      const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
      if (!apiKey) {
        sosLogger.warn(LOG_SOURCE, 'Gemini API key is not configured.');
        return 'Beta, meri awaaz aa rahi hai? Network theek nahi hai.';
      }

      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
      
      const contents = [
        ...this.conversationHistory,
        {
          role: 'user',
          parts: [
            {
              inlineData: {
                mimeType: 'audio/m4a',
                data: audioBase64,
              },
            },
            {
              text: "This is the audio from your child on the phone. Transcribe and understand EXACTLY what they are saying in this audio clip, and then reply dynamically and contextually as their father."
            }
          ]
        }
      ];

      const requestBody = {
        system_instruction: {
          parts: [{ text: FATHER_SYSTEM_PROMPT }]
        },
        contents: contents,
        generationConfig: {
          temperature: 0.7,
        }
      };

      const response = await fetch(geminiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Gemini API error: ${response.status} - ${errText}`);
      }

      const responseData = await response.json();
      const textResult = responseData.candidates?.[0]?.content?.parts?.[0]?.text;

      if (textResult) {
        this.conversationHistory.push({
          role: 'user',
          parts: [{ text: "[Audio message sent by user]" }]
        });
        
        this.conversationHistory.push({
          role: 'model',
          parts: [{ text: textResult.trim() }]
        });
        
        return textResult.trim();
      }

      return 'Tum ho wahan? Main sun raha hoon.';
    } catch (error) {
      sosLogger.warn(LOG_SOURCE, 'Error getting AI response', { error: String(error) });
      return 'Mujhe theek se sunai nahi diya, chalte raho.';
    }
  }
}
