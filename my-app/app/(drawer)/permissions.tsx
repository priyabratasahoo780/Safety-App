import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, AppState } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import { useCameraPermissions } from 'expo-camera';
import { AudioModule } from 'expo-audio';

export default function PermissionsScreen() {
  const router = useRouter();
  
  // States for permissions
  const [locationStatus, setLocationStatus] = useState<string>('checking...');
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [micStatus, setMicStatus] = useState<string>('checking...');
  const [notifStatus, setNotifStatus] = useState<string>('checking...');

  useEffect(() => {
    checkAllPermissions();
    
    // Re-check when app comes to foreground (in case they changed it in settings)
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (nextAppState === 'active') {
        checkAllPermissions();
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const checkAllPermissions = async () => {
    // Location
    const loc = await Location.getForegroundPermissionsAsync();
    setLocationStatus(loc.status);

    // Notifications
    const notif = await Notifications.getPermissionsAsync();
    setNotifStatus(notif.status);

    // Microphone
    try {
      if (AudioModule && AudioModule.getRecordingPermissionsAsync) {
        const mic = await AudioModule.getRecordingPermissionsAsync();
        setMicStatus(mic.status);
      } else {
        setMicStatus('unsupported');
      }
    } catch (e) {
      setMicStatus('denied');
    }
  };

  const handleRequestLocation = async () => {
    const res = await Location.requestForegroundPermissionsAsync();
    setLocationStatus(res.status);
  };

  const handleRequestMic = async () => {
    try {
      if (AudioModule && AudioModule.requestRecordingPermissionsAsync) {
        const res = await AudioModule.requestRecordingPermissionsAsync();
        setMicStatus(res.status);
      }
    } catch (e) {
      console.warn('Microphone permission request failed', e);
    }
  };

  const handleRequestNotif = async () => {
    const res = await Notifications.requestPermissionsAsync();
    setNotifStatus(res.status);
  };

  const renderPermissionCard = (
    title: string, 
    desc: string, 
    icon: any, 
    status: string, 
    onRequest: () => void
  ) => {
    const isGranted = status === 'granted';
    
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={[styles.iconBox, isGranted ? { backgroundColor: '#D1FAE5' } : {}]}>
            <Feather name={icon} size={22} color={isGranted ? '#10B981' : '#6D35E8'} />
          </View>
          <View style={styles.cardTitleBox}>
            <Text style={styles.cardTitle}>{title}</Text>
            <Text style={[styles.statusText, isGranted ? { color: '#10B981' } : { color: '#EF4444' }]}>
              {status.toUpperCase()}
            </Text>
          </View>
        </View>
        
        <Text style={styles.cardDesc}>{desc}</Text>

        {!isGranted && (
          <TouchableOpacity style={styles.grantBtn} onPress={onRequest}>
            <Text style={styles.grantBtnText}>Grant Permission</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.header, { flexDirection: 'row', alignItems: 'center' }]}>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 8, marginRight: 12 }}><Feather name="arrow-left" size={24} color="#FFFFFF" /></TouchableOpacity>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 8 }}>
          <Feather name="arrow-left" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Permissions & Access</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.pageSubtitle}>
          SafeSphere requires these system permissions to fully protect you during an emergency.
        </Text>

        {renderPermissionCard(
          "Location Services",
          "Required to share your exact live location with Guardians when you trigger an SOS.",
          "map-pin",
          locationStatus,
          handleRequestLocation
        )}

        {renderPermissionCard(
          "Microphone Access",
          "Required to detect the 'Help' wake word, record audio evidence, and converse with the AI Fake Call.",
          "mic",
          micStatus,
          handleRequestMic
        )}

        {renderPermissionCard(
          "Camera Access",
          "Required to silently capture background video evidence during an active SOS incident.",
          "camera",
          cameraPermission?.status || 'checking...',
          () => requestCameraPermission()
        )}

        {renderPermissionCard(
          "Push Notifications",
          "Required to receive emergency alerts and SOS requests from your connected Guardians.",
          "bell",
          notifStatus,
          handleRequestNotif
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#EBF0F9' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 60,
  },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#1F2937' },
  content: { padding: 20, paddingBottom: 60 },
  pageSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 24,
    lineHeight: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F3E8FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardTitleBox: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
  },
  cardDesc: {
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 18,
    marginBottom: 16,
  },
  grantBtn: {
    backgroundColor: '#6D35E8',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  grantBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  }
});
