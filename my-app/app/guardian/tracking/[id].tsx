import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, Dimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import MapView, { Marker } from 'react-native-maps';
import { Video, ResizeMode } from 'expo-av';
import { SOSIncident, sosIncidentService } from '../../../features/emergency/services/sosIncidentService';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../src/config/firebaseConfig';

const { width, height } = Dimensions.get('window');

export default function GuardianTrackingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  
  const [incident, setIncident] = useState<SOSIncident | null>(null);
  const [protectedUser, setProtectedUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const videoRef = useRef<Video>(null);

  useEffect(() => {
    if (!id) return;

    // Listen to real-time incident updates
    const unsub = sosIncidentService.listenToIncident(id, async (data) => {
      if (data) {
        setIncident(data);
        
        // Fetch victim profile if not fetched yet
        if (!protectedUser) {
          const userDoc = await getDoc(doc(db, 'users', data.protectedUserId));
          if (userDoc.exists()) {
            setProtectedUser(userDoc.data());
          }
        }
      }
      setLoading(false);
    });

    return () => unsub();
  }, [id, protectedUser]);

  const handleDismiss = () => {
    Alert.alert(
      "Dismiss Tracking?",
      "Are you sure you want to stop tracking this emergency?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Dismiss", style: "destructive", onPress: () => router.back() }
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#EF4444" />
        <Text style={{ marginTop: 10, color: '#6B7280' }}>Locating Emergency...</Text>
      </View>
    );
  }

  if (!incident) {
    return (
      <View style={styles.centerContainer}>
        <Feather name="alert-triangle" size={48} color="#9CA3AF" />
        <Text style={{ marginTop: 10, color: '#6B7280', fontSize: 16 }}>Incident not found or has ended.</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const loc = incident.latestLocation;
  const initialRegion = loc ? {
    latitude: loc.latitude,
    longitude: loc.longitude,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  } : undefined;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>SOS ACTIVE</Text>
          <Text style={styles.headerSubtitle}>
            {protectedUser?.fullName || 'Protected User'} is in danger
          </Text>
        </View>
        <TouchableOpacity style={styles.dismissBtn} onPress={handleDismiss}>
          <Feather name="x" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Map View */}
      <View style={styles.mapContainer}>
        {loc ? (
          <MapView
            style={StyleSheet.absoluteFillObject}
            region={{
              latitude: loc.latitude,
              longitude: loc.longitude,
              latitudeDelta: 0.005,
              longitudeDelta: 0.005,
            }}
          >
            <Marker
              coordinate={{ latitude: loc.latitude, longitude: loc.longitude }}
              title={protectedUser?.fullName || 'Victim'}
              description="Live Location"
            >
              <View style={styles.markerContainer}>
                <View style={styles.markerCore} />
                <View style={styles.markerPulse} />
              </View>
            </Marker>
          </MapView>
        ) : (
          <View style={[styles.centerContainer, { backgroundColor: '#F3F4F6' }]}>
            <Feather name="map-pin" size={32} color="#9CA3AF" />
            <Text style={{ marginTop: 10, color: '#6B7280' }}>Waiting for location data...</Text>
          </View>
        )}
      </View>

      {/* Video Evidence Overlay */}
      {incident.evidenceStatus === 'uploaded' && incident.evidenceUrl && (
        <View style={styles.videoContainer}>
          <View style={styles.videoHeader}>
            <Feather name="video" size={16} color="#FFFFFF" />
            <Text style={styles.videoTitle}>Live Evidence Captured</Text>
          </View>
          <Video
            ref={videoRef}
            style={styles.videoPlayer}
            source={{ uri: incident.evidenceUrl }}
            useNativeControls
            resizeMode={ResizeMode.COVER}
            isLooping
            shouldPlay
          />
        </View>
      )}

      {/* Status Footer */}
      <View style={styles.footer}>
        <View style={styles.statusRow}>
          <View style={[styles.statusDot, incident.status === 'active' ? { backgroundColor: '#EF4444' } : { backgroundColor: '#10B981' }]} />
          <Text style={styles.statusText}>
            Status: {incident.status.toUpperCase()}
          </Text>
        </View>
        <Text style={styles.timeText}>
          Started: {incident.activatedAt?.toDate?.().toLocaleTimeString() || 'Unknown'}
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#EF4444',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 1,
  },
  headerSubtitle: {
    color: '#FEE2E2',
    fontSize: 14,
    marginTop: 2,
  },
  dismissBtn: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    padding: 10,
    borderRadius: 20,
  },
  mapContainer: {
    flex: 1,
    backgroundColor: '#1F2937',
  },
  markerContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  markerCore: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#EF4444',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    zIndex: 2,
  },
  markerPulse: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(239, 68, 68, 0.3)',
    zIndex: 1,
  },
  videoContainer: {
    position: 'absolute',
    bottom: 90,
    right: 20,
    width: width * 0.45,
    height: (width * 0.45) * 1.5, // vertical video aspect ratio
    backgroundColor: '#000000',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#EF4444',
    elevation: 10,
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  videoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EF4444',
    paddingVertical: 6,
    paddingHorizontal: 10,
    gap: 6,
  },
  videoTitle: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  videoPlayer: {
    flex: 1,
  },
  footer: {
    backgroundColor: '#1F2937',
    padding: 20,
    paddingBottom: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  statusText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  timeText: {
    color: '#9CA3AF',
    fontSize: 12,
  },
  backBtn: {
    marginTop: 20,
    backgroundColor: '#EF4444',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  backBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  }
});
