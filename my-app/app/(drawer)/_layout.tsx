import { Drawer } from 'expo-router/drawer';
import { Feather } from '@expo/vector-icons';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useEmergencyListener } from '../../features/emergency/hooks/useEmergencyListener';
import { useShakeToSOS } from '../../features/emergency/hooks/useShakeToSOS';
import { useVolumeSOS } from '../../features/emergency/hooks/useVolumeSOS';
import { useEffect } from 'react';
import { authService } from '../../src/services/authService';
import { UserProfileProvider } from '../../src/context/UserProfileContext';

export default function DrawerLayout() {
  // Global listener for Guardian incoming emergencies
  useEmergencyListener();
  
  // Global listener for Shake-to-SOS (accelerometer)
  useShakeToSOS();

  // Global listener for Volume SOS
  useVolumeSOS();

  useEffect(() => {
    // Register device for push notifications when they enter the authenticated area
    authService.registerForPushNotificationsAsync().catch(console.error);
  }, []);

  return (
    <UserProfileProvider>
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer
        screenOptions={{
          headerShown: false,
          drawerStyle: {
            backgroundColor: '#FFFFFF', // Clean white background matching welcome theme
            width: 280,
            borderRightWidth: 1,
            borderRightColor: '#E5E7EB', // Subtle light border
            borderTopRightRadius: 36, // Neuromorphic heavy rounding
            borderBottomRightRadius: 36,
            shadowColor: '#000000',
            shadowOffset: { width: 15, height: 0 },
            shadowOpacity: 0.1, // Softer shadow for light theme
            shadowRadius: 25,
            elevation: 10, 
          },
          drawerActiveBackgroundColor: '#F3E8FF', // Light purple pill
          drawerActiveTintColor: '#6D28D9', // Deep purple text/icon
          drawerInactiveTintColor: '#4B5563', // Clean dark gray for inactive
          drawerItemStyle: {
            borderRadius: 24, // Perfect pill shape
            paddingHorizontal: 8,
            marginVertical: 6,
            marginHorizontal: 16,
          },
          drawerLabelStyle: {
            fontSize: 15,
            fontWeight: '700',
            marginLeft: 0,
          },
        }}
      >
        <Drawer.Screen
          name="(tabs)"
          options={{
            drawerLabel: 'Dashboard',
            drawerIcon: ({ color }) => <Feather name="home" size={22} color={color} />,
          }}
        />
        <Drawer.Screen
          name="add-contact"
          options={{
            drawerItemStyle: { display: 'none' }, // Hide from Drawer menu, accessible via Manage Guardians
          }}
        />
        <Drawer.Screen
          name="manage-guardians"
          options={{
            drawerLabel: 'Manage Guardians',
            drawerIcon: ({ color }) => <Feather name="shield" size={22} color={color} />,
          }}
        />
        <Drawer.Screen
          name="settings"
          options={{
            drawerLabel: 'Emergency Settings',
            drawerIcon: ({ color }) => <Feather name="settings" size={22} color={color} />,
          }}
        />
        <Drawer.Screen
          name="ai-assistant/index"
          options={{
            drawerLabel: 'AI Assistant',
            drawerIcon: ({ color }) => <Feather name="message-circle" size={22} color={color} />,
          }}
        />
        <Drawer.Screen
          name="community"
          options={{
            drawerLabel: 'Community',
            drawerIcon: ({ color }) => <Feather name="users" size={22} color={color} />,
          }}
        />
        <Drawer.Screen
          name="profile/index"
          options={{
            drawerLabel: 'Profile',
            drawerIcon: ({ color }) => <Feather name="user" size={22} color={color} />,
          }}
        />
        <Drawer.Screen
          name="crime-rate"
          options={{
            drawerLabel: 'Crime Rate Area',
            drawerIcon: ({ color }) => <Feather name="map" size={22} color={color} />,
          }}
        />
        <Drawer.Screen
          name="live-tracking"
          options={{
            drawerLabel: 'Live Tracking',
            drawerIcon: ({ color }) => <Feather name="map-pin" size={22} color={color} />,
          }}
        />
        <Drawer.Screen
          name="safety-analysis"
          options={{
            drawerLabel: 'Safety Analysis',
            drawerIcon: ({ color }) => <Feather name="shield" size={22} color={color} />,
          }}
        />
        <Drawer.Screen
          name="permissions"
          options={{
            drawerLabel: 'Permissions & Access',
            drawerIcon: ({ color }) => <Feather name="unlock" size={22} color={color} />,
          }}
        />
        <Drawer.Screen
          name="fake-call"
          options={{
            drawerItemStyle: { display: 'none' }, // Hide from Drawer menu, but register route
          }}
        />
        <Drawer.Screen
          name="notifications"
          options={{
            drawerItemStyle: { display: 'none' }, // Hide from Drawer menu
          }}
        />
        <Drawer.Screen
          name="safety-timer"
          options={{
            drawerItemStyle: { display: 'none' }, // Hide from Drawer menu
          }}
        />
      </Drawer>
    </GestureHandlerRootView>
    </UserProfileProvider>
  );
}
