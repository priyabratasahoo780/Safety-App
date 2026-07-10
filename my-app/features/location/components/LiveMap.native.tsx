import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import * as Location from 'expo-location';

interface LiveMapProps {
  location: Location.LocationObject | null;
  errorMsg: string | null;
}

export function LiveMap({ location, errorMsg }: LiveMapProps) {
  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    if (location && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      });
    }
  }, [location]);

  if (!location) {
    return (
      <View style={[styles.simulatedMap, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: '#6B7280' }}>
          {errorMsg ? errorMsg : 'Acquiring GPS location...'}
        </Text>
      </View>
    );
  }

  return (
    <MapView
      ref={mapRef}
      style={{ flex: 1, borderRadius: 20 }}
      provider={PROVIDER_DEFAULT}
      initialRegion={{
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      }}
      showsUserLocation={false}
      pitchEnabled={false}
    >
      <Marker
        coordinate={{
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        }}
      >
        <View style={styles.userLocationMarker}>
          <View style={styles.userLocationTooltip}>
            <Text style={styles.userLocationTooltipText}>You are here</Text>
            <View style={styles.userLocationTooltipArrow} />
          </View>
          <View style={styles.userPinRipple3} />
          <View style={styles.userPinRipple2} />
          <View style={styles.userPinRipple1} />
          <View style={styles.userPinCenter} />
        </View>
      </Marker>
    </MapView>
  );
}

const styles = StyleSheet.create({
  simulatedMap: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 20,
  },
  userLocationMarker: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 100,
    height: 100,
  },
  userLocationTooltip: {
    position: 'absolute',
    top: -30,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    zIndex: 10,
  },
  userLocationTooltipText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1F2937',
  },
  userLocationTooltipArrow: {
    position: 'absolute',
    bottom: -4,
    alignSelf: 'center',
    width: 8,
    height: 8,
    backgroundColor: '#FFFFFF',
    transform: [{ rotate: '45deg' }],
  },
  userPinCenter: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#3B82F6',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    zIndex: 2,
  },
  userPinRipple1: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
  },
  userPinRipple2: {
    position: 'absolute',
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
  },
  userPinRipple3: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(59, 130, 246, 0.05)',
  },
});
