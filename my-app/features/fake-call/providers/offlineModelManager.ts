import * as FileSystem from 'expo-file-system';

export interface ModelInfo {
  id: string;
  name: string;
  sizeBytes: number;
  url: string;
  filename: string;
}

export const OFFLINE_MODELS: Record<string, ModelInfo> = {
  whisper_tiny: {
    id: 'whisper_tiny',
    name: 'Whisper Tiny Multilingual',
    sizeBytes: 75 * 1024 * 1024,
    url: 'https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-tiny.bin',
    filename: 'ggml-tiny.bin'
  },
  qwen_0_5b: {
    id: 'qwen_0_5b',
    name: 'Qwen 2.5 0.5B (Lite)',
    sizeBytes: 400 * 1024 * 1024,
    url: 'https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct-GGUF/resolve/main/qwen2.5-0.5b-instruct-q4_0.gguf',
    filename: 'qwen2.5-0.5b-instruct-q4_0.gguf'
  },
  qwen_1_5b: {
    id: 'qwen_1_5b',
    name: 'Qwen 2.5 1.5B (Quality)',
    sizeBytes: 1200 * 1024 * 1024,
    url: 'https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct-GGUF/resolve/main/qwen2.5-1.5b-instruct-q4_0.gguf',
    filename: 'qwen2.5-1.5b-instruct-q4_0.gguf'
  }
};

class OfflineModelManager {
  private static instance: OfflineModelManager;
  private modelDirectory = (FileSystem as any).documentDirectory + 'models/';

  private constructor() {}

  static getInstance() {
    if (!OfflineModelManager.instance) {
      OfflineModelManager.instance = new OfflineModelManager();
    }
    return OfflineModelManager.instance;
  }

  async ensureDirectory() {
    const dirInfo = await FileSystem.getInfoAsync(this.modelDirectory);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(this.modelDirectory, { intermediates: true });
    }
  }

  async checkModelExists(modelId: string): Promise<boolean> {
    await this.ensureDirectory();
    const model = OFFLINE_MODELS[modelId];
    if (!model) return false;
    
    const fileInfo = await FileSystem.getInfoAsync(this.modelDirectory + model.filename);
    return fileInfo.exists;
  }

  async deleteModel(modelId: string): Promise<void> {
    const model = OFFLINE_MODELS[modelId];
    if (!model) return;
    
    const path = this.modelDirectory + model.filename;
    const fileInfo = await FileSystem.getInfoAsync(path);
    if (fileInfo.exists) {
      await FileSystem.deleteAsync(path, { idempotent: true });
    }
  }

  createDownloadResumable(
    modelId: string, 
    onProgress: (progress: number) => void
  ): any | null {
    const model = OFFLINE_MODELS[modelId];
    if (!model) return null;

    return FileSystem.createDownloadResumable(
      model.url,
      this.modelDirectory + model.filename,
      {},
      (downloadProgress) => {
        const progress = downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite;
        onProgress(progress);
      }
    );
  }
}

export const modelManager = OfflineModelManager.getInstance();
