import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

export default function NewJourneyScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const destination = (params.destination as string) || 'Salt Lake Central Park';
  const initialMins = parseInt(params.estMins as string) || 25;
  const [duration, setDuration] = useState(initialMins); // Minutes
  const [alertStart, setAlertStart] = useState(true);
  const [alertLate, setAlertLate] = useState(true);
  const [autoSms, setAutoSms] = useState(false);

  const handleStart = () => {
    // Navigate to active journey page
    const randomId = Math.floor(Math.random() * 9000) + 1000;
    router.replace({
      pathname: `/journey/${randomId}` as any,
      params: { destination, duration }
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Feather name="arrow-left" size={22} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Configure Journey Timer</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Destination Card Summary */}
        <View style={styles.summaryCard}>
          <View style={styles.locationRow}>
            <View style={[styles.dot, { backgroundColor: '#6D28D9' }]} />
            <View style={styles.locationText}>
              <Text style={styles.locLabel}>STARTPOINT</Text>
              <Text style={styles.locValue}>Current Location</Text>
            </View>
          </View>
          
          <View style={styles.verticalDash} />

          <View style={styles.locationRow}>
            <View style={[styles.dot, { backgroundColor: '#DC2626' }]} />
            <View style={styles.locationText}>
              <Text style={styles.locLabel}>DESTINATION</Text>
              <Text style={styles.locValue}>{destination}</Text>
            </View>
          </View>
        </View>

        {/* Duration Slider Section */}
        <Text style={styles.sectionTitle}>Expected Duration</Text>
        <View style={styles.durationCard}>
          <Text style={styles.durationValue}>{duration} mins</Text>
          <Text style={styles.durationSub}>If you do not check-in within this time, SOS triggers automatically.</Text>
          
          {/* Custom incremental selector instead of standard slider for multiplatform compatibility */}
          <View style={styles.stepperContainer}>
            <TouchableOpacity 
              style={styles.stepBtn}
              onPress={() => setDuration(prev => Math.max(5, prev - 5))}
            >
              <Feather name="minus" size={20} color="#6D28D9" />
            </TouchableOpacity>
            
            <View style={styles.stepDisplay}>
              <Text style={styles.stepText}>Timer Limit</Text>
            </View>

            <TouchableOpacity 
              style={styles.stepBtn}
              onPress={() => setDuration(prev => Math.min(120, prev + 5))}
            >
              <Feather name="plus" size={20} color="#6D28D9" />
            </TouchableOpacity>
          </View>

          {/* Quick Selector Pills */}
          <View style={styles.pillsRow}>
            {[10, 20, 30, 45, 60].map(m => (
              <TouchableOpacity 
                key={m} 
                style={[styles.pillBtn, duration === m && styles.activePillBtn]}
                onPress={() => setDuration(m)}
              >
                <Text style={[styles.pillText, duration === m && styles.activePillText]}>{m}m</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Notifications and Safety Rules */}
        <Text style={styles.sectionTitle}>Guardian Alert Rules</Text>
        <View style={styles.rulesCard}>
          {/* Rule 1 */}
          <View style={styles.ruleRow}>
            <View style={styles.ruleTextContent}>
              <Text style={styles.ruleTitle}>Alert on Journey Start</Text>
              <Text style={styles.ruleDesc}>Send a notification when you begin this trip</Text>
            </View>
            <Switch
              value={alertStart}
              onValueChange={setAlertStart}
              trackColor={{ false: '#E5E7EB', true: '#C4B5FD' }}
              thumbColor={alertStart ? '#6D28D9' : '#F3F4F6'}
            />
          </View>

          <View style={styles.separator} />

          {/* Rule 2 */}
          <View style={styles.ruleRow}>
            <View style={styles.ruleTextContent}>
              <Text style={styles.ruleTitle}>Alert if ETA is Exceeded</Text>
              <Text style={styles.ruleDesc}>Notify guardians immediately when timer runs out</Text>
            </View>
            <Switch
              value={alertLate}
              onValueChange={setAlertLate}
              trackColor={{ false: '#E5E7EB', true: '#C4B5FD' }}
              thumbColor={alertLate ? '#6D28D9' : '#F3F4F6'}
            />
          </View>

          <View style={styles.separator} />

          {/* Rule 3 */}
          <View style={styles.ruleRow}>
            <View style={styles.ruleTextContent}>
              <Text style={styles.ruleTitle}>Auto SMS backup notification</Text>
              <Text style={styles.ruleDesc}>Trigger background SMS updates periodically</Text>
            </View>
            <Switch
              value={autoSms}
              onValueChange={setAutoSms}
              trackColor={{ false: '#E5E7EB', true: '#C4B5FD' }}
              thumbColor={autoSms ? '#6D28D9' : '#F3F4F6'}
            />
          </View>
        </View>

        {/* Start Button */}
        <TouchableOpacity 
          style={styles.startBtn}
          activeOpacity={0.9}
          onPress={handleStart}
        >
          <MaterialCommunityIcons name="clock-start" size={22} color="#FFFFFF" style={{ marginRight: 8 }} />
          <Text style={styles.startBtnText}>Start Monitored Journey</Text>
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
  scrollContent: {
    padding: 20,
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.01,
    shadowRadius: 10,
    elevation: 1,
    marginBottom: 25,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  locationText: {
    flex: 1,
  },
  locLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#9CA3AF',
    letterSpacing: 1,
  },
  locValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 2,
  },
  verticalDash: {
    width: 2,
    height: 20,
    backgroundColor: '#E5E7EB',
    marginLeft: 4,
    marginVertical: 4,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 12,
    paddingLeft: 4,
  },
  durationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.01,
    shadowRadius: 8,
    elevation: 1,
    marginBottom: 25,
  },
  durationValue: {
    fontSize: 32,
    fontWeight: '900',
    color: '#6D28D9',
  },
  durationSub: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 18,
    maxWidth: '85%',
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    gap: 20,
  },
  stepBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: '#EDE9FE',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepDisplay: {
    width: 100,
    alignItems: 'center',
  },
  stepText: {
    fontSize: 14,
    color: '#4B5563',
    fontWeight: '600',
  },
  pillsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 20,
    gap: 8,
  },
  pillBtn: {
    flex: 1,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activePillBtn: {
    backgroundColor: '#6D28D9',
  },
  pillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4B5563',
  },
  activePillText: {
    color: '#FFFFFF',
  },
  rulesCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.01,
    shadowRadius: 8,
    elevation: 1,
    marginBottom: 25,
  },
  ruleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  ruleTextContent: {
    flex: 1,
    marginRight: 10,
  },
  ruleTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2937',
  },
  ruleDesc: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 4,
    lineHeight: 16,
  },
  separator: {
    height: 1,
    backgroundColor: '#F3F4F6',
  },
  startBtn: {
    flexDirection: 'row',
    backgroundColor: '#6D28D9',
    borderRadius: 16,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6D28D9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  startBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 16,
  },
});

