/**
 * Interface for Storage Services (e.g., Firebase Storage, AWS S3).
 * Responsible for securely uploading evidence (audio/video).
 */
export interface IStorageService {
  /**
   * Uploads an evidence file to the storage provider.
   * @param emergencyId The ID of the emergency session.
   * @param fileName The name of the file to save.
   * @param localUri The local URI of the recorded file.
   * @param type The type of evidence ('audio' | 'video' | 'image').
   * @returns A secure download URL to access the evidence.
   */
  uploadEvidence(emergencyId: string, fileName: string, localUri: string, type: 'audio' | 'video' | 'image'): Promise<string>;

  /**
   * Retrieves a list of evidence URLs associated with an emergency.
   */
  getEvidenceUrls(emergencyId: string): Promise<string[]>;
}
