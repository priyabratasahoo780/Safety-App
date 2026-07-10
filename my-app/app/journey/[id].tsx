import React, { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function ActiveJourneyScreen() {
  const router = useRouter();
  const { id, destination, duration } = useLocalSearchParams();
  
  // Set initial time from params (default 25 mins)
  const initialMinutes = duration ? parseInt(duration as string) : 25;
  const [timeLeft, setTimeLeft] = useState(initialMinutes * 60); // In seconds
  const [journeyComplete, setJourneyComplete] = useState(false);

  useEffect(() => {
    if (timeLeft > 0 && !journeyComplete) {
      const timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0 && !journeyComplete) {
      // Trigger SOS route automatically when time runs out!
      router.replace('/sos/active');
    }
  }, [timeLeft, journeyComplete, router]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleExtend = () => {
    setTimeLeft(prev => prev + 5 * 60); // Add 5 minutes
  };

  const handleArrival = () => {
    setJourneyComplete(true);
    router.replace('/(drawer)/(tabs)/home');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Active Journey Tracker</Text>
        <Text style={styles.journeyId}>ID #{id || '8492'}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Status card */}
        <View style={styles.statusCard}>
          <View style={styles.statusBadge}>
            <View style={styles.radarDot} />
            <Text style={styles.statusText}>MONITORED BY GUARDIANS</Text>
          </View>
          <Text style={styles.destLabel}>HEADING TO</Text>
          <Text style={styles.destValue}>{destination || 'Salt Lake Central Park'}</Text>
        </View>

        {/* Circular Countdown Tracker */}
        <View style={styles.countdownContainer}>
          <View style={styles.outerTimerCircle}>
            <View style={styles.innerTimerCircle}>
              <Text style={styles.timerLabel}>SAFE CHECK-IN IN</Text>
              <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
              <Text style={styles.timerSub}>Time remaining</Text>
            </View>
          </View>
        </View>

        {/* Adjustments row */}
        <View style={styles.adjustmentsRow}>
          {/* Add 5 mins */}
          <TouchableOpacity style={styles.adjustBtn} onPress={handleExtend}>
            <Feather name="plus-circle" size={18} color="#6D28D9" />
            <Text style={styles.adjustBtnText}>Delay? Add 5m</Text>
          </TouchableOpacity>

          {/* Trigger Emergency Manual */}
          <TouchableOpacity 
            style={[styles.adjustBtn, styles.dangerAdjustBtn]} 
            onPress={() => router.push('/sos/active')}
          >
            <Feather name="alert-triangle" size={18} color="#EF4444" />
            <Text style={[styles.adjustBtnText, { color: '#EF4444' }]}>Trigger SOS</Text>
          </TouchableOpacity>
        </View>

        {/* Safety tips details */}
        <View style={styles.tipCard}>
          <View style={styles.tipIconWrapper}>
            <Feather name="info" size={18} color="#6D28D9" />
          </View>
          <View style={styles.tipContent}>
            <Text style={styles.tipTitle}>Keep app in background</Text>
            <Text style={styles.tipDesc}>
              SafeSphere AI will track your location and verify geofence arrivals automatically.
            </Text>
          </View>
        </View>

        {/* I've Arrived Button */}
        <TouchableOpacity 
          style={styles.arriveBtn}
          activeOpacity={0.9}
          onPress={handleArrival}
        >
          <Feather name="check" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
          <Text style={styles.arriveBtnText}>{"I've Arrived, Check In"}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF9FC',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 15,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1F2937',
  },
  journeyId: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6D28D9',
  },
  scrollContent: {
    padding: 20,
  },
  statusCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.01,
    shadowRadius: 10,
    elevation: 1,
    marginBottom: 20,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EDE9FE',
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 10,
    marginBottom: 12,
  },
  radarDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#6D28D9',
    marginRight: 6,
  },
  statusText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#6D28D9',
    letterSpacing: 1,
  },
  destLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#9CA3AF',
    letterSpacing: 1,
  },
  destValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1F2937',
    marginTop: 4,
  },
  countdownContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  outerTimerCircle: {
    width: width * 0.58,
    height: width * 0.58,
    borderRadius: (width * 0.58) / 2,
    borderWidth: 8,
    borderColor: '#6D28D9',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(109, 40, 217, 0.03)',
  },
  innerTimerCircle: {
    alignItems: 'center',
  },
  timerLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#6D28D9',
    letterSpacing: 1.5,
  },
  timerText: {
    fontSize: 48,
    fontWeight: '900',
    color: '#1F2937',
    marginVertical: 4,
  },
  timerSub: {
    fontSize: 11,
    color: '#9CA3AF',
    fontWeight: '600',
  },
  adjustmentsRow: {
    flexDirection: 'row',
    gap: 15,
    marginBottom: 20,
  },
  adjustBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#EDE9FE',
    backgroundColor: '#FFFFFF',
    gap: 6,
  },
  dangerAdjustBtn: {
    borderColor: '#FEE2E2',
  },
  adjustBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6D28D9',
  },
  tipCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    marginBottom: 25,
  },
  tipIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3E8FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1F2937',
  },
  tipDesc: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 4,
    lineHeight: 16,
  },
  arriveBtn: {
    flexDirection: 'row',
    backgroundColor: '#10B981',
    borderRadius: 16,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  arriveBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 16,
  },
});
