import { Tabs, useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Platform, DeviceEventEmitter } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useVoiceDetection } from '../../../features/voice-sos/hooks/useVoiceDetection';

export default function TabLayout() {
  const router = useRouter();

  // Globally initialize Voice/Sound SOS detection
  const { isEmergency, resolveEmergency, stop } = useVoiceDetection({ autoStart: true });

  React.useEffect(() => {
    if (isEmergency) {
      router.push('/sos/active');
    }
  }, [isEmergency]);

  React.useEffect(() => {
    const sub = DeviceEventEmitter.addListener('stop_sos', () => {
      if (resolveEmergency) resolveEmergency();
      if (stop) stop();
    });
    return () => sub.remove();
  }, [resolveEmergency, stop]);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#A78BFA', // bright violet-400 for dark mode tab bar contrast
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
          tabBarButton: (props) => {
            const { style, delayLongPress, ...restProps } = props as any;
            return (
              <TouchableOpacity
                {...restProps}
                style={[style, styles.sosButtonContainer]}
                activeOpacity={0.8}
                onPress={() => router.push('/sos/active')}
              >
                <View style={styles.sosInnerButton}>
                  <MaterialCommunityIcons name="alert-decagram" size={26} color="#FFFFFF" />
                </View>
                <Text style={styles.sosLabel}>SOS</Text>
              </TouchableOpacity>
            );
          },
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
    height: 64,
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 24 : 16,
    left: 16,
    right: 16,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: '#1E293B',
    backgroundColor: '#0A0D1A', // premium dark navy/black
    paddingBottom: 4,
    paddingTop: 4,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
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
    shadowColor: '#A78BFA',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  sosButtonContainer: {
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sosInnerButton: {
    position: 'absolute',
    top: -20,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#DC2626', // safety.danger (red)
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  sosLabel: {
    position: 'absolute',
    bottom: 6,
    fontSize: 11,
    fontWeight: '800',
    color: '#DC2626',
  },
});
