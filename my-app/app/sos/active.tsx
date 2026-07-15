import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Dimensions,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { locationService } from '../../src/services/locationService';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { Platform, Linking } from 'react-native';
import { useAuth } from '@clerk/clerk-expo';
import * as SMS from 'expo-sms';
import * as Location from 'expo-location';
import * as Battery from 'expo-battery';
import * as FileSystem from 'expo-file-system/legacy';
import { socketService } from '../../src/services/socketService';
import { CameraView, useCameraPermissions, useMicrophonePermissions } from 'expo-camera';

import { EmergencyService } from '../../features/emergency/services/emergency.service';
import { FirebaseEmergencyRepository } from '../../features/emergency/repositories/FirebaseEmergencyRepository';
import { FirebaseStorageService } from '../../features/emergency/repositories/FirebaseStorageService';
import { AudioEvidenceService } from '../../features/voice-sos/services/evidence.service';
import { TwilioService } from '../../features/adapters/providers/TwilioService';
import { FirebaseGuardianRepository } from '../../features/guardian/repositories/FirebaseGuardianRepository';
import { MockNotificationService } from '../../features/guardian/services/MockNotificationService';
import { EmergencyStatus, NetworkStatus } from '../../features/emergency/types/emergency.types';
import { SupportedLanguage } from '../../features/voice-sos/types/voice.types';
import { authService } from '../../src/services/authService';
import { ServiceLocator } from '../../features/voice-sos/utils/ServiceLocator';
import { sosIncidentService } from '../../features/emergency/services/sosIncidentService';
import { pushNotificationService } from '../../features/emergency/services/pushNotificationService';
import { useUser } from '@clerk/clerk-expo';

const { width } = Dimensions.get('window');

