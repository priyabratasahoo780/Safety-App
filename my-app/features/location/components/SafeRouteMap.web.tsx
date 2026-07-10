import React, { forwardRef, useImperativeHandle } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Map as MapIcon } from 'lucide-react-native';
import { LiveLocationData, DestinationLocation, RouteOption } from '../types/location.types';

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

export const SafeRouteMap = forwardRef<MapHandle, Props>((props, ref) => {
  useImperativeHandle(ref, () => ({
    recenter: () => {
      // Do nothing on web
    },
  }));

  // Center on destination if available, otherwise current location
  const centerLat = props.destination?.latitude || props.currentLocation?.latitude || 22.5855;
  const centerLng = props.destination?.longitude || props.currentLocation?.longitude || 88.4166;

  return (
    <View style={styles.container}>
      {React.createElement('iframe', {
        key: `${centerLat}-${centerLng}`,
        src: `https://www.openstreetmap.org/export/embed.html?bbox=${centerLng - 0.02},${centerLat - 0.02},${centerLng + 0.02},${centerLat + 0.02}&layer=mapnik&marker=${centerLat},${centerLng}`,
        style: { width: '100%', height: '100%', border: 'none' }
      })}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#F3F4F6',
  },
});
