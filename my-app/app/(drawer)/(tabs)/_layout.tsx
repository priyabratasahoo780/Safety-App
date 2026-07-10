import { Tabs, useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Platform } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useVoiceDetection } from '../../../features/voice-sos/hooks/useVoiceDetection';

export default function TabLayout() {
  const router = useRouter();

  // Globally initialize Voice/Sound SOS detection
  const { isEmergency } = useVoiceDetection({ autoStart: true });

  React.useEffect(() => {
    if (isEmergency) {
      router.push('/sos/active');
    }
  }, [isEmergency]);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#6D28D9', // primary.600 (violet)
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarStyle: styles.tabBar,
        headerShown: false,
        tabBarShowLabel: true,
        tabBarLabelStyle: styles.tabBarLabel,
      }}
    >
      <Tabs.Screen
        name="home/index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <Feather name="home" size={22} color={color} style={focused && styles.activeIconGlow} />
          ),
        }}
      />
      
      {/* Custom Elevated Center SOS Button */}
      <Tabs.Screen
        name="sos-placeholder"
        options={{
          title: 'SOS',
          tabBarLabelStyle: [styles.tabBarLabel, { color: '#DC2626', fontWeight: '800' }],
          tabBarButton: () => (
            <TouchableOpacity
              style={styles.sosButtonContainer}
              activeOpacity={0.8}
              onPress={() => router.push('/sos/active')}
            >
              <View style={styles.sosInnerButton}>
                <MaterialCommunityIcons name="alert-decagram" size={28} color="#FFFFFF" />
              </View>
              <Text style={styles.sosLabel}>SOS</Text>
            </TouchableOpacity>
          ),
        }}
      />


      <Tabs.Screen
        name="navigate/index"
        options={{
          title: 'Navigate',
          tabBarIcon: ({ color, focused }) => (
            <Feather name="navigation" size={22} color={color} style={focused && styles.activeIconGlow} />
          ),
        }}
      />
      
      {/* Hidden tab button but keeps the bottom navbar visible when on this screen */}
      <Tabs.Screen
        name="safety-analysis"
        options={{
          href: null,
          tabBarStyle: { display: 'none' }, // optional but helps
        }}
      />
      <Tabs.Screen
        name="live-tracking"
        options={{
          href: null,
        }}
      />
      
      {/* Hide ghost tabs that linger if the Metro cache hasn't been reset yet */}
      <Tabs.Screen name="ai-assistant" options={{ href: null }} />
      <Tabs.Screen name="community" options={{ href: null }} />
      <Tabs.Screen name="profile" options={{ href: null }} />
      <Tabs.Screen name="ai-assistant/index" options={{ href: null }} />
      <Tabs.Screen name="community/index" options={{ href: null }} />
      <Tabs.Screen name="profile/index" options={{ href: null }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    height: Platform.OS === 'ios' ? 88 : 68,
    position: 'absolute',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    backgroundColor: '#FFFFFF',
    paddingBottom: Platform.OS === 'ios' ? 28 : 10,
    paddingTop: 10,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 8,
  },
  tabBarLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  activeIconGlow: {
    // Subtle design glow for active icon
    shadowColor: '#6D28D9',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  sosButtonContainer: {
    top: -22,
    justifyContent: 'center',
    alignItems: 'center',
    width: 68,
    height: 78,
  },
  sosInnerButton: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#DC2626', // safety.danger (red)
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  sosLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#DC2626',
    marginTop: 4,
  },
});
