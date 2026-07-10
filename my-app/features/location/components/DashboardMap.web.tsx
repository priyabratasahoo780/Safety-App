import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Map as MapIcon, ShieldCheck } from 'lucide-react-native';

export function DashboardMap() {
  return (
    <View style={styles.simulatedMap}>
      {/* Grid lines */}
      <View style={[styles.mapGridLine, { top: '30%', left: 0, right: 0 }]} />
      <View style={[styles.mapGridLine, { top: '65%', left: 0, right: 0 }]} />
      <View style={[styles.mapGridLine, { left: '35%', top: 0, bottom: 0 }]} />
      <View style={[styles.mapGridLine, { left: '70%', top: 0, bottom: 0 }]} />
      
      {/* Green safe zone overlay */}
      <View style={styles.mapSafeOverlay} />
      
      {/* User Pin */}
      <View style={styles.userPinContainer}>
        <View style={styles.userPinRipple} />
        <View style={styles.userPin}>
          <MapIcon size={10} color="#FFFFFF" />
        </View>
      </View>

      {/* Nearby safe havens indicators */}
      <View style={[styles.havenMarker, { top: '25%', left: '20%' }]}>
        <ShieldCheck size={16} color="#16A34A" />
      </View>
      <View style={[styles.havenMarker, { top: '55%', left: '75%' }]}>
        <ShieldCheck size={16} color="#16A34A" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  simulatedMap: {
    flex: 1,
    backgroundColor: '#E8F5E9',
    position: 'relative',
  },
  mapGridLine: {
    position: 'absolute',
    backgroundColor: '#C8E6C9',
    height: 1,
    width: '100%',
  },
  mapSafeOverlay: {
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
  userPinContainer: {
    position: 'absolute',
    top: '45%',
    left: '48%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userPinRipple: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(109, 40, 217, 0.2)',
  },
  userPin: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#6D28D9',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
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
