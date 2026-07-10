import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, ActivityIndicator } from 'react-native';
import { DrawerToggleButton } from '@react-navigation/drawer';
import { Feather } from '@expo/vector-icons';
import { ShieldAlert, MapPin, AlertTriangle, Activity } from 'lucide-react-native';
import * as Location from 'expo-location';

const COLORS = {
  bg: '#EBF0F9',
  textPrimary: '#111638',
  textSecondary: '#69708A',
  purplePrimary: '#6D35E8',
  red: '#F04438',
  orange: '#F59E0B',
  green: '#10B981',
  shadow: 'rgba(163, 177, 198, 0.55)',
  highlight: '#FFFFFF',
};

const NeumorphicCard = ({ children, style, padding = 20 }: any) => (
  <View style={[styles.neuOuter, style]}>
    <View style={[styles.neuInner, { padding }]}>
      {children}
    </View>
  </View>
);

export default function CrimeRateScreen() {
  const [loading, setLoading] = useState(true);
  const [locationName, setLocationName] = useState('Fetching location...');
  
  // Dummy data
  const crimeData = {
    overallRisk: 'Moderate',
    riskScore: 68,
    recentIncidents: [
      { type: 'Theft', count: 12, trend: 'up' },
      { type: 'Harassment', count: 5, trend: 'down' },
      { type: 'Assault', count: 2, trend: 'stable' }
    ],
    safestTime: '8:00 AM - 6:00 PM',
    dangerTime: '10:00 PM - 4:00 AM'
  };

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationName('Location Access Denied');
        setLoading(false);
        return;
      }
      
      try {
        let location = await Location.getCurrentPositionAsync({});
        let geocode = await Location.reverseGeocodeAsync({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude
        });
        
        if (geocode && geocode.length > 0) {
          setLocationName(`${geocode[0].city || geocode[0].district}, ${geocode[0].region}`);
        } else {
          setLocationName('Unknown Area');
        }
      } catch (e) {
        setLocationName('Salt Lake Sector V, Kolkata'); // Fallback demo location
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <DrawerToggleButton tintColor={COLORS.textPrimary} />
        <Text style={styles.headerTitle}>Local Crime Rate</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Location Banner */}
        <View style={styles.locationBanner}>
          <MapPin size={20} color={COLORS.purplePrimary} />
          <Text style={styles.locationText}>{loading ? 'Locating...' : locationName}</Text>
        </View>

        {/* Big Score Card */}
        <NeumorphicCard style={{ marginBottom: 24, alignItems: 'center' }}>
          <View style={[styles.scoreCircle, { borderColor: COLORS.orange }]}>
            <Text style={styles.scoreValue}>{crimeData.riskScore}</Text>
            <Text style={styles.scoreMax}>/100</Text>
          </View>
          <Text style={styles.riskLevelTitle}>Risk Level: <Text style={{ color: COLORS.orange }}>{crimeData.overallRisk}</Text></Text>
          <Text style={styles.riskDesc}>The crime rate in this area is slightly above average. Remain vigilant during night hours.</Text>
        </NeumorphicCard>

        {/* Time Analysis */}
        <Text style={styles.sectionTitle}>Time Analysis</Text>
        <View style={styles.row}>
          <NeumorphicCard style={{ flex: 1, marginRight: 8 }} padding={16}>
            <View style={styles.iconWrapperGreen}>
              <Feather name="sun" size={20} color={COLORS.green} />
            </View>
            <Text style={styles.cardSmallTitle}>Safest Hours</Text>
            <Text style={styles.cardSmallValue}>{crimeData.safestTime}</Text>
          </NeumorphicCard>
          <NeumorphicCard style={{ flex: 1, marginLeft: 8 }} padding={16}>
            <View style={styles.iconWrapperRed}>
              <Feather name="moon" size={20} color={COLORS.red} />
            </View>
            <Text style={styles.cardSmallTitle}>High Risk Hours</Text>
            <Text style={styles.cardSmallValue}>{crimeData.dangerTime}</Text>
          </NeumorphicCard>
        </View>

        {/* Crime Breakdown */}
        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Recent Incidents (Last 30 Days)</Text>
        <NeumorphicCard style={{ marginBottom: 40 }} padding={16}>
          {crimeData.recentIncidents.map((incident, i) => (
            <View key={i}>
              <View style={styles.incidentRow}>
                <View style={styles.incidentLeft}>
                  {incident.type === 'Theft' && <Feather name="shopping-bag" size={18} color={COLORS.purplePrimary} />}
                  {incident.type === 'Harassment' && <AlertTriangle size={18} color={COLORS.orange} />}
                  {incident.type === 'Assault' && <ShieldAlert size={18} color={COLORS.red} />}
                  <Text style={styles.incidentName}>{incident.type}</Text>
                </View>
                <View style={styles.incidentRight}>
                  <Text style={styles.incidentCount}>{incident.count} reported</Text>
                  {incident.trend === 'up' && <Feather name="trending-up" size={16} color={COLORS.red} style={{ marginLeft: 8 }} />}
                  {incident.trend === 'down' && <Feather name="trending-down" size={16} color={COLORS.green} style={{ marginLeft: 8 }} />}
                  {incident.trend === 'stable' && <Feather name="minus" size={16} color={COLORS.textSecondary} style={{ marginLeft: 8 }} />}
                </View>
              </View>
              {i < crimeData.recentIncidents.length - 1 && <View style={styles.divider} />}
            </View>
          ))}
        </NeumorphicCard>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, height: 60 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: COLORS.textPrimary },
  scrollContent: { padding: 20 },
  locationBanner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  locationText: { fontSize: 16, fontWeight: '700', color: COLORS.textPrimary, marginLeft: 8 },
  neuOuter: {
    borderRadius: 24,
    backgroundColor: COLORS.bg,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 4,
  },
  neuInner: {
    borderRadius: 24,
    backgroundColor: COLORS.bg,
    shadowColor: COLORS.highlight,
    shadowOffset: { width: -6, height: -6 },
    shadowOpacity: 1,
    shadowRadius: 12,
  },
  scoreCircle: { width: 120, height: 120, borderRadius: 60, borderWidth: 8, justifyContent: 'center', alignItems: 'center', marginBottom: 16, flexDirection: 'row' },
  scoreValue: { fontSize: 36, fontWeight: '900', color: COLORS.textPrimary },
  scoreMax: { fontSize: 16, fontWeight: '700', color: COLORS.textSecondary, marginTop: 12 },
  riskLevelTitle: { fontSize: 18, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 8 },
  riskDesc: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 20, paddingHorizontal: 10 },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 16, marginLeft: 4 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  iconWrapperGreen: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#D1FAE5', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  iconWrapperRed: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#FEE2E2', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  cardSmallTitle: { fontSize: 13, color: COLORS.textSecondary, marginBottom: 4 },
  cardSmallValue: { fontSize: 15, fontWeight: '800', color: COLORS.textPrimary },
  incidentRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12 },
  incidentLeft: { flexDirection: 'row', alignItems: 'center' },
  incidentName: { fontSize: 16, fontWeight: '700', color: COLORS.textPrimary, marginLeft: 12 },
  incidentRight: { flexDirection: 'row', alignItems: 'center' },
  incidentCount: { fontSize: 14, color: COLORS.textSecondary, fontWeight: '600' },
  divider: { height: 1, backgroundColor: '#E5E7EB' },
});
