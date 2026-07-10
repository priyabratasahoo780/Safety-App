import React, { useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_DEFAULT } from 'react-native-maps';
import { LiveLocationData, DestinationLocation, RouteOption } from '../types/location.types';
import { Shield, AlertTriangle, ShieldAlert, Navigation, Map as MapIcon } from 'lucide-react-native';

interface Props {
  currentLocation: LiveLocationData | null;
  destination: DestinationLocation | null;
  routes: RouteOption[];
  selectedRoute: RouteOption | null;
  onLongPressMap: (e: any) => void;
}

export interface MapHandle {
  recenter: () => void;
}

export const SafeRouteMap = forwardRef<MapHandle, Props>(({ 
  currentLocation, destination, routes, selectedRoute, onLongPressMap 
}, ref) => {
  const mapRef = useRef<MapView>(null);

  useImperativeHandle(ref, () => ({
    recenter: () => {
      if (currentLocation && mapRef.current) {
        mapRef.current.animateToRegion({
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }, 1000);
      }
    }
  }));

  // Fit to coordinates if both exist
  useEffect(() => {
    if (currentLocation && destination && mapRef.current) {
      mapRef.current.fitToCoordinates(
        [
          { latitude: currentLocation.latitude, longitude: currentLocation.longitude },
          { latitude: destination.latitude, longitude: destination.longitude }
        ],
        {
          edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
          animated: true,
        }
      );
    }
  }, [destination]);

  return (
    <View style={styles.container}>
      {Platform.OS === 'web' ? (
        <View style={[styles.map, styles.webFallback]}>
          <MapIcon size={48} color="#A0A5B1" />
          <Text style={styles.webFallbackText}>Map view is not supported on Web.</Text>
          <Text style={styles.webFallbackSubtext}>Please test this feature on an iOS Simulator or Android Emulator.</Text>
        </View>
      ) : (
        <MapView
          ref={mapRef}
          style={styles.map}
          provider={PROVIDER_DEFAULT}
          initialRegion={currentLocation ? {
            latitude: currentLocation.latitude,
            longitude: currentLocation.longitude,
            latitudeDelta: 0.02,
            longitudeDelta: 0.02,
          } : undefined}
          showsUserLocation={false}
          onLongPress={onLongPressMap}
        >
          {/* Current Location Marker */}
        {currentLocation && (
          <Marker
            coordinate={{
              latitude: currentLocation.latitude,
              longitude: currentLocation.longitude
            }}
            title="You"
          >
            <View style={styles.userMarkerContainer}>
              <View style={styles.userMarkerInner} />
            </View>
          </Marker>
        )}

        {/* Destination Marker */}
        {destination && (
          <Marker
            coordinate={{
              latitude: destination.latitude,
              longitude: destination.longitude
            }}
            title="Destination"
            pinColor="#F04438"
          />
        )}

        {/* Route Polylines */}
        {destination && routes.map(route => {
          const isSelected = selectedRoute?.id === route.id;
          let color = '#12B76A'; // default green
          if (route.theme === 'orange') color = '#F79009';
          if (route.theme === 'red') color = '#F04438';
          
          return (
            <Polyline
              key={route.id}
              coordinates={route.coordinates}
              strokeColor={color}
              strokeWidth={isSelected ? 5 : 3}
              zIndex={isSelected ? 2 : 1}
              lineCap="round"
              lineJoin="round"
              style={{ opacity: isSelected ? 1 : 0.4 }}
            />
          );
        })}
        </MapView>
      )}

      {/* Safety Legend */}
      <View style={styles.legendCard}>
        <View style={styles.legendItem}>
          <Shield size={16} color="#12B76A" />
          <Text style={styles.legendText}>Safe Area</Text>
        </View>
        <View style={styles.legendItem}>
          <AlertTriangle size={16} color="#F79009" />
          <Text style={styles.legendText}>Moderate Risk</Text>
        </View>
        <View style={styles.legendItem}>
          <ShieldAlert size={16} color="#F04438" />
          <Text style={styles.legendText}>High Risk</Text>
        </View>
      </View>

      {/* Recenter Button */}
      <Pressable 
        style={styles.recenterButton}
        onPress={() => {
          if (currentLocation && mapRef.current) {
            mapRef.current.animateToRegion({
              latitude: currentLocation.latitude,
              longitude: currentLocation.longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }, 1000);
          }
        }}
      >
        <Navigation size={20} color="#10153A" />
      </Pressable>
      
      {!destination && (
        <View style={styles.helperTextContainer}>
          <Text style={styles.helperText}>Long press on the map to select a destination.</Text>
        </View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  webFallback: {
    backgroundColor: '#F1EAFF',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  webFallbackText: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '700',
    color: '#6D35E8',
  },
  webFallbackSubtext: {
    marginTop: 4,
    fontSize: 12,
    color: '#596080',
    textAlign: 'center',
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
  legendCard: {
    position: 'absolute',
    top: 60,
    left: 20,
    backgroundColor: '#FFFFFF',
    padding: 10,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  legendText: {
    fontSize: 12,
    color: '#596080',
    marginLeft: 8,
    fontWeight: '500',
  },
  recenterButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  helperTextContainer: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  helperText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '500',
  }
});
