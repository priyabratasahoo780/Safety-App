import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import * as Location from 'expo-location';

interface LiveMapProps {
  location: Location.LocationObject | null;
  errorMsg: string | null;
}

export function LiveMap({ location, errorMsg }: LiveMapProps) {
  return (
    <View style={styles.simulatedMap}>
      <Text style={{ color: '#6B7280' }}>
        Live Map not available on Web.
        {location ? `\nLat: ${location.coords.latitude.toFixed(4)}, Lon: ${location.coords.longitude.toFixed(4)}` : ''}
      </Text>
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
  },
});
