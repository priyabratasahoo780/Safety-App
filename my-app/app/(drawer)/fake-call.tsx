import React, { useEffect, useState, useRef } from 'react';
import { Feather } from '@expo/vector-icons';
import { TouchableOpacity, View, Text, StyleSheet, Pressable, useWindowDimensions, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Phone, PhoneOff, UserRound, Settings } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import * as Speech from 'expo-speech';
import { AudioModule } from 'expo-audio';
import * as FileSystem from 'expo-file-system/legacy';
import { AIFakeCallService } from '../../features/emergency/services/aiFakeCallService';

export default function FakeCallScreen() {
  const router = useRouter();
  
  // Call States: ringing -> connecting -> speaking/listening/thinking
  const [callState, setCallState] = useState<'ringing' | 'connecting' | 'speaking' | 'listening' | 'thinking'>('ringing');
  const [callDuration, setCallDuration] = useState(0);
  
  const recordingRef = useRef<any | null>(null);
  const isComponentMounted = useRef(true);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Ringing animation
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Request Mic Permission Immediately on Mount
  useEffect(() => {
    (async () => {
      try {
        await AudioModule.requestRecordingPermissionsAsync();
      } catch (error) {
        console.warn('Failed to request mic permission:', error);
      }
    })();
  }, []);

  // Setup Ringing Vibration and Animation
  useEffect(() => {
    let vibrateInterval: ReturnType<typeof setInterval>;
    
    if (callState === 'ringing') {
      vibrateInterval = setInterval(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      }, 1500);

      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.1, duration: 800, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true })
        ])
      ).start();
    } else {
      pulseAnim.stopAnimation();
    }

    return () => {
      if (vibrateInterval) clearInterval(vibrateInterval);
    };
  }, [callState]);

  // Cleanup on unmount
  useEffect(() => {
    isComponentMounted.current = true;
    return () => {
      isComponentMounted.current = false;
      if (timerRef.current) clearInterval(timerRef.current);
      Speech.stop();
      if (recordingRef.current) {
        recordingRef.current.stop?.().catch(() => {});
      }
    };
  }, []);

  const handleAcceptCall = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setCallState('connecting');
    
    // Start duration timer
    timerRef.current = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);

    // Initialize AI Conversation
    AIFakeCallService.getInstance().resetHistory();
    try {
      await AIFakeCallService.getInstance().initialize();
    } catch (e) {
      console.warn("Failed to initialize offline models", e);
    }
    
    // Simulate connection delay
    await new Promise(r => setTimeout(r, 800));
    if (!isComponentMounted.current) return;
    
    speakAndThenListen("Beta tum theek ho? Kahan par ho abhi?");
  };

  const handleEndCall = () => {
    isComponentMounted.current = false;
    Speech.stop();
    if (recordingRef.current) {
      recordingRef.current.stop?.().catch(() => {});
    }
    if (timerRef.current) clearInterval(timerRef.current);
    
    // Free up heavy native AI models from memory
    AIFakeCallService.getInstance().destroy();
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const speakAndThenListen = (text: string) => {
    if (!isComponentMounted.current) return;
    setCallState('speaking');
    Speech.speak(text, {
      language: 'hi-IN',
      pitch: 0.9,
      rate: 0.95,
      onDone: () => {
        if (isComponentMounted.current) {
          startListeningChunk();
        }
      },
      onError: () => {
        if (isComponentMounted.current) {
          startListeningChunk();
        }
      }
    });
  };

  const startListeningChunk = async () => {
    if (!isComponentMounted.current) return;
    setCallState('listening');

    try {
      const permission = await AudioModule.requestRecordingPermissionsAsync();
      if (permission.status !== 'granted') throw new Error('No mic permission');

      await AudioModule.setAudioModeAsync({
        allowsRecording: true,
        playsInSilentMode: true,
      });

      const recording = new AudioModule.AudioRecorder({
        isMeteringEnabled: true,
        android: {
          extension: '.m4a',
          outputFormat: 'default',
          audioEncoder: 'default',
          sampleRate: 16000,
        },
        ios: {
          extension: '.m4a',
          audioQuality: 127,
          sampleRate: 16000,
          bitRateStrategy: 0,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
        web: {}
      });

      recordingRef.current = recording;
      await recording.prepareToRecordAsync();
      recording.record();

      // Listen for 6 seconds to give user time to reply
      setTimeout(async () => {
        if (!isComponentMounted.current) return;
        await stopListeningAndProcess(recording);
      }, 6000);

    } catch (error) {
      console.warn("Failed to start recording chunk", error);
      setTimeout(() => speakAndThenListen("Mujhe kuch sunai nahi diya, ek baar phir se bolo."), 2000);
    }
  };

  const stopListeningAndProcess = async (recording: any) => {
    try {
      setCallState('thinking');
      await recording.stop?.();
      recordingRef.current = null;

      const uri = recording.uri;
      if (!uri) {
        speakAndThenListen("Mujhe samajh nahi aaya.");
        return;
      }

      // Convert to base64 reliably using expo-file-system
      const base64Data = await FileSystem.readAsStringAsync(uri, {
        encoding: 'base64' as any,
      });

      // Get AI Response
      const aiResponse = await AIFakeCallService.getInstance().getResponseFromAudio(base64Data);
      
      if (isComponentMounted.current) {
        speakAndThenListen(aiResponse);
      }
    } catch (error) {
      console.warn("Error processing audio chunk", error);
      if (isComponentMounted.current) {
        speakAndThenListen("Tum ho wahan?");
      }
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const getStatusText = () => {
    switch(callState) {
      case 'ringing': return 'Incoming...';
      case 'connecting': return 'Connecting...';
      case 'speaking': return 'Dad is speaking...';
      case 'listening': return 'Dad is listening...';
      case 'thinking': return '...';
      default: return 'Connected';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      <View style={[styles.header, { flexDirection: 'row', alignItems: 'center' }]}>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 8, marginRight: 12 }}><Feather name="arrow-left" size={24} color="#111827" /></TouchableOpacity>
        <View style={styles.headerLeft} />
        <Text style={styles.callerStatus}>
          {callState === 'ringing' ? 'Mobile' : formatTime(callDuration)}
        </Text>
        <Pressable style={styles.headerRight} onPress={() => router.push('/(drawer)/offline-models')}>
          {callState === 'ringing' && <Settings size={24} color="#8E8E93" />}
        </Pressable>
      </View>

      <View style={styles.callerInfo}>
        <View style={styles.avatar}>
          <UserRound size={60} color="#FFFFFF" />
        </View>
        <Text style={styles.callerName}>Dad</Text>
        <Text style={styles.callerType}>Mobile</Text>
        
        {callState !== 'ringing' && (
          <Text style={[
            styles.stateIndicator, 
            callState === 'listening' ? styles.stateListening : null
          ]}>
            {getStatusText()}
          </Text>
        )}
      </View>

      {/* Conditional Action Buttons */}
      <View style={styles.actions}>
        {callState === 'ringing' ? (
          <View style={styles.ringingActions}>
            <Pressable style={styles.declineButton} onPress={handleEndCall}>
              <PhoneOff size={32} color="#FFFFFF" />
              <Text style={styles.actionLabel}>Decline</Text>
            </Pressable>
            
            <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
              <Pressable style={styles.acceptButton} onPress={handleAcceptCall}>
                <Phone size={32} color="#FFFFFF" fill="#FFFFFF" />
                <Text style={styles.actionLabel}>Accept</Text>
              </Pressable>
            </Animated.View>
          </View>
        ) : (
          <Pressable style={styles.endCallButton} onPress={handleEndCall}>
            <PhoneOff size={32} color="#FFFFFF" />
          </Pressable>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1C1C1E',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 20,
    paddingHorizontal: 20,
  },
  headerLeft: {
    width: 40,
  },
  headerRight: {
    width: 40,
    alignItems: 'flex-end',
  },
  callerStatus: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '400',
  },
  callerInfo: {
    alignItems: 'center',
    marginTop: 60,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#8E8E93',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  callerName: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '600',
    marginBottom: 8,
  },
  callerType: {
    color: '#EBEBF5',
    fontSize: 18,
    marginBottom: 20,
  },
  stateIndicator: {
    color: '#8E8E93',
    fontSize: 14,
    fontWeight: '500',
    fontStyle: 'italic',
  },
  stateListening: {
    color: '#34C759', // Green to indicate mic is open
  },
  actions: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 60,
  },
  ringingActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 60,
  },
  declineButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center',
  },
  acceptButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#34C759',
    justifyContent: 'center',
    alignItems: 'center',
  },
  endCallButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionLabel: {
    color: '#FFFFFF',
    position: 'absolute',
    bottom: -30,
    fontWeight: '500',
  }
});
