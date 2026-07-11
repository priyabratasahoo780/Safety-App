import { Audio } from 'expo-av';
import { ServiceLocator } from '../utils/ServiceLocator';
import { EmergencyStatus, NetworkStatus } from '../../emergency/types/emergency.types';
import { SupportedLanguage } from '../types/voice.types';
import { router } from 'expo-router';
import { sosLogger } from '../utils/logger';

const LOG_SOURCE = 'GeminiVoiceService';

export class GeminiVoiceService {
  private static instance: GeminiVoiceService | null = null;
  private recording: Audio.Recording | null = null;
  private isListening: boolean = false;
  private currentLoopId: number = 0;

  private constructor() {}

  public static getInstance(): GeminiVoiceService {
    if (!GeminiVoiceService.instance) {
      GeminiVoiceService.instance = new GeminiVoiceService();
    }
    return GeminiVoiceService.instance;
  }

  /**
   * Starts background recording loop and spike monitoring.
   */
  public async startListening(): Promise<boolean> {
    if (this.isListening) {
      sosLogger.debug(LOG_SOURCE, 'GeminiVoiceService is already running');
      return true;
    }

    try {
      const permission = await Audio.requestPermissionsAsync();
      if (permission.status !== 'granted') {
        sosLogger.warn(LOG_SOURCE, 'Microphone permission denied for voice command bot');
        return false;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
      });

      this.isListening = true;
      this.currentLoopId++;
      sosLogger.info(LOG_SOURCE, `🚀 Starting Gemini Voice Command bot. Loop ID: ${this.currentLoopId}`);

      // Start the async monitoring loop
      this.runMonitoringLoop(this.currentLoopId);
      return true;
    } catch (error) {
      sosLogger.warn(LOG_SOURCE, 'Failed to start Gemini Voice Service', { error: String(error) });
      this.isListening = false;
      return false;
    }
  }

  /**
   * Stops listening loop and cleans up active recording.
   */
  public async stopListening(): Promise<void> {
    if (!this.isListening) return;

    this.isListening = false;
    this.currentLoopId++; // Invalidate active loop
    sosLogger.info(LOG_SOURCE, 'Stopping Gemini Voice Command bot...');

    if (this.recording) {
      try {
        await this.recording.stopAndUnloadAsync();
        sosLogger.info(LOG_SOURCE, 'Stopped active audio recording instance');
      } catch (e) {
        // Ignore errors from stopping
      }
      this.recording = null;
    }
  }

  public getIsListening(): boolean {
    return this.isListening;
  }

  /**
   * Core loop running audio recording segments and watching volume peaks.
   */
  private async runMonitoringLoop(loopId: number): Promise<void> {
    const VOLUME_SPIKE_THRESHOLD_DB = -30; // Threshold for shouting/screaming
    const SECONDS_TO_CAPTURE_POST_SPIKE = 3.5;
    const MAX_SILENT_CHUNK_DURATION_MS = 6000;

    while (this.isListening && loopId === this.currentLoopId) {
      let recordingInstance: Audio.Recording | null = null;
      try {
        sosLogger.debug(LOG_SOURCE, 'Preparing new audio recording chunk...');

        recordingInstance = new Audio.Recording();
        await recordingInstance.prepareToRecordAsync({
          isMeteringEnabled: true,
          android: {
            extension: '.m4a',
            outputFormat: 2, // MPEG_4
            audioEncoder: 3, // AAC
            sampleRate: 16000,
            numberOfChannels: 1,
            bitRate: 64000,
          },
          ios: {
            extension: '.m4a',
            audioQuality: 0x7F, // max
            sampleRate: 16000,
            numberOfChannels: 1,
            bitRate: 64000,
            linearPCMBitDepth: 16,
            linearPCMIsBigEndian: false,
            linearPCMIsFloat: false,
          },
          web: {}
        });

        this.recording = recordingInstance;

        let spikeDetected = false;
        let spikeTime = 0;

        recordingInstance.setOnRecordingStatusUpdate((status) => {
          if (status.isRecording && status.metering !== undefined) {
            // Check for sound peak above threshold
            if (status.metering > VOLUME_SPIKE_THRESHOLD_DB && !spikeDetected) {
              sosLogger.info(LOG_SOURCE, `🔊 Voice/Sound peak detected: ${status.metering.toFixed(1)} dB`);
              spikeDetected = true;
              spikeTime = Date.now();
            }
          }
        });

        await recordingInstance.startAsync();

        // Monitor loop for this chunk
        const startTime = Date.now();
        while (this.isListening && loopId === this.currentLoopId) {
          await new Promise((res) => setTimeout(res, 200));

          const now = Date.now();
          // If sound spike occurred, record for 3.5 more seconds to capture speech
          if (spikeDetected && (now - spikeTime > SECONDS_TO_CAPTURE_POST_SPIKE * 1000)) {
            break;
          }
          // If no spike and chunk duration exceeded, restart
          if (!spikeDetected && (now - startTime > MAX_SILENT_CHUNK_DURATION_MS)) {
            break;
          }
        }

        // Stop current chunk
        await recordingInstance.stopAndUnloadAsync();
        this.recording = null;

        if (this.isListening && loopId === this.currentLoopId && spikeDetected) {
          const uri = recordingInstance.getURI();
          if (uri) {
            // Run analysis asynchronously so we can start the next recording chunk immediately
            this.analyzeAudioForSOS(uri);
          }
        }

      } catch (error) {
        sosLogger.warn(LOG_SOURCE, 'Error in voice command monitoring loop', { error: String(error) });
        if (recordingInstance) {
          try {
            await recordingInstance.stopAndUnloadAsync();
          } catch (e) {}
        }
        // Sleep before retrying to prevent rapid loops
        await new Promise((res) => setTimeout(res, 4000));
      }
    }
  }

  /**
   * Helper that converts recorded audio file to Base64 and asks Gemini to verify.
   */
  private async analyzeAudioForSOS(uri: string): Promise<void> {
    try {
      const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
      if (!apiKey) {
        sosLogger.warn(LOG_SOURCE, 'Gemini API key is not configured. Voice commands cannot be analyzed.');
        return;
      }

      sosLogger.info(LOG_SOURCE, '🤖 Submitting audio chunk to Gemini for intent validation...');

      // 1. Fetch file blob
      const fileResponse = await fetch(uri);
      const blob = await fileResponse.blob();

      // 2. Convert Blob to Base64
      const base64Data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const dataUrl = reader.result as string;
          // Extract base64 part
          resolve(dataUrl.split(',')[1]);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });

      // 3. Request Gemini content generation with strict JSON schema response
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
      const requestBody = {
        contents: [
          {
            parts: [
              {
                inlineData: {
                  mimeType: 'audio/m4a',
                  data: base64Data,
                },
              },
              {
                text: "Analyze the audio carefully. Does it contain distress cries, screams, panic noises, or spoken words requesting help in English, Hindi, Bengali, or Urdu, such as 'help', 'bachao', 'save me', 'emergency', 'help me', 'police', 'mujhe bachao', or similar emergency pleas? Respond strictly in JSON format matching this schema: { \"isEmergency\": boolean, \"detectedKeyword\": string, \"transcript\": string }. Provide no other markdown formatting or conversational text."
              }
            ]
          }
        ],
        generationConfig: {
          responseMimeType: 'application/json',
        }
      };

      const apiResponse = await fetch(geminiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!apiResponse.ok) {
        const errText = await apiResponse.text();
        throw new Error(`Gemini API error: ${apiResponse.status} - ${errText}`);
      }

      const responseData = await apiResponse.json();
      const textResult = responseData.candidates?.[0]?.content?.parts?.[0]?.text;

      if (textResult) {
        const parsed = JSON.parse(textResult.trim());
        sosLogger.info(LOG_SOURCE, 'Gemini intent analysis result:', parsed);

        if (parsed.isEmergency) {
          sosLogger.info(LOG_SOURCE, `🚨 VOICE SOS INTENT VERIFIED! Keyword: "${parsed.detectedKeyword}". Transcript: "${parsed.transcript}"`);
          this.triggerAutomaticSOS(parsed.transcript || parsed.detectedKeyword || 'Voice SOS Triggered');
        } else {
          sosLogger.debug(LOG_SOURCE, 'Gemini: Normal audio chunk, no emergency intent found.');
        }
      }
    } catch (error) {
      sosLogger.warn(LOG_SOURCE, 'Error analyzing audio snippet with Gemini API', { error: String(error) });
    }
  }

  /**
   * Triggers the core emergency service and redirects the application to the active screen.
   */
  private async triggerAutomaticSOS(transcript: string): Promise<void> {
    try {
      const emergencyService = ServiceLocator.getInstance().emergency;
      
      // Stop listening to prevent self-loop triggers or double audio capture
      await this.stopListening();

      // Trigger automatic emergency dispatch (which fires SMS and WhatsApp)
      await emergencyService.triggerEmergency({
        decision: {
          shouldTrigger: true,
          confidenceScore: 100,
          status: EmergencyStatus.EMERGENCY,
          reason: `Gemini Voice Bot: distress speech detected ("${transcript}")`,
          timestamp: Date.now(),
          signals: {
            keywordScore: 100,
            emotionScore: 90,
            soundScore: 90,
            motionScore: 0,
            locationScore: 0,
            timeScore: 0,
            detectedKeyword: 'VOICE_COMMAND_BOT',
            speechText: transcript,
            isFalseAlarmContext: false,
          },
          weights: {} as any,
        },
        emotionBreakdown: [],
        soundBreakdown: [],
        location: null,
        battery: 100,
        network: NetworkStatus.ONLINE,
        keyword: 'VOICE_COMMAND_BOT',
        speechText: transcript,
        language: SupportedLanguage.ENGLISH,
        timeline: [],
      });

      // Silent Dispatch: We do NOT route the user to `/sos/active` for safety reasons.
      // If the phone is snatched, the alert is sent silently in the background without UI flashing.
      sosLogger.info(LOG_SOURCE, 'Silent dispatch completed. No UI redirect initiated to protect user privacy from snatcher.');
    } catch (error) {
      sosLogger.warn(LOG_SOURCE, 'Failed to fire automatic SOS from voice command', { error: String(error) });
      // Restart listening if trigger failed
      this.startListening();
    }
  }
}
