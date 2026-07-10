import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

export default function GuardianViewScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const handleResolve = () => {
    router.replace('/(drawer)/(tabs)/home');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Feather name="arrow-left" size={22} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Guardian Tracking Portal</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Main Map Content */}
      <View style={styles.mapWrapper}>
        <View style={styles.simulatedMap}>
          {/* Grid lines */}
          <View style={[styles.gridLine, { top: '30%' }]} />
          <View style={[styles.gridLine, { top: '70%' }]} />
          <View style={[styles.gridLine, { left: '40%', width: 1, height: '100%' }]} />

          {/* Path */}
          <View style={styles.pathLine} />

          {/* Blinking Pin for Traveler */}
          <View style={[styles.travelerPinContainer, { top: '48%', left: '46%' }]}>
            <View style={styles.travelerPinRipple} />
            <View style={styles.travelerPin}>
              <Feather name="user" size={14} color="#FFFFFF" />
            </View>
          </View>
          
          {/* Destination Pin */}
          <View style={[styles.destPin, { top: '25%', left: '70%' }]}>
            <Feather name="map-pin" size={24} color="#DC2626" />
          </View>

          {/* Risk Level Badge */}
          <View style={styles.dangerAlertTag}>
            <MaterialCommunityIcons name="alert-box" size={18} color="#FFFFFF" />
            <Text style={styles.dangerAlertText}>TRAVELER IN DANGER MODE</Text>
          </View>
        </View>
      </View>

      {/* Bottom Information Card */}
      <View style={styles.panelCard}>
        <View style={styles.travelerRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarTxt}>A</Text>
          </View>
          
          <View style={styles.travelerDetails}>
            <Text style={styles.travelerName}>Ananya Bhattacharya</Text>
            <Text style={styles.travelerStatus}>SOS Event #{id || '3049'}</Text>
          </View>

          <TouchableOpacity style={styles.callBtn}>
            <Feather name="phone" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <View style={styles.separator} />

        {/* ETA info */}
        <View style={styles.metricsRow}>
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>ETA to Destination</Text>
            <Text style={styles.metricValue}>14 mins</Text>
          </View>
          <View style={styles.verticalSeparator} />
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>Distance Left</Text>
            <Text style={styles.metricValue}>2.8 km</Text>
          </View>
        </View>

        <View style={styles.separator} />

        <View style={styles.audioAlertCard}>
          <Feather name="mic" size={18} color="#DC2626" style={{ marginRight: 8 }} />
          <Text style={styles.audioAlertText}>
            Ambient evidence recording is streaming live from device.
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity style={[styles.actionBtn, styles.policeBtn]}>
            <MaterialCommunityIcons name="police-badge" size={20} color="#FFFFFF" />
            <Text style={styles.actionBtnText}>Call Police (112)</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionBtn, styles.resolveBtn]} onPress={handleResolve}>
            <Feather name="check-circle" size={18} color="#FFFFFF" />
            <Text style={styles.actionBtnText}>Mark Resolved</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF9FC',
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backBtn: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1F2937',
  },
  mapWrapper: {
    flex: 1,
  },
  simulatedMap: {
    flex: 1,
    backgroundColor: '#E5E7EB',
    position: 'relative',
    overflow: 'hidden',
  },
  gridLine: {
    position: 'absolute',
    height: 1,
    width: '100%',
    backgroundColor: '#D1D5DB',
  },
  pathLine: {
    position: 'absolute',
    top: '30%',
    left: '30%',
    width: '40%',
    height: 6,
    backgroundColor: '#EF4444',
    borderRadius: 3,
    transform: [{ rotate: '45deg' }],
  },
  travelerPinContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  travelerPinRipple: {
    position: 'absolute',
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(220, 38, 38, 0.25)',
  },
  travelerPin: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#DC2626',
    borderWidth: 2.5,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  destPin: {
    position: 'absolute',
  },
  dangerAlertTag: {
    position: 'absolute',
    top: 20,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DC2626',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  dangerAlertText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    marginLeft: 6,
    letterSpacing: 1,
  },
  panelCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 10,
  },
  travelerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#6D28D9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarTxt: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 18,
  },
  travelerDetails: {
    flex: 1,
    marginLeft: 12,
  },
  travelerName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1F2937',
  },
  travelerStatus: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
    fontWeight: '600',
  },
  callBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  separator: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 14,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  metricItem: {
    alignItems: 'center',
    flex: 1,
  },
  metricLabel: {
    fontSize: 11,
    color: '#9CA3AF',
    fontWeight: '600',
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1F2937',
    marginTop: 4,
  },
  verticalSeparator: {
    width: 1,
    height: '100%',
    backgroundColor: '#E5E7EB',
  },
  audioAlertCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderColor: '#FEE2E2',
    borderWidth: 1,
    borderRadius: 12,
    padding: 10,
    marginBottom: 16,
  },
  audioAlertText: {
    color: '#991B1B',
    fontSize: 11,
    fontWeight: '600',
    flex: 1,
    lineHeight: 16,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: 14,
    gap: 6,
  },
  policeBtn: {
    backgroundColor: '#DC2626',
  },
  resolveBtn: {
    backgroundColor: '#6D28D9',
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
