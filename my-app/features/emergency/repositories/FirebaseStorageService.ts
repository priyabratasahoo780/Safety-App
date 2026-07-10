import { ref, uploadBytesResumable, getDownloadURL, listAll } from 'firebase/storage';
import { storage } from '../../../src/config/firebaseConfig';
import { IStorageService } from '../interfaces/IStorageService';
import { sosLogger } from '../../voice-sos/utils/logger';

const LOG_SOURCE = 'FirebaseStorageService';

export class FirebaseStorageService implements IStorageService {
  async uploadEvidence(
    emergencyId: string, 
    fileName: string, 
    localUri: string, 
    type: 'audio' | 'video' | 'image'
  ): Promise<string> {
    try {
      sosLogger.info(LOG_SOURCE, `Starting upload for ${type} evidence: ${fileName}`);
      
      const response = await fetch(localUri);
      const blob = await response.blob();
      
      const storageRef = ref(storage, `emergencies/${emergencyId}/evidence/${fileName}`);
      
      const uploadTask = uploadBytesResumable(storageRef, blob, {
        contentType: type === 'audio' ? 'audio/m4a' : type === 'video' ? 'video/mp4' : 'image/jpeg'
      });
      
      return new Promise((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            sosLogger.debug(LOG_SOURCE, `Upload is ${progress}% done`);
          },
          (error) => {
            sosLogger.warn(LOG_SOURCE, 'Failed to upload evidence to Firebase Storage', { error });
            reject(error);
          },
          async () => {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            sosLogger.info(LOG_SOURCE, `Upload successful, available at: ${downloadURL}`);
            resolve(downloadURL);
          }
        );
      });
    } catch (error) {
      sosLogger.warn(LOG_SOURCE, 'Error in uploadEvidence', { error });
      throw error;
    }
  }

  async getEvidenceUrls(emergencyId: string): Promise<string[]> {
    try {
      const folderRef = ref(storage, `emergencies/${emergencyId}/evidence`);
      const result = await listAll(folderRef);
      
      const urls = await Promise.all(
        result.items.map((itemRef) => getDownloadURL(itemRef))
      );
      
      return urls;
    } catch (error) {
      sosLogger.warn(LOG_SOURCE, 'Failed to list evidence URLs', { error });
      return [];
    }
  }
}
