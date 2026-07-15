import Constants from 'expo-constants';
import * as FileSystem from 'expo-file-system/legacy';
import { VoiceAIProvider } from './VoiceAIProvider';
import { OFFLINE_MODELS } from './offlineModelManager';

let pllama: any;
let whisper: any;

try {
  pllama = require('pllama.rn');
  whisper = require('whisper.rn');
} catch (e) {
  console.warn('Native AI modules not found. Ensure you are using a custom dev client.');
}

export class OfflineNativeProvider implements VoiceAIProvider {
  name = 'Offline Native (Whisper + Qwen)';
  private llamaContext: any = null;
  private whisperContext: any = null;

  isAvailable(): boolean {
    return Constants.appOwnership !== 'expo' && !!pllama && !!whisper;
  }

  async initialize(): Promise<void> {
    if (!this.isAvailable()) {
      throw new Error('Offline Native Provider requires a custom EAS Development Build.');
    }

    try {
      const modelDir = (FileSystem.documentDirectory || '') + 'models/';
      
      // Initialize Whisper
      const whisperPath = modelDir + OFFLINE_MODELS['whisper_tiny'].filename;
      this.whisperContext = await whisper.initWhisper({
        filePath: whisperPath,
        useGpu: true,
      });

      // Initialize Qwen
      const qwenPath = modelDir + OFFLINE_MODELS['qwen_0_5b'].filename;
      this.llamaContext = await pllama.initLlama({
        model: qwenPath,
        use_mlock: true,
        n_ctx: 2048,
        n_gpu_layers: 1, // Basic GPU offloading
      });
      
      // console.log('Successfully loaded local AI models into memory.');
    } catch (e) {
      console.error('Failed to load local models', e);
      throw e;
    }
  }

  async processAudio(audioBase64: string, history: any[]): Promise<string> {
    if (!this.whisperContext || !this.llamaContext) {
      throw new Error('Models not initialized');
    }

    try {
      // 1. Convert base64 audio to temp file for Whisper
      const tempAudioPath = (FileSystem.cacheDirectory || '') + 'temp_speech.wav';
      await FileSystem.writeAsStringAsync(tempAudioPath, audioBase64, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // 2. Transcribe Audio
      const transcribeResult = await this.whisperContext.transcribe(tempAudioPath, {
        language: 'hi', // Hindi/Hinglish
      });
      const transcribedText = transcribeResult.result;
      
      if (!transcribedText || transcribedText.trim() === '') {
        return "Beta, awaz nahi aa rahi hai. Kya tum theek ho?";
      }

      // 3. Generate Multi-Turn ChatML Prompt
      let prompt = `<|im_start|>system\nYou are a loving Indian father on a phone call. Reply affectionately and briefly in Hindi/Hinglish (1-2 sentences max).<|im_end|>\n`;
      
      for (const msg of history) {
        const role = msg.role === 'model' ? 'assistant' : 'user';
        prompt += `<|im_start|>${role}\n${msg.text}<|im_end|>\n`;
      }
      
      prompt += `<|im_start|>user\n${transcribedText}<|im_end|>\n<|im_start|>assistant\n`;

      // 4. Generate LLM Response
      const completion = await this.llamaContext.completion({
        prompt,
        n_predict: 50,
      });

      const responseText = completion.text?.trim() || "Hello beta?";

      // 5. Update Conversation History
      history.push({ role: 'user', text: transcribedText });
      history.push({ role: 'model', text: responseText });

      return responseText;

    } catch (error) {
      console.error("Local inference failed:", error);
      return "Beta, mera signal theek nahi hai. Sab theek hai na?";
    }
  }

  async destroy(): Promise<void> {
    if (this.llamaContext) {
      await this.llamaContext.release();
      this.llamaContext = null;
    }
    if (this.whisperContext) {
      await this.whisperContext.release();
      this.whisperContext = null;
    }
    // console.log('Released native models from memory.');
  }
}
