import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Phone, PhoneOff, UserRound } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

export default function FakeCallScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const [callDuration, setCallDuration] = useState(0);

  useEffect(() => {
    // Vibrate when "ringing" starts
    const vibrateInterval = setInterval(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }, 1500);

    return () => clearInterval(vibrateInterval);
  }, []);

  useEffect(() => {
    // Once "answered", stop vibration and start timer.
    // We'll just simulate it being already answered for simplicity.
    const timer = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      <View style={styles.header}>
        <Text style={styles.callerStatus}>{formatTime(callDuration)}</Text>
      </View>

      <View style={styles.callerInfo}>
        <View style={styles.avatar}>
          <UserRound size={60} color="#FFFFFF" />
        </View>
        <Text style={styles.callerName}>Dad</Text>
        <Text style={styles.callerType}>Mobile</Text>
      </View>

      <View style={styles.actions}>
        <Pressable 
          style={styles.endCallButton}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.back();
          }}
        >
          <PhoneOff size={32} color="#FFFFFF" />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1C1C1E',
  },
  header: {
    alignItems: 'center',
    marginTop: 20,
  },
  callerStatus: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '400',
  },
  callerInfo: {
    alignItems: 'center',
    marginTop: 60,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#8E8E93',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  callerName: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '600',
    marginBottom: 8,
  },
  callerType: {
    color: '#EBEBF5',
    fontSize: 18,
  },
  actions: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 60,
  },
  endCallButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
