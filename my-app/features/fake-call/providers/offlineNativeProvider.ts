import Constants from 'expo-constants';
import { VoiceAIProvider } from './VoiceAIProvider';

export class OfflineNativeProvider implements VoiceAIProvider {
  name = 'Offline Native (Whisper + Qwen)';

  isAvailable(): boolean {
    // Cannot run in Expo Go due to missing native modules
    return Constants.appOwnership !== 'expo';
  }

  async initialize(): Promise<void> {
    if (!this.isAvailable()) {
      throw new Error('Offline Native Provider requires a custom EAS Development Build.');
    }
    // Stub for whisper.rn and llama.rn initialization
    console.log('Initializing whisper.rn and llama.rn models from local storage...');
  }

  async processAudio(audioBase64: string, history: any[]): Promise<string> {
    // Stub for native processing
    // 1. Pass audioBase64 to whisper.rn for STT
    // 2. Pass transcribed text to llama.rn for LLM generation
    return 'This is a stub response from the Offline Native Provider.';
  }

  async destroy(): Promise<void> {
    console.log('Releasing native models from memory...');
  }
}
