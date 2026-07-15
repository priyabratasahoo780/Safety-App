import React, { useState, useEffect } from 'react';
import { Feather } from '@expo/vector-icons';
import { TouchableOpacity, View, Text, StyleSheet, Pressable, useWindowDimensions, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Timer as TimerIcon, X, Play, Square, ShieldAlert } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

const DURATION_OPTIONS = [
  { label: '15 Min', seconds: 15 * 60 },
  { label: '30 Min', seconds: 30 * 60 },
  { label: '1 Hour', seconds: 60 * 60 },
];

export default function SafetyTimerScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const [isActive, setIsActive] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(15 * 60);
  const [selectedDuration, setSelectedDuration] = useState(15 * 60);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isActive && remainingSeconds > 0) {
      interval = setInterval(() => {
        setRemainingSeconds((prev) => prev - 1);
      }, 1000);
    } else if (isActive && remainingSeconds === 0) {
      // Timer finished!
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setIsActive(false);
      Alert.alert(
        'Safety Timer Ended',
        'Your timer has reached zero. If you do not cancel, emergency contacts will be notified soon (simulation).',
        [{ text: 'I am safe', onPress: () => router.back(), style: 'cancel' }]
      );
    }
    return () => clearInterval(interval);
  }, [isActive, remainingSeconds]);

  const toggleTimer = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (!isActive) {
      if (remainingSeconds === 0) {
        setRemainingSeconds(selectedDuration);
      }
      setIsActive(true);
    } else {
      setIsActive(false);
    }
  };

  const cancelTimer = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsActive(false);
    setRemainingSeconds(selectedDuration);
  };

  const handleSelectDuration = (seconds: number) => {
    Haptics.selectionAsync();
    setSelectedDuration(seconds);
    setRemainingSeconds(seconds);
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    
    if (h > 0) {
      return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={[styles.header, { flexDirection: 'row', alignItems: 'center' }]}>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 8, marginRight: 12 }}><Feather name="arrow-left" size={24} color="#FFFFFF" /></TouchableOpacity>
        <Pressable 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <X size={24} color="#10153A" />
        </Pressable>
        <Text style={styles.headerTitle}>Safety Timer</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        {/* Timer Display */}
        <View style={styles.timerContainer}>
          <View style={[styles.timerCircle, isActive && styles.timerCircleActive]}>
            <Text style={[styles.timerText, isActive && styles.timerTextActive]}>
              {formatTime(remainingSeconds)}
            </Text>
            <Text style={styles.timerSubtitle}>
              {isActive ? 'Remaining' : 'Set your duration'}
            </Text>
          </View>
        </View>

        {/* Options */}
        {!isActive && (
          <View style={styles.optionsContainer}>
            {DURATION_OPTIONS.map((opt) => (
              <Pressable
                key={opt.label}
                style={[
                  styles.optionButton,
                  selectedDuration === opt.seconds && styles.optionButtonSelected
                ]}
                onPress={() => handleSelectDuration(opt.seconds)}
              >
                <Text style={[
                  styles.optionText,
                  selectedDuration === opt.seconds && styles.optionTextSelected
                ]}>
                  {opt.label}
                </Text>
              </Pressable>
            ))}
          </View>
        )}

        {/* Info */}
        <View style={styles.infoBox}>
          <ShieldAlert size={24} color="#7138E8" />
          <Text style={styles.infoText}>
            If the timer reaches zero before you cancel it, your trusted contacts will be alerted with your location.
          </Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actions}>
        {isActive ? (
          <View style={styles.activeActionsRow}>
            <Pressable 
              style={[styles.actionButton, styles.stopButton]} 
              onPress={cancelTimer}
            >
              <Square size={24} color="#FF3B30" fill="#FF3B30" />
              <Text style={styles.stopButtonText}>End Safely</Text>
            </Pressable>
          </View>
        ) : (
          <Pressable 
            style={[styles.actionButton, styles.startButton]} 
            onPress={toggleTimer}
          >
            <Play size={24} color="#FFFFFF" fill="#FFFFFF" />
            <Text style={styles.startButtonText}>Start Timer</Text>
          </Pressable>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#10153A',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  timerContainer: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 40,
  },
  timerCircle: {
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 8,
    borderColor: '#F3F4F6',
    shadowColor: '#7138E8',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 5,
  },
  timerCircleActive: {
    borderColor: '#7138E8',
  },
  timerText: {
    fontSize: 64,
    fontWeight: '300',
    color: '#10153A',
    fontVariant: ['tabular-nums'],
  },
  timerTextActive: {
    fontWeight: '500',
    color: '#7138E8',
  },
  timerSubtitle: {
    fontSize: 16,
    color: '#596080',
    marginTop: 8,
  },
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 40,
  },
  optionButton: {
    flex: 1,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginHorizontal: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E9E5F2',
  },
  optionButtonSelected: {
    backgroundColor: '#7138E8',
    borderColor: '#7138E8',
  },
  optionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#596080',
  },
  optionTextSelected: {
    color: '#FFFFFF',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#F3E8FF',
    padding: 16,
    borderRadius: 16,
    alignItems: 'flex-start',
  },
  infoText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 13,
    lineHeight: 20,
    color: '#4B3F72',
    fontWeight: '500',
  },
  actions: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  actionButton: {
    flexDirection: 'row',
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  startButton: {
    backgroundColor: '#7138E8',
    shadowColor: '#7138E8',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 10,
  },
  activeActionsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  stopButton: {
    backgroundColor: '#FFE5E5',
    flex: 1,
    borderWidth: 2,
    borderColor: '#FF3B30',
  },
  stopButtonText: {
    color: '#FF3B30',
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 10,
  },
});