export default function ActiveSosScreen() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(10);
  const [sosFired, setSosFired] = useState(false);
  const [note, setNote] = useState('');
  const [guardiansNotified, setGuardiansNotified] = useState(false);

  // Upload State
  const [uploadState, setUploadState] = useState<'idle' | 'uploading' | 'uploaded' | 'failed'>('idle');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [videoUriToUpload, setVideoUriToUpload] = useState<string | null>(null);

  // Camera & Video Capture State
  const cameraRef = useRef<any>(null);
  const { userId } = useAuth();
  const { user } = useUser();
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [micPermission, requestMicPermission] = useMicrophonePermissions();
  const [isRecordingVideo, setIsRecordingVideo] = useState(false);
  const [cameraFacing, setCameraFacing] = useState<'front' | 'back'>('front');
  const [cameraReady, setCameraReady] = useState(false);
  const [videoUrls, setVideoUrls] = useState<string[]>([]);
  const hasStartedCapture = useRef(false);
  
  const [incidentId, setIncidentId] = useState<string | null>(null);
  const locationSubRef = useRef<any>(null);
  
  const [prefs, setPrefs] = useState<any>(null);
  const [trustedContacts, setTrustedContacts] = useState<any[]>([]);

  useEffect(() => {
    if (userId) {
      authService.getUserProfile(userId).then(profile => {
        if (profile?.safetyPreferences) {
          setPrefs(profile.safetyPreferences);
        } else {
          setPrefs({ autoRecordEvidence: true, smsEnabled: true });
        }
        if (profile?.trustedContacts) {
          setTrustedContacts(profile.trustedContacts);
        }
      });
    }
  }, [userId]);

  // Request permissions
  useEffect(() => {
    (async () => {
      if (cameraPermission && !cameraPermission.granted && cameraPermission.canAskAgain) {
        await requestCameraPermission();
      }
      if (micPermission && !micPermission.granted && micPermission.canAskAgain) {
        await requestMicPermission();
      }
    })();
  }, [cameraPermission, micPermission]);

  // Trigger recording or fallback when SOS is fired
  useEffect(() => {
    if (sosFired && prefs && !hasStartedCapture.current) {
      if (prefs.autoRecordEvidence !== false) {
        if (cameraReady && cameraPermission?.granted && micPermission?.granted && !isRecordingVideo) {
          hasStartedCapture.current = true;
          startEvidenceCapture();
        }
      } else {
        hasStartedCapture.current = true;
      }
    }
  }, [sosFired, cameraReady, cameraPermission, micPermission, prefs, isRecordingVideo]);

  // Create Incident and Location Tracker
  useEffect(() => {
    let isMounted = true;
    let initialLoc: any = null;
    let handleLocationUpdate: any = null;

    if (sosFired && userId && !incidentId) {
      const initIncident = async () => {
        // 1. OFFLINE FIRST: Fire SMS & Telegram IMMEDIATELY before any database await
        if (prefs?.smsEnabled !== false) {
          sendAutomatedSMS([]).catch(e => console.log(e));
          sendAutomatedTelegram([]).catch(e => console.log(e));
        }

        // 2. Create Incident Document in Firebase
        const newIncidentId = await sosIncidentService.createIncident(userId);
        
        if (newIncidentId) setIncidentId(newIncidentId);

        // 3. Start location tracking via Singleton
        handleLocationUpdate = (loc: any) => {
          if (!isMounted) return;
          if (!initialLoc) initialLoc = loc; // capture first loc for immediate dispatch if ready
          if (newIncidentId) sosIncidentService.updateLocation(newIncidentId, loc);
        };
        
        locationService.subscribe(handleLocationUpdate);

        // 4. Delayed Real-Time Dispatch (3 Seconds)
        setTimeout(async () => {
          const batteryLevel = await Battery.getBatteryLevelAsync();
          const guardianIds = trustedContacts.map((c: any) => c.userId).filter((id: string) => id);
          
          socketService.triggerEmergency(
            userId, 
            user?.fullName || 'User', 
            guardianIds, 
            initialLoc ? { lat: initialLoc.coords.latitude, lng: initialLoc.coords.longitude } : null,
            batteryLevel
          );
          const success = await pushNotificationService.sendEmergencyPushToGuardians(userId, user?.fullName || 'User');
          if (isMounted) {
            setGuardiansNotified(success);
          }
        }, 3000);
      };
      initIncident();
    }
    
    return () => {
      isMounted = false;
      if (handleLocationUpdate) {
        locationService.unsubscribe(handleLocationUpdate);
      }
    };
  }, [sosFired, userId]);

  const buildAutomatedEmergencyMessage = async (urls: string[]) => {
    let locationLink = 'Location unavailable';
    try {
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      locationLink = `https://maps.google.com/?q=${loc.coords.latitude},${loc.coords.longitude}`;
    } catch (e) {
      // console.log('Could not get live location for SOS message', e);
    }

    const urlText = urls.length > 0 ? `\n\n📹 Live Evidence:\n${urls.map((url, i) => `Video ${i + 1}: ${url}`).join('\n')}` : '';
    return `🚨 SAFESPHERE EMERGENCY 🚨\n\nI am in danger and need immediate help!\n📍 My Live Location: ${locationLink}${urlText}`;
  };

  const sendAutomatedSMS = async (urls: string[]) => {
    if (prefs?.smsEnabled === false) return;
    const isAvailable = await SMS.isAvailableAsync();
    if (isAvailable) {
      const msg = await buildAutomatedEmergencyMessage(urls);
      const phoneNumbers = trustedContacts.length > 0 ? trustedContacts.map(c => c.phone) : ['8799342780'];
      await SMS.sendSMSAsync(phoneNumbers, msg);
    }
  };

  const sendAutomatedTelegram = async (urls: string[]) => {
    try {
      const msg = await buildAutomatedEmergencyMessage(urls);
      const encodedMsg = encodeURIComponent(msg);
      
      let targetPhone = trustedContacts.length > 0 ? trustedContacts[0].phone : '+918799342780';
      if (!targetPhone.startsWith('+')) targetPhone = '+91' + targetPhone.replace(/\D/g, '');
      
      const telegramUrl = `https://t.me/${targetPhone}?text=${encodedMsg}`;
      
      const canOpen = await Linking.canOpenURL(telegramUrl);
      if (canOpen) {
        await Linking.openURL(telegramUrl);
      } else {
        // console.log('Telegram is not installed or cannot open URL.');
      }
    } catch (error) {
      // console.log('Telegram automated send failed', error);
    }
  };

  const performUpload = async (uri: string) => {
    setUploadState('uploading');
    setUploadProgress(0);
    setVideoUriToUpload(uri);
    
    try {
      const storage = new FirebaseStorageService();
      if (incidentId) await sosIncidentService.updateEvidenceStatus(incidentId, 'uploading');
      
      const url = await storage.uploadEvidence(
        incidentId || 'manual_sos_' + Date.now(), 
        `evidence_${Date.now()}.mp4`, 
        uri, 
        'video',
        (prog) => setUploadProgress(prog)
      );
      
      setVideoUrls([url]);
      if (incidentId) await sosIncidentService.updateEvidenceStatus(incidentId, 'uploaded', url);
      
      // Resend alerts with evidence URL
      await sendAutomatedSMS([url]);
      await sendAutomatedTelegram([url]);

      // Broadcast Video Evidence via Socket
      const guardianIds = trustedContacts.map((c: any) => c.userId).filter((id: string) => id);
      if (userId) {
        socketService.triggerEmergency(userId, user?.fullName || 'User', guardianIds, undefined, undefined, url);
      }
      
      setUploadState('uploaded');
      
      // Cleanup temp file securely
      await FileSystem.deleteAsync(uri, { idempotent: true });
    } catch (err) {
      if (incidentId) await sosIncidentService.updateEvidenceStatus(incidentId, 'failed');
      setUploadState('failed');
    }
  };

  const startEvidenceCapture = async () => {
    setIsRecordingVideo(true);
    try {
      // PREFERENCE: Use front camera as preferred by audit
      setCameraFacing('front');
      await new Promise(r => setTimeout(r, 500)); 
      
      if (cameraRef.current) {
        if (incidentId) await sosIncidentService.updateEvidenceStatus(incidentId, 'recording');
        
        const video = await cameraRef.current.recordAsync({ maxDuration: 15 });
        if (video) {
          await performUpload(video.uri);
        }
      }
    } catch (err) {
      if (incidentId) await sosIncidentService.updateEvidenceStatus(incidentId, 'failed');
    } finally {
      setIsRecordingVideo(false);
    }
  };


  // Waveform bars simulation
  const [waveHeights, setWaveHeights] = useState([15, 30, 20, 45, 10, 25, 35, 15, 40]);

  // Trigger immediately on mount (No timer)
  useEffect(() => {
    const current = ServiceLocator.getInstance().emergency.getCurrentEmergency();
    if (current && current.status === EmergencyStatus.EMERGENCY) {
      setSosFired(true);
      // Already triggered!
    } else if (!sosFired) {
      setSosFired(true);
      triggerManualSOS();
    }
  }, [sosFired]);

  const triggerManualSOS = async () => {
    try {
      const emergencyService = ServiceLocator.getInstance().emergency;

      await emergencyService.triggerEmergency({
        decision: { shouldTrigger: true, confidenceScore: 100, status: EmergencyStatus.EMERGENCY, reason: 'Manual SOS Button Pressed', timestamp: Date.now(), signals: {} as any, weights: {} as any },
        emotionBreakdown: [],
        soundBreakdown: [],
        location: null, // Should ideally fetch live location
        battery: 100,
        network: NetworkStatus.ONLINE,
        keyword: 'MANUAL_SOS',
        speechText: 'Manual SOS triggered via UI button',
        language: SupportedLanguage.ENGLISH,
        timeline: [],
      });
    } catch (e) {
      // console.log('Error triggering manual SOS:', e);
    }
  };

  // Simulated audio waveform jitter
  useEffect(() => {
    const interval = setInterval(() => {
      setWaveHeights(prev => prev.map(() => Math.floor(Math.random() * 40) + 10));
    }, 150);
    return () => clearInterval(interval);
  }, []);

  const getEmergencyMessage = () => {
    return `🚨 *SAFESPHERE EMERGENCY* 🚨\n\n` +
           `I am in danger and need immediate help!\n\n` +
           `📍 *Live Location (Accuracy: 5m):*\nhttps://maps.google.com/?q=22.5726,88.3639\n\n` +
           `📹 *Live Evidence (Audio/Video):*\nhttps://safesphere.app/evidence/sos_xyz123\n\n` +
           `🔋 *Battery:* 85%\n` +
           `${note ? `📝 *Note:* ${note}\n` : ''}\n` +
           `Please send help immediately!`;
  };

  const handleManualSMS = async () => {
    const isAvailable = await SMS.isAvailableAsync();
    if (isAvailable) {
      await SMS.sendSMSAsync(
        ['+917870929584'],
        getEmergencyMessage()
      );
    } else {
      alert("SMS is not available on this device");
    }
  };

  const handleManualWhatsApp = () => {
    const msg = encodeURIComponent(getEmergencyMessage());
    Linking.openURL(`whatsapp://send?phone=+917870929584&text=${msg}`).catch(() => {
      alert("WhatsApp is not installed on your device.");
    });
  };

  const handleCancel = () => {
    Alert.alert(
      "End SOS?",
      "Your Guardians will be informed that the emergency session has ended.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "End SOS", 
          style: "destructive", 
          onPress: async () => {
            if (incidentId) await sosIncidentService.endIncident(incidentId);
            if (locationSubRef.current) locationSubRef.current.remove();
            
            // Cancel via Socket
            if (userId) {
              const guardianIds = trustedContacts.map((c: any) => c.userId).filter((id: string) => id);
              socketService.cancelEmergency(userId, user?.fullName || 'User', guardianIds);
            }

            import('react-native').then(({ DeviceEventEmitter }) => {
              DeviceEventEmitter.emit('stop_sos');
            });
            ServiceLocator.getInstance().emergency.resolveEmergency();
            ServiceLocator.getInstance().mic.stop();
            router.replace('/(drawer)/(tabs)/home');
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />

      {/* Top Header Status */}
      <View style={styles.header}>
        <View style={styles.recordingIndicator}>
          <View style={styles.recordingDot} />
          <Text style={styles.recordingText}>EVIDENCE CAPTURE ON</Text>
        </View>
        <TouchableOpacity style={styles.closeBtn} onPress={handleCancel}>
          <Feather name="x" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Main Alert Body */}
      <View style={styles.body}>
        {!sosFired ? (
          <View style={styles.alarmStateContainer}>
            <Text style={styles.alarmSubTitle}>PREPARING EMERGENCY DISPATCH...</Text>
          </View>
        ) : (
          /* SOS ACTIVE FIRED STATE */
          <View style={styles.alarmStateContainer}>
            {prefs?.autoRecordEvidence !== false ? (
              <View style={styles.cameraLiveFeedContainer}>
                <CameraView
                  ref={cameraRef}
                  style={styles.cameraLiveFeed}
                  facing={cameraFacing}
                  mode="video"
                  onCameraReady={() => setCameraReady(true)}
                />
                {isRecordingVideo && (
                  <View style={styles.recBadge}>
                    <View style={styles.recDot} />
                    <Text style={styles.recText}>REC</Text>
                  </View>
                )}
              </View>
            ) : (
              <View style={styles.sosLiveGlowCircle}>
                <MaterialCommunityIcons name="alert" size={48} color="#FFFFFF" />
              </View>
            )}

            <Text style={styles.sosActiveTitle}>SOS IS LIVE</Text>
            <Text style={styles.sosActiveSubtitle}>
              Evidence is recording. Tap below to blast manual alerts.
            </Text>

            {/* Audio Waveform simulation */}
            <View style={styles.waveformContainer}>
              {waveHeights.map((h, i) => (
                <View key={i} style={[styles.waveBar, { height: h }]} />
              ))}
            </View>
            <Text style={styles.waveformLabel}>Streaming Ambient Audio & Video...</Text>

            {uploadState === 'uploading' && (
              <View style={{ marginTop: 15, width: '80%', alignSelf: 'center' }}>
                <Text style={{ color: '#FCD34D', textAlign: 'center', marginBottom: 5, fontSize: 12, fontWeight: '600' }}>
                  Uploading Evidence: {Math.round(uploadProgress)}%
                </Text>
                <View style={{ height: 4, backgroundColor: '#374151', borderRadius: 2, overflow: 'hidden' }}>
                  <View style={{ height: '100%', width: `${uploadProgress}%`, backgroundColor: '#FCD34D' }} />
                </View>
              </View>
            )}
            
            {uploadState === 'failed' && videoUriToUpload && (
              <TouchableOpacity 
                style={{ marginTop: 15, backgroundColor: '#DC2626', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, alignSelf: 'center' }}
                onPress={() => performUpload(videoUriToUpload)}
              >
                <Text style={{ color: '#FFFFFF', fontWeight: 'bold', fontSize: 13 }}>Upload Failed - Tap to Retry</Text>
              </TouchableOpacity>
            )}
            
            {uploadState === 'uploaded' && (
              <View style={{ marginTop: 15, backgroundColor: 'rgba(5, 150, 105, 0.2)', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, alignSelf: 'center', borderColor: '#059669', borderWidth: 1 }}>
                <Text style={{ color: '#34D399', fontWeight: 'bold', fontSize: 13 }}>Evidence Secured ✓</Text>
              </View>
            )}
          </View>
        )}

        {/* Notified Contacts / Guardians */}
        <View style={styles.guardiansCard}>
          <Text style={styles.guardiansCardTitle}>Notified Guardians</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.guardiansRow}>
            {trustedContacts.length > 0 ? (
              trustedContacts.map((contact, index) => {
                const colors = ['#FCA5A5', '#93C5FD', '#A7F3D0', '#FDE047', '#C4B5FD'];
                const bgColor = colors[index % colors.length];
                const initial = contact.name ? contact.name.charAt(0).toUpperCase() : '?';
                return (
                  <View key={index} style={[styles.guardianItem, { minWidth: 140 }]}>
                    <View style={[styles.guardianAvatar, { backgroundColor: bgColor }]}>
                      <Text style={styles.avatarTxt}>{initial}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.guardianName} numberOfLines={1}>{contact.name || contact.phone}</Text>
                      <Text style={[styles.guardianStatus, { color: guardiansNotified ? '#059669' : '#D97706' }]}>
                        {guardiansNotified ? '• Notified' : '• Sending...'}
                      </Text>
                    </View>
                  </View>
                );
              })
            ) : (
              <Text style={{ color: '#9CA3AF', fontSize: 13, fontStyle: 'italic', paddingVertical: 10 }}>No trusted contacts added.</Text>
            )}
          </ScrollView>
        </View>

        {/* Note input field */}
        <View style={styles.noteContainer}>
          <Feather name="edit-2" size={16} color="#9CA3AF" style={styles.noteIcon} />
          <TextInput
            style={styles.noteInput}
            placeholder="Type custom note to guardians..."
            placeholderTextColor="#9CA3AF"
            value={note}
            onChangeText={setNote}
          />
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
          {/* Trigger WhatsApp manual button */}
          <TouchableOpacity style={[styles.smsButton, { flex: 1, marginRight: 10, backgroundColor: '#25D366' }]} onPress={handleManualWhatsApp}>
            <MaterialCommunityIcons name="whatsapp" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
            <Text style={styles.smsButtonText}>WhatsApp</Text>
          </TouchableOpacity>

          {/* Trigger SMS Fallback manual button */}
          <TouchableOpacity style={[styles.smsButton, { flex: 1 }]} onPress={handleManualSMS}>
            <Feather name="message-square" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
            <Text style={styles.smsButtonText}>Send SMS</Text>
          </TouchableOpacity>
        </View>

        {/* Cancel Action */}
        <TouchableOpacity
          style={styles.cancelButton}
          activeOpacity={0.8}
          onPress={handleCancel}
        >
          <Text style={styles.cancelText}>{"I'm Safe, Cancel Alarm"}</Text>
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0E17', // Extremely dark surface.dark
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 15,
  },
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(220, 38, 38, 0.15)',
    borderColor: '#DC2626',
    borderWidth: 1,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 14,
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#DC2626',
    marginRight: 8,
  },
  recordingText: {
    color: '#DC2626',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  closeBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  body: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'space-around',
    paddingBottom: 20,
  },
  alarmStateContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  alarmSubTitle: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 2,
    marginBottom: 20,
  },
  countdownRing: {
    width: width * 0.45,
    height: width * 0.45,
    borderRadius: (width * 0.45) / 2,
    borderWidth: 8,
    borderColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.05)',
  },
  countdownRingInner: {
    alignItems: 'center',
  },
  countdownNumber: {
    color: '#FFFFFF',
    fontSize: 64,
    fontWeight: '900',
  },
  countdownSec: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  alarmWarningText: {
    color: '#9CA3AF',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 25,
    lineHeight: 18,
    maxWidth: '85%',
  },
  sosLiveGlowCircle: {
    width: width * 0.28,
    height: width * 0.28,
    borderRadius: (width * 0.28) / 2,
    backgroundColor: '#DC2626',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 8,
    marginBottom: 20,
  },
  cameraLiveFeedContainer: {
    width: width * 0.4,
    height: width * 0.4,
    borderRadius: (width * 0.4) / 2,
    backgroundColor: '#1F2937',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 8,
    marginBottom: 20,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#DC2626',
  },
  cameraLiveFeed: {
    width: '100%',
    height: '100%',
  },
  recBadge: {
    position: 'absolute',
    top: 15,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  recDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#DC2626',
    marginRight: 4,
  },
  recText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  sosActiveTitle: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: 1,
  },
  sosActiveSubtitle: {
    color: '#9CA3AF',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 8,
    maxWidth: '80%',
  },
  waveformContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 60,
    marginTop: 25,
    gap: 6,
  },
  waveBar: {
    width: 4,
    backgroundColor: '#DC2626',
    borderRadius: 2,
  },
  waveformLabel: {
    color: '#9CA3AF',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 10,
  },
  guardiansCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
    width: '100%',
  },
  guardiansCardTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 12,
    opacity: 0.8,
  },
  guardiansRow: {
    flexDirection: 'row',
    gap: 20,
  },
  guardianItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    flex: 1,
  },
  guardianAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  avatarTxt: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  guardianName: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    flex: 1,
  },
  guardianStatus: {
    fontSize: 10,
    fontWeight: '700',
    marginLeft: 6,
  },
  noteContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 48,
    width: '100%',
  },
  noteIcon: {
    marginRight: 10,
  },
  noteInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 13,
  },
  smsButton: {
    flexDirection: 'row',
    backgroundColor: 'rgba(109, 40, 217, 0.3)',
    borderColor: '#6D28D9',
    borderWidth: 1,
    borderRadius: 14,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  smsButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  cancelButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  cancelText: {
    color: '#DC2626',
    fontWeight: '800',
    fontSize: 16,
  },
});

