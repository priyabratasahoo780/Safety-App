import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { Platform, Linking } from 'react-native';

import { EmergencyService } from '../../features/emergency/services/emergency.service';
import { FirebaseEmergencyRepository } from '../../features/emergency/repositories/FirebaseEmergencyRepository';
import { FirebaseStorageService } from '../../features/emergency/repositories/FirebaseStorageService';
import { AudioEvidenceService } from '../../features/voice-sos/services/evidence.service';
import { FirebaseGuardianRepository } from '../../features/guardian/repositories/FirebaseGuardianRepository';
import { MockNotificationService } from '../../features/guardian/services/MockNotificationService';
import { EmergencyStatus, NetworkStatus } from '../../features/emergency/types/emergency.types';
import { SupportedLanguage } from '../../features/voice-sos/types/voice.types';
import { authService } from '../../src/services/authService';

const { width } = Dimensions.get('window');

export default function ActiveSosScreen() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(10);
  const [sosFired, setSosFired] = useState(false);
  const [note, setNote] = useState('');
  
  // Waveform bars simulation
  const [waveHeights, setWaveHeights] = useState([15, 30, 20, 45, 10, 25, 35, 15, 40]);

  // Handle countdown
  useEffect(() => {
    if (countdown > 0 && !sosFired) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0 && !sosFired) {
      setSosFired(true);
      triggerManualSOS();
    }
  }, [countdown, sosFired]);

  const triggerManualSOS = async () => {
    try {
      const emergencyService = new EmergencyService({
        emergencyRepo: new FirebaseEmergencyRepository(),
        storageService: new FirebaseStorageService(),
        evidenceService: new AudioEvidenceService(),
        guardianRepo: new FirebaseGuardianRepository(),
        notificationService: new MockNotificationService(),
        whatsAppService: {
          sendWhatsAppAlert: async (phones: string[], event: any) => {
            if (!phones || phones.length === 0) return;
            const profile = await authService.getUserProfile();
            const userName = profile?.name ? profile.name.toUpperCase() : 'YOUR LOVED ONE';
            const timeStr = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
            const locStr = event.location ? `${event.location.latitude},${event.location.longitude}` : 'Unknown';
            const mapLink = event.location ? `https://maps.google.com/?q=${locStr}` : 'Location unavailable';
            let msg = `🚨 EMERGENCY ALERT FROM ${userName} 🚨\n\nI need help immediately! My live location and safety details are being shared with you.\n\n📍 *Location*: ${mapLink}\n⏰ *Time*: ${timeStr}\n🔋 *Battery*: ${event.battery !== undefined ? event.battery + '%' : 'Unknown'}\n📶 *Network*: ${event.network || 'Unknown'}\n⚠️ *Triggered By*: SafeSphere Manual SOS\n\nPlease contact me or the authorities immediately!`;
            if (event.customMessage) msg = event.customMessage;
            
            const phone = phones[0].replace(/[^0-9]/g, '');
            if (!phone) return;
            const url = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
            try { await Linking.openURL(url); } catch(e) {}
          }
        },
        smsService: {
          sendOfflineSMS: async (phones: string[], event: any) => {
            if (!phones || phones.length === 0) return;
            const validPhones = phones.map(p => p.replace(/[^0-9]/g, '')).filter(p => p.length > 0);
            if (validPhones.length === 0) return;
            
            const profile = await authService.getUserProfile();
            const userName = profile?.name ? profile.name.toUpperCase() : 'YOUR LOVED ONE';
            const timeStr = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
            const locStr = event.location ? `${event.location.latitude},${event.location.longitude}` : 'Unknown';
            const mapLink = event.location ? `https://maps.google.com/?q=${locStr}` : 'Location unavailable';
            let msg = `🚨 EMERGENCY ALERT FROM ${userName} 🚨\nHelp needed! Location: ${mapLink}\nTime: ${timeStr}\nBattery: ${event.battery !== undefined ? event.battery + '%' : 'Unknown'}\nTriggered By: SafeSphere Manual SOS`;
            if (event.customMessage) msg = event.customMessage;
            
            if (Platform.OS === 'web') return;
            const phoneList = Platform.OS === 'ios' ? validPhones.join(',') : validPhones.join(';');
            const url = `sms:${phoneList}?body=${encodeURIComponent(msg)}`;
            try { await Linking.openURL(url); } catch(e) {}
          }
        },
        emergencyCallingService: { triggerAutomatedCall: async () => {} }
      });

      await emergencyService.triggerEmergency({
        decision: { shouldTrigger: true, confidenceScore: 100, status: EmergencyStatus.EMERGENCY, reason: 'Manual SOS Button Pressed', timestamp: Date.now(), signals: {} as any, weights: {} as any },
        emotionBreakdown: [],
        soundBreakdown: [],
        location: null, // Should ideally fetch live location
        battery: 100,
        network: NetworkStatus.ONLINE,
        keyword: 'MANUAL_SOS',
        speechText: 'Manual SOS triggered via UI button',
        language: SupportedLanguage.EN_US,
        timeline: [],
      });
    } catch (e) {
      console.log('Error triggering manual SOS:', e);
    }
  };

  // Simulated audio waveform jitter
  useEffect(() => {
    const interval = setInterval(() => {
      setWaveHeights(prev => prev.map(() => Math.floor(Math.random() * 40) + 10));
    }, 150);
    return () => clearInterval(interval);
  }, []);

  const handleCancel = () => {
    // Return back to dashboard
    router.replace('/(drawer)/(tabs)/home');
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
          /* PENDING ALERT COUNTDOWN STATE */
          <View style={styles.alarmStateContainer}>
            <Text style={styles.alarmSubTitle}>PREPARING EMERGENCY DISPATCH</Text>
            
            {/* Countdown Ring */}
            <View style={styles.countdownRing}>
              <View style={styles.countdownRingInner}>
                <Text style={styles.countdownNumber}>{countdown}</Text>
                <Text style={styles.countdownSec}>seconds</Text>
              </View>
            </View>

            <Text style={styles.alarmWarningText}>
              DANGER mode will trigger. Guardians will receive your live tracking map and audio recording.
            </Text>
          </View>
        ) : (
          /* SOS ACTIVE FIRED STATE */
          <View style={styles.alarmStateContainer}>
            <View style={styles.sosLiveGlowCircle}>
              <MaterialCommunityIcons name="alert" size={48} color="#FFFFFF" />
            </View>
            
            <Text style={styles.sosActiveTitle}>SOS IS LIVE</Text>
            <Text style={styles.sosActiveSubtitle}>
              Your guardians and emergency contacts have been notified.
            </Text>

            {/* Audio Waveform simulation */}
            <View style={styles.waveformContainer}>
              {waveHeights.map((h, i) => (
                <View key={i} style={[styles.waveBar, { height: h }]} />
              ))}
            </View>
            <Text style={styles.waveformLabel}>Streaming Ambient Audio & Video...</Text>
          </View>
        )}

        {/* Notified Contacts / Guardians */}
        <View style={styles.guardiansCard}>
          <Text style={styles.guardiansCardTitle}>Notified Guardians</Text>
          <View style={styles.guardiansRow}>
            <View style={styles.guardianItem}>
              <View style={[styles.guardianAvatar, { backgroundColor: '#FCA5A5' }]}>
                <Text style={styles.avatarTxt}>R</Text>
              </View>
              <Text style={styles.guardianName}>Rajesh (Dad)</Text>
              <Text style={[styles.guardianStatus, { color: '#059669' }]}>• Connected</Text>
            </View>

            <View style={styles.guardianItem}>
              <View style={[styles.guardianAvatar, { backgroundColor: '#93C5FD' }]}>
                <Text style={styles.avatarTxt}>A</Text>
              </View>
              <Text style={styles.guardianName}>Anjali</Text>
              <Text style={[styles.guardianStatus, { color: '#D97706' }]}>• Notified</Text>
            </View>
          </View>
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

        {/* Trigger SMS Fallback manual button */}
        <TouchableOpacity style={styles.smsButton}>
          <Feather name="message-square" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
          <Text style={styles.smsButtonText}>Force SMS Alert Fallback</Text>
        </TouchableOpacity>

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

