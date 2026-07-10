import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

// Hooks from our AI Voice SOS Module
import { useVoiceDetection } from '../features/voice-sos/hooks/useVoiceDetection';
import { useRiskAnalysis } from '../features/voice-sos/hooks/useRiskAnalysis';

export default function TestAIVoiceScreen() {
  const router = useRouter();

  // 1. Initialize Voice Detection
  const voiceState = useVoiceDetection({
    autoStart: false,
  });

  const { currentMetering, pipelineState, confidenceScore, lastWakeWord, data } = voiceState;

  // 2. Risk Analysis is handled inside useVoiceDetection now, so we just get riskScore from it
  const { riskScore } = voiceState;

  const toggleListening = () => {
    if (voiceState.isListening) voiceState.stop();
    else voiceState.start();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.title}>AI Voice SOS - Debug View</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        
        {/* Status Card */}
        <View style={[styles.card, voiceState.isListening ? styles.activeCard : styles.inactiveCard]}>
          <Text style={styles.cardTitle}>Engine Status</Text>
          <Text style={styles.statusText}>
            {voiceState.isListening ? 'Listening & Analyzing...' : 'Stopped'}
          </Text>
          <Text style={styles.subStatus}>
            {pipelineState === 'PROCESSING' ? 'Processing Audio Buffer...' : pipelineState}
          </Text>
        </View>

        {/* Live Volume Meter */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Live Microphone</Text>
          <Text style={styles.subStatus}>Volume: {currentMetering?.toFixed(1)} dB</Text>
          <View style={{height: 10, backgroundColor: '#E5E7EB', borderRadius: 5, marginTop: 10, overflow: 'hidden'}}>
            <View style={{
              height: '100%', 
              width: `${Math.max(0, Math.min(100, ((currentMetering + 80) / 80) * 100))}%`, 
              backgroundColor: currentMetering > -10 ? '#EF4444' : currentMetering > -30 ? '#F59E0B' : '#10B981'
            }} />
          </View>
        </View>

        {/* Emotion & Voice Data */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Voice Analysis</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Dominant Emotion:</Text>
            <Text style={styles.value}>{data?.dominantEmotion || 'N/A'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Panic Score:</Text>
            <Text style={styles.value}>{data?.panicScore || 0}/100</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Detected Word:</Text>
            <Text style={styles.value}>{data?.detectedWord || 'None'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Confidence:</Text>
            <Text style={styles.value}>{Math.round((data?.confidence || 0) * 100)}%</Text>
          </View>
        </View>

        {/* Risk Assessment */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Risk Assessment Engine</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Current Risk Score:</Text>
            <Text style={styles.value}>{riskScore}/100</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Status:</Text>
            <Text style={[
              styles.value, 
              pipelineState === 'EMERGENCY' ? { color: 'red', fontWeight: 'bold' } : {}
            ]}>
              {pipelineState}
            </Text>
          </View>
        </View>

        {/* Simulation Controls */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Simulate Scenarios</Text>
          <Text style={[styles.subStatus, {marginBottom: 10}]}>Use these buttons to inject simulated data into the Risk Engine (Testing Step 7 & 10 of Spec):</Text>
          
          <TouchableOpacity 
            style={[styles.btn, {backgroundColor: '#3B82F6', marginBottom: 8}]} 
            onPress={() => {
              // Simulate "Help me with homework" (False Alarm)
              voiceState.simulateSignals({
                keywordScore: 90,
                emotionScore: 10,
                soundScore: 10,
                motionScore: 0,
                detectedKeyword: 'help me',
                speechText: 'help me with homework'
              });
            }}
          >
            <Text style={styles.btnText}>Simulate False Alarm ("Help me with homework")</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.btn, {backgroundColor: '#F59E0B', marginBottom: 8}]} 
            onPress={() => {
              // Simulate moderate risk
              voiceState.simulateSignals({
                keywordScore: 80,
                emotionScore: 60,
                soundScore: 50,
                motionScore: 30,
                detectedKeyword: 'stop',
                speechText: 'stop it right now'
              });
            }}
          >
            <Text style={styles.btnText}>Simulate Moderate Risk (High Alert)</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.btn, {backgroundColor: '#EF4444'}]} 
            onPress={() => {
              // Simulate real emergency
              voiceState.simulateSignals({
                keywordScore: 95,
                emotionScore: 90,
                soundScore: 85,
                motionScore: 95,
                detectedKeyword: 'bachao',
                speechText: 'bachao koi hai'
              });
            }}
          >
            <Text style={styles.btnText}>Simulate Real Emergency (Panic + Motion)</Text>
          </TouchableOpacity>
        </View>

        {/* Controls */}
        <TouchableOpacity 
          style={[styles.btn, voiceState.isListening ? styles.btnStop : styles.btnStart, { marginTop: 20 }]} 
          onPress={toggleListening}
        >
          <Feather name={voiceState.isListening ? "mic-off" : "mic"} size={20} color="#fff" />
          <Text style={styles.btnText}>
            {voiceState.isListening ? 'Stop AI Engine' : 'Start AI Engine'}
          </Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backBtn: {
    padding: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  content: {
    padding: 20,
    gap: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  activeCard: {
    borderColor: '#10B981',
    borderWidth: 2,
  },
  inactiveCard: {
    borderColor: '#E5E7EB',
    borderWidth: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    paddingBottom: 8,
  },
  statusText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  subStatus: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  value: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '600',
  },
  valueMulti: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
    marginLeft: 10,
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 30,
    marginTop: 10,
    gap: 8,
  },
  btnStart: {
    backgroundColor: '#10B981',
  },
  btnStop: {
    backgroundColor: '#EF4444',
  },
  btnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  }
});
