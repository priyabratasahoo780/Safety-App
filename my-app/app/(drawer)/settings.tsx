import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Switch, Pressable, Alert } from 'react-native';
import { DrawerToggleButton } from '@react-navigation/drawer';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { authService } from '../../src/services/authService';
import { auth } from '../../src/config/firebaseConfig';
import { signOut } from 'firebase/auth';

const COLORS = {
  bg: '#EBF0F9',
  textPrimary: '#111638',
  textSecondary: '#69708A',
  purplePrimary: '#6D35E8',
  red: '#F04438',
  shadow: 'rgba(163, 177, 198, 0.55)',
  highlight: '#FFFFFF',
};

const NeumorphicCard = ({ children, style }: any) => (
  <View style={[styles.neuOuter, style]}>
    <View style={styles.neuInner}>
      {children}
    </View>
  </View>
);

export default function SettingsScreen() {
  const router = useRouter();
  const [preferences, setPreferences] = useState({
    pushEnabled: true,
    smsEnabled: true,
    aiVoiceSos: true,
    autoRecordAudio: true,
    liveTracking: true,
  });

  useEffect(() => {
    // Fetch current preferences
    const loadPrefs = async () => {
      const profile = await authService.getUserProfile();
      if (profile && profile.safetyPreferences) {
        setPreferences({
          ...preferences,
          ...profile.safetyPreferences
        });
      }
    };
    loadPrefs();
  }, []);

  const toggleSwitch = async (key: string) => {
    const newPrefs = { ...preferences, [key]: !preferences[key as keyof typeof preferences] };
    setPreferences(newPrefs);
    
    try {
      await authService.updateUserProfile({
        safetyPreferences: newPrefs
      });
    } catch (e) {
      console.log('Failed to save preference', e);
    }
  };

  const handleLogout = async () => {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Log Out', 
        style: 'destructive',
        onPress: async () => {
          try {
            await signOut(auth);
            router.replace('/(auth)/sign-in');
          } catch (error) {
            Alert.alert('Error', 'Failed to log out');
          }
        }
      }
    ]);
  };

  const SettingRow = ({ icon, title, desc, value, onToggle }: any) => (
    <View style={styles.settingRow}>
      <View style={styles.settingIcon}>
        <Feather name={icon} size={20} color={COLORS.purplePrimary} />
      </View>
      <View style={styles.settingTextCol}>
        <Text style={styles.settingTitle}>{title}</Text>
        {desc && <Text style={styles.settingDesc}>{desc}</Text>}
      </View>
      <Switch 
        value={value} 
        onValueChange={onToggle} 
        trackColor={{ false: '#D1D5DB', true: '#C4B5FD' }}
        thumbColor={value ? COLORS.purplePrimary : '#F3F4F6'}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <DrawerToggleButton tintColor={COLORS.textPrimary} />
        <Text style={styles.headerTitle}>Safety Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sectionTitle}>AI Detection</Text>
        <NeumorphicCard style={{ marginBottom: 24 }}>
          <SettingRow 
            icon="mic" 
            title="AI Voice SOS" 
            desc="Continuously listen for screams and wake words (e.g., 'Help', 'Bachao')"
            value={preferences.aiVoiceSos}
            onToggle={() => toggleSwitch('aiVoiceSos')}
          />
          <View style={styles.divider} />
          <SettingRow 
            icon="mic-off" 
            title="Auto-Record Audio" 
            desc="Record 10 seconds of audio when emergency is triggered"
            value={preferences.autoRecordAudio}
            onToggle={() => toggleSwitch('autoRecordAudio')}
          />
        </NeumorphicCard>

        <Text style={styles.sectionTitle}>Notifications & Alerts</Text>
        <NeumorphicCard style={{ marginBottom: 24 }}>
          <SettingRow 
            icon="message-square" 
            title="SMS Alerts" 
            desc="Send offline SMS when SOS is triggered"
            value={preferences.smsEnabled}
            onToggle={() => toggleSwitch('smsEnabled')}
          />
          <View style={styles.divider} />
          <SettingRow 
            icon="bell" 
            title="Push Notifications" 
            desc="Receive updates on guardian requests and AI scores"
            value={preferences.pushEnabled}
            onToggle={() => toggleSwitch('pushEnabled')}
          />
          <View style={styles.divider} />
          <SettingRow 
            icon="map-pin" 
            title="Live Tracking" 
            desc="Share live location with guardians during SOS"
            value={preferences.liveTracking}
            onToggle={() => toggleSwitch('liveTracking')}
          />
        </NeumorphicCard>

        <Text style={styles.sectionTitle}>Account</Text>
        <NeumorphicCard style={{ marginBottom: 40 }}>
          <Pressable style={styles.logoutRow} onPress={handleLogout}>
            <View style={[styles.settingIcon, { backgroundColor: '#FEE2E2' }]}>
              <Feather name="log-out" size={20} color={COLORS.red} />
            </View>
            <Text style={styles.logoutText}>Log Out</Text>
            <Feather name="chevron-right" size={20} color={COLORS.textSecondary} />
          </Pressable>
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
  sectionTitle: { fontSize: 14, fontWeight: '700', color: COLORS.textSecondary, textTransform: 'uppercase', marginBottom: 12, marginLeft: 8 },
  neuOuter: {
    borderRadius: 20,
    backgroundColor: COLORS.bg,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 4,
  },
  neuInner: {
    borderRadius: 20,
    backgroundColor: COLORS.bg,
    shadowColor: COLORS.highlight,
    shadowOffset: { width: -6, height: -6 },
    shadowOpacity: 1,
    shadowRadius: 12,
    padding: 8,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E5D5FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  settingTextCol: {
    flex: 1,
    paddingRight: 16,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  settingDesc: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
    lineHeight: 18,
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 16,
  },
  logoutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  logoutText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.red,
  },
});
