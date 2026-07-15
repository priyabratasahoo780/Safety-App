import { AudioModule, RecordingPresets } from 'expo-audio';
import { sosLogger } from '../utils/logger';

const LOG_SOURCE = 'AudioEvidenceService';

export class AudioEvidenceService {
  private recording: any | null = null;
  private isAudioRecording = false;
  private isVideoRecording = false;

  async recordEvidence(durationMs = 10000): Promise<string | null> {
    if (this.isAudioRecording) {
      sosLogger.warn(LOG_SOURCE, 'Already recording audio evidence');
      return null;
    }

    try {
      this.isAudioRecording = true;
      sosLogger.info(LOG_SOURCE, 'Requesting permissions for audio evidence recording');

      const permission = await AudioModule.requestRecordingPermissionsAsync();
      if (permission.status !== 'granted') {
        sosLogger.warn(LOG_SOURCE, 'Audio recording permission denied');
        this.isAudioRecording = false;
        return null;
      }

      await AudioModule.setAudioModeAsync({
        allowsRecording: true,
        playsInSilentMode: true,
      });

      // CRITICAL FIX: Ensure previous recording instance is destroyed before creating a new one
      if (this.recording) {
        try {
           await this.recording.stop?.();
        } catch (e) {
           // Ignore errors from stale instances
        }
        this.recording = null;
      }

      sosLogger.info(LOG_SOURCE, 'Starting audio evidence recording...');
      const recording = new AudioModule.AudioRecorder(RecordingPresets.HIGH_QUALITY);
      await recording.prepareToRecordAsync();
      recording.record();
      this.recording = recording;

      // Wait for the specified duration
      await new Promise(resolve => setTimeout(resolve, durationMs));

      return await this.stopRecording();
    } catch (error) {
      sosLogger.warn(LOG_SOURCE, 'Failed to record audio evidence', { error: String(error) });
      this.isAudioRecording = false;
      return null;
    }
  }

  private async stopRecording(): Promise<string | null> {
    if (!this.recording) return null;

    try {
      sosLogger.info(LOG_SOURCE, 'Stopping audio evidence recording...');
      await this.recording.stop?.();
      const uri = this.recording.uri;
      this.recording = null;
      this.isAudioRecording = false;
      return uri;
    } catch (error) {
      sosLogger.warn(LOG_SOURCE, 'Error stopping audio recording', { error: String(error) });
      this.recording = null;
      this.isAudioRecording = false;
      return null;
    }
  }

  async recordVideoEvidence(durationMs = 10000): Promise<string | null> {
    if (this.isVideoRecording) {
      sosLogger.warn(LOG_SOURCE, 'Already recording video evidence, skipping video');
      return null;
    }

    try {
      this.isVideoRecording = true;
      sosLogger.info(LOG_SOURCE, 'Starting mock video evidence recording...');
      
      // Since background/headless video recording requires native modules 
      // or expo-camera which needs UI, we simulate the recording process here
      await new Promise(resolve => setTimeout(resolve, durationMs));
      
      const simulatedVideoUri = 'file:///simulated/video/evidence.mp4';
      
      this.isVideoRecording = false;
      return simulatedVideoUri;
    } catch (error) {
      sosLogger.warn(LOG_SOURCE, 'Failed to record video evidence', { error: String(error) });
      this.isVideoRecording = false;
      return null;
    }
  }
}
