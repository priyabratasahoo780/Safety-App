import { Drawer } from 'expo-router/drawer';
import { Feather } from '@expo/vector-icons';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function DrawerLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer
        screenOptions={{
          headerShown: false,
          drawerStyle: {
            backgroundColor: '#18181B', // Deep dark sleek background
            width: 280,
            borderRightWidth: 1,
            borderRightColor: '#27272A', // Subtle dark border
            borderTopRightRadius: 36, // Neuromorphic heavy rounding
            borderBottomRightRadius: 36,
            shadowColor: '#000000',
            shadowOffset: { width: 15, height: 0 },
            shadowOpacity: 0.4,
            shadowRadius: 25,
            elevation: 20, // Huge shadow for floating neuromorphic effect
          },
          drawerActiveBackgroundColor: '#F3E8FF', // Light purple pill
          drawerActiveTintColor: '#6D28D9', // Deep purple text/icon
          drawerInactiveTintColor: '#71717A', // Sleek dark gray for inactive
          drawerItemStyle: {
            borderRadius: 24, // Perfect pill shape
            paddingHorizontal: 8,
            marginVertical: 6,
            marginHorizontal: 16,
          },
          drawerLabelStyle: {
            fontSize: 15,
            fontWeight: '700',
            marginLeft: -10,
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
            drawerLabel: 'Add Guardian',
            drawerIcon: ({ color }) => <Feather name="user-plus" size={22} color={color} />,
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
          name="community/index"
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
      </Drawer>
    </GestureHandlerRootView>
  );
}
