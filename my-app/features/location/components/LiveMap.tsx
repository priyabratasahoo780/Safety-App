import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import * as Location from 'expo-location';
import MapView, { Marker, UrlTile } from 'react-native-maps';

interface LiveMapProps {
  location: Location.LocationObject | null;
  errorMsg: string | null;
}

export function LiveMap({ location, errorMsg }: LiveMapProps) {
  if (errorMsg) {
    return (
      <View style={styles.simulatedMap}>
        <Text style={{ color: '#EF4444' }}>{errorMsg}</Text>
      </View>
    );
  }

  if (!location) {
    return (
      <View style={styles.simulatedMap}>
        <Text style={{ color: '#6B7280' }}>Fetching your live location...</Text>
      </View>
    );
  }

  return (
    <View style={styles.mapContainer}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        region={{
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        mapType="none" // Important: disables default Google/Apple maps to use our tile
      >
        <UrlTile
          urlTemplate="https://a.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maximumZ={19}
        />
        <Marker
          coordinate={{
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          }}
          title="You"
          description="Your live location"
        >
          <View style={styles.markerCircle}>
            <View style={styles.markerInner} />
          </View>
        </Marker>
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  simulatedMap: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    overflow: 'hidden',
  },
  mapContainer: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  markerCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(109, 40, 217, 0.2)', // Purple transparent ring
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(109, 40, 217, 0.5)',
  },
  markerInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#6D28D9', // Solid purple center
  },
});
