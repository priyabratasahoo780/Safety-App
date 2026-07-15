import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, DeviceEventEmitter } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Bell, ArrowLeft, CheckCircle2, ShieldAlert, UserPlus, Info } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { socketService } from '../../src/services/socketService';

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

const NeumorphicCard = React.memo(({ children, style, rounded = 20, padding = 16 }: any) => {
  return (
    <View style={[styles.neuOuter, { borderRadius: rounded }, style]}>
      <View style={[styles.neuInner, { borderRadius: rounded, padding }]}>
        {children}
      </View>
    </View>
  );
});

import { guardianService, GuardianRequest } from '../../src/services/guardianService';
import { authService } from '../../src/services/authService';

export default function NotificationsScreen() {
  const router = useRouter();

  const [notifications, setNotifications] = useState<any[]>(socketService.notifications);
  const [guardianRequests, setGuardianRequests] = useState<GuardianRequest[]>([]);

  useEffect(() => {
    // Refresh on mount just in case
    setNotifications([...socketService.notifications]);

    const subscription = DeviceEventEmitter.addListener('new_notification', (newNotif) => {
      setNotifications(prev => [newNotif, ...prev]);
    });

    // Subscribe to Guardian Requests
    let unsubscribeRequests: any = null;
    const setupGuardianListener = async () => {
      const profile = await authService.getUserProfile();
      if (profile && profile.uid) {
        unsubscribeRequests = guardianService.subscribeToPendingRequests(profile.uid, (requests) => {
          setGuardianRequests(requests);
        });
      }
    };
    setupGuardianListener();

    return () => {
      subscription.remove();
      if (unsubscribeRequests) unsubscribeRequests();
    };
  }, []);

  const handleAcceptRequest = async (request: GuardianRequest) => {
    try {
      await guardianService.acceptRequest(request);
      // Remove from list optimistically
      setGuardianRequests(prev => prev.filter(r => r.id !== request.id));
    } catch (e) {
      console.error(e);
    }
  };

  const handleRejectRequest = async (request: GuardianRequest) => {
    try {
      await guardianService.rejectRequest(request.id);
      setGuardianRequests(prev => prev.filter(r => r.id !== request.id));
    } catch (e) {
      console.error(e);
    }
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
    socketService.notifications.forEach(n => n.read = true);
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
        {/* Guardian Requests Section */}
        {guardianRequests.length > 0 && (
          <View style={{ marginBottom: 20 }}>
            <Text style={{ fontSize: 16, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 12 }}>Guardian Requests</Text>
            {guardianRequests.map((req) => (
              <NeumorphicCard key={req.id} style={{ marginBottom: 12, borderLeftWidth: 4, borderLeftColor: COLORS.purplePrimary }}>
                <View style={styles.notifRow}>
                  <View style={[styles.iconBox, { backgroundColor: COLORS.highlight }]}>
                    <UserPlus size={20} color={COLORS.purplePrimary} />
                  </View>
                  <View style={styles.notifContent}>
                    <Text style={[styles.notifTitle, { fontWeight: '800' }]}>{req.fromName} wants to connect!</Text>
                    <Text style={styles.notifMessage}>They will become your Guardian.</Text>
                    
                    <View style={{ flexDirection: 'row', marginTop: 12, gap: 10 }}>
                      <Pressable 
                        style={{ flex: 1, backgroundColor: COLORS.purplePrimary, paddingVertical: 10, borderRadius: 10, alignItems: 'center' }}
                        onPress={() => handleAcceptRequest(req)}
                      >
                        <Text style={{ color: '#FFF', fontWeight: '700', fontSize: 13 }}>Accept</Text>
                      </Pressable>
                      <Pressable 
                        style={{ flex: 1, backgroundColor: '#E5E7EB', paddingVertical: 10, borderRadius: 10, alignItems: 'center' }}
                        onPress={() => handleRejectRequest(req)}
                      >
                        <Text style={{ color: COLORS.textPrimary, fontWeight: '700', fontSize: 13 }}>Decline</Text>
                      </Pressable>
                    </View>
                  </View>
                </View>
              </NeumorphicCard>
            ))}
          </View>
        )}

        <Text style={{ fontSize: 16, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 12 }}>Alerts</Text>
        
        {notifications.length === 0 ? (
          <View style={{ alignItems: 'center', justifyContent: 'center', marginTop: 60 }}>
            <Bell size={64} color={COLORS.textSecondary} style={{ opacity: 0.3, marginBottom: 16 }} />
            <Text style={{ fontSize: 18, color: COLORS.textSecondary, fontWeight: '600' }}>No new notifications</Text>
            <Text style={{ fontSize: 14, color: COLORS.textSecondary, marginTop: 8 }}>When an SOS is triggered, it will appear here.</Text>
          </View>
        ) : (
          notifications.map((notif) => (
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
          ))
        )}
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
