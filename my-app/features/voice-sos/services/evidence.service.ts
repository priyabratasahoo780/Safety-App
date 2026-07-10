import { Audio } from 'expo-av';
import { sosLogger } from '../utils/logger';

const LOG_SOURCE = 'AudioEvidenceService';

export class AudioEvidenceService {
  private recording: Audio.Recording | null = null;
  private isRecording = false;

  async recordEvidence(durationMs = 10000): Promise<string | null> {
    if (this.isRecording) {
      sosLogger.warn(LOG_SOURCE, 'Already recording evidence');
      return null;
    }

    try {
      this.isRecording = true;
      sosLogger.info(LOG_SOURCE, 'Requesting permissions for audio evidence recording');
      
      const permission = await Audio.requestPermissionsAsync();
      if (permission.status !== 'granted') {
        sosLogger.warn(LOG_SOURCE, 'Audio recording permission denied');
        this.isRecording = false;
        return null;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      sosLogger.info(LOG_SOURCE, 'Starting audio evidence recording...');
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      this.recording = recording;

      // Wait for the specified duration (e.g. 10 seconds)
      await new Promise(resolve => setTimeout(resolve, durationMs));

      return await this.stopRecording();
    } catch (error) {
      sosLogger.warn(LOG_SOURCE, 'Failed to record audio evidence', { error });
      this.isRecording = false;
      return null;
    }
  }

  private async stopRecording(): Promise<string | null> {
    if (!this.recording) return null;

    try {
      sosLogger.info(LOG_SOURCE, 'Stopping audio evidence recording...');
      await this.recording.stopAndUnloadAsync();
      const uri = this.recording.getURI();
      this.recording = null;
      this.isRecording = false;
      return uri;
    } catch (error) {
      sosLogger.warn(LOG_SOURCE, 'Error stopping audio recording', { error });
      this.recording = null;
      this.isRecording = false;
      return null;
    }
  }
}
