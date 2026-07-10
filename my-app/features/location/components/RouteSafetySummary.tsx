import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { RouteSafetyData } from '../types/location.types';
import { ShieldCheck, Lamp, Camera, Users } from 'lucide-react-native';

interface Props {
  safetyData: RouteSafetyData;
}

export const RouteSafetySummary: React.FC<Props> = ({ safetyData }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Route Safety Summary <Text style={styles.demoText}>(Demo safety data)</Text></Text>
      
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <ShieldCheck size={24} color="#12B76A" />
          <Text style={styles.statLabel}>Safety Score</Text>
          <Text style={styles.statValue}><Text style={{color: '#12B76A'}}>{safetyData.score}</Text> / 100</Text>
        </View>
        
        <View style={styles.divider} />
        
        <View style={styles.statItem}>
          <Lamp size={24} color="#6D35E8" />
          <Text style={styles.statLabel}>Well Lit Roads</Text>
          <Text style={styles.statValue}>{safetyData.wellLit}%</Text>
        </View>

        <View style={styles.divider} />
        
        <View style={styles.statItem}>
          <Camera size={24} color="#0EA5E9" />
          <Text style={styles.statLabel}>CCTV Coverage</Text>
          <Text style={styles.statValue}>{safetyData.cctv}%</Text>
        </View>

        <View style={styles.divider} />
        
        <View style={styles.statItem}>
          <Users size={24} color="#F79009" />
          <Text style={styles.statLabel}>Live Crowd</Text>
          <Text style={styles.statValue}>{safetyData.crowd}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#EFEFEF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#10153A',
    marginBottom: 16,
  },
  demoText: {
    fontSize: 12,
    fontWeight: '400',
    color: '#888',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: '#EFEFEF',
  },
  statLabel: {
    fontSize: 11,
    color: '#596080',
    marginTop: 8,
    marginBottom: 4,
    textAlign: 'center',
  },
  statValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#10153A',
  }
});
