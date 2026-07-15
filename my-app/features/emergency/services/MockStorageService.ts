import { IStorageService } from '../interfaces/IStorageService';

export class MockStorageService implements IStorageService {
  async uploadEvidence(emergencyId: string, fileName: string, localUri: string, type: 'audio' | 'video' | 'image'): Promise<string> {
    // console.log(`[MockStorageService] Uploading ${type} evidence for ${emergencyId} from ${localUri}`);
    // Simulate upload delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return `mock-storage://evidence/${emergencyId}/${fileName}`;
  }

  async getEvidenceUrls(emergencyId: string): Promise<string[]> {
    return [
      `mock-storage://evidence/${emergencyId}/audio_1.wav`,
    ];
  }
}
