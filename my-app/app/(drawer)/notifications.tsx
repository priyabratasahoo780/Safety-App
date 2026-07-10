import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Bell, ArrowLeft, CheckCircle2, ShieldAlert, UserPlus, Info } from 'lucide-react-native';
import { useRouter } from 'expo-router';

const COLORS = {
  bg: '#EBF0F9',
  textPrimary: '#111638',
  textSecondary: '#69708A',
  purplePrimary: '#6D35E8',
  green: '#12B76A',
  red: '#F04438',
  blue: '#2E90FA',
  shadow: 'rgba(163, 177, 198, 0.55)',
  highlight: '#FFFFFF',
};

const NeumorphicCard = ({ children, style, rounded = 20, padding = 16 }: any) => {
  return (
    <View style={[styles.neuOuter, { borderRadius: rounded }, style]}>
      <View style={[styles.neuInner, { borderRadius: rounded, padding }]}>
        {children}
      </View>
    </View>
  );
};

export default function NotificationsScreen() {
  const router = useRouter();

  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'alert',
      title: 'AI Safety Service Active',
      message: 'Background voice and motion detection is actively monitoring your safety.',
      time: 'Just now',
      read: false,
    },
    {
      id: 2,
      type: 'success',
      title: 'Safe Route Computed',
      message: 'Your route to Downtown has been verified as safe with well-lit streets.',
      time: '2h ago',
      read: false,
    },
    {
      id: 3,
      type: 'info',
      title: 'Guardian Updated',
      message: 'John Doe has accepted your request to be your emergency guardian.',
      time: 'Yesterday',
      read: true,
    },
    {
      id: 4,
      type: 'system',
      title: 'System Update',
      message: 'SafeSphere AI models have been updated for better voice recognition.',
      time: '2 days ago',
      read: true,
    }
  ]);

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const getIcon = (type: string) => {
    switch(type) {
      case 'alert': return <ShieldAlert size={20} color={COLORS.red} />;
      case 'success': return <CheckCircle2 size={20} color={COLORS.green} />;
      case 'info': return <UserPlus size={20} color={COLORS.purplePrimary} />;
      default: return <Info size={20} color={COLORS.blue} />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={24} color={COLORS.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.subHeader}>
        <Text style={styles.countText}>
          {notifications.filter(n => !n.read).length} Unread
        </Text>
        <Pressable onPress={markAllAsRead}>
          <Text style={styles.markReadText}>Mark all as read</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {notifications.map((notif) => (
          <NeumorphicCard 
            key={notif.id} 
            style={[styles.notifCard, !notif.read && styles.unreadBorder]}
          >
            <View style={styles.notifRow}>
              <View style={[styles.iconBox, { backgroundColor: COLORS.highlight }]}>
                {getIcon(notif.type)}
              </View>
              <View style={styles.notifContent}>
                <View style={styles.notifHeaderRow}>
                  <Text style={[styles.notifTitle, !notif.read && styles.boldTitle]}>{notif.title}</Text>
                  <Text style={styles.notifTime}>{notif.time}</Text>
                </View>
                <Text style={styles.notifMessage}>{notif.message}</Text>
              </View>
            </View>
          </NeumorphicCard>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  subHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  countText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  markReadText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.purplePrimary,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  notifCard: {
    marginBottom: 16,
  },
  unreadBorder: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.purplePrimary,
  },
  notifRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notifContent: {
    flex: 1,
  },
  notifHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  notifTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  boldTitle: {
    fontWeight: '800',
  },
  notifTime: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  notifMessage: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  neuOuter: {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 4,
    backgroundColor: COLORS.bg,
  },
  neuInner: {
    shadowColor: COLORS.highlight,
    shadowOffset: { width: -6, height: -6 },
    shadowOpacity: 1,
    shadowRadius: 12,
    backgroundColor: COLORS.bg,
    overflow: 'hidden',
  },
});
