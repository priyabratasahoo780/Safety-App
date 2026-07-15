import React, { createElement } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import * as Location from 'expo-location';

interface LiveMapProps {
  location: Location.LocationObject | null;
  errorMsg: string | null;
}

export function LiveMap({ location, errorMsg }: LiveMapProps) {
  if (errorMsg && !location) {
    return (
      <View style={styles.simulatedMap}>
        <Text style={{ color: '#EF4444' }}>{errorMsg}</Text>
      </View>
    );
  }

  // Default to Kolkata if location isn't ready
  const latitude = location?.coords?.latitude || 22.5750;
  const longitude = location?.coords?.longitude || 88.4280;
  
  const bbox = `${longitude - 0.01},${latitude - 0.01},${longitude + 0.01},${latitude + 0.01}`;
  const iframeSrc = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${latitude},${longitude}`;

  return (
    <View style={styles.container}>
      {createElement('iframe', {
        src: iframeSrc,
        style: { width: '100%', height: '100%', border: 'none' },
        allowFullScreen: true,
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
  },
  simulatedMap: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
});
