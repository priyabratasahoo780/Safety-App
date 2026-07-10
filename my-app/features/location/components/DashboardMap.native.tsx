import React, { useRef } from 'react';
import { View, StyleSheet, Platform, Text } from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import { Map as MapIcon, ShieldCheck } from 'lucide-react-native';

export function DashboardMap() {
  const mapRef = useRef<MapView>(null);
  
  // Approximate coordinates for Sector 4, Salt Lake, Kolkata
  const kolkataCoords = {
    latitude: 22.5750,
    longitude: 88.4280,
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_DEFAULT}
        initialRegion={{
          latitude: kolkataCoords.latitude,
          longitude: kolkataCoords.longitude,
          latitudeDelta: 0.015,
          longitudeDelta: 0.015,
        }}
        showsUserLocation={false}
        scrollEnabled={false}
        zoomEnabled={false}
        pitchEnabled={false}
        rotateEnabled={false}
      >
        <Marker coordinate={kolkataCoords}>
          <View style={styles.userMarkerContainer}>
            <View style={styles.userMarkerInner} />
          </View>
        </Marker>
      </MapView>
      
      {/* Green safe zone overlay centered on the user */}
      <View style={styles.safeZoneCircle} pointerEvents="none" />
      
      {/* Safe Haven Markers overlay (fake UI to match design) */}
      <View style={[styles.havenMarker, { top: '25%', left: '20%' }]} pointerEvents="none">
        <ShieldCheck size={16} color="#16A34A" />
      </View>
      <View style={[styles.havenMarker, { top: '55%', left: '75%' }]} pointerEvents="none">
        <ShieldCheck size={16} color="#16A34A" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#E8F5E9',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  userMarkerContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(109, 53, 232, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userMarkerInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#6D35E8',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  safeZoneCircle: {
    position: 'absolute',
    top: '15%',
    left: '10%',
    width: '80%',
    height: '70%',
    borderRadius: 100,
    backgroundColor: 'rgba(76, 175, 80, 0.08)',
    borderWidth: 2,
    borderColor: 'rgba(76, 175, 80, 0.15)',
    borderStyle: 'dashed',
  },
  havenMarker: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
    padding: 6,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
});
