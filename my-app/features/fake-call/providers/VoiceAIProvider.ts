export interface VoiceAIProvider {
  name: string;
  isAvailable(): boolean;
  initialize(): Promise<void>;
  processAudio(audioBase64: string, history: any[]): Promise<string>;
  destroy(): Promise<void>;
}
