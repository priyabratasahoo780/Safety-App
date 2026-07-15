import React, { createElement } from 'react';
import { View, StyleSheet } from 'react-native';

export function DashboardMap() {
  // Approximate coordinates for Sector 4, Salt Lake, Kolkata
  const latitude = 22.5750;
  const longitude = 88.4280;

  const bbox = `${longitude - 0.015},${latitude - 0.015},${longitude + 0.015},${latitude + 0.015}`;
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
    position: 'relative',
    backgroundColor: '#E8F5E9',
  },
});
