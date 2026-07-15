import { io, Socket } from 'socket.io-client';
import * as Notifications from 'expo-notifications';
import { Platform, DeviceEventEmitter } from 'react-native';

// Set your backend URL here. For Android emulator, use 10.0.2.2 instead of localhost.
const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://10.0.2.2:3000';

class SocketService {
  private socket: Socket | null = null;
  private currentUserId: string | null = null;
  public notifications: any[] = [];

  constructor() {
    // Configure expo notifications behavior
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
  }

  connect(userId: string) {
    if (this.socket) {
      this.socket.disconnect();
    }

    this.currentUserId = userId;
    this.socket = io(BACKEND_URL, {
      transports: ['websocket'],
    });

    this.socket.on('connect', () => {
      // console.log('[SocketService] Connected to backend');
      this.socket?.emit('join_room', userId);
    });

    this.socket.on('emergency_alert', async (data) => {
      // console.log('[SocketService] Received emergency alert:', data);
      
      let bodyText = `${data.victimName || 'Someone'} triggered an SOS!`;
      if (data.location) bodyText += `\n📍 Location attached.`;
      if (data.battery !== undefined) bodyText += `\n🔋 Battery: ${(data.battery * 100).toFixed(0)}%`;
      if (data.videoUrl) bodyText += `\n📹 Video Evidence available.`;

      // Trigger a local notification
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🚨 EMERGENCY ALERT',
          body: bodyText,
          data: { incidentUserId: data.incidentUserId, type: 'emergency_alert', ...data },
          sound: true,
          priority: Notifications.AndroidNotificationPriority.MAX,
        },
        trigger: null, // trigger immediately
      });
      
      // Emit event for UI updates
      const newNotif = {
        id: Date.now(),
        type: 'alert',
        title: '🚨 ' + (data.victimName || 'Someone') + ' triggered an SOS!',
        message: bodyText,
        time: 'Just now',
        read: false,
        data: data
      };
      this.notifications.unshift(newNotif);
      DeviceEventEmitter.emit('new_notification', newNotif);
    });

    this.socket.on('emergency_cancelled', async (data) => {
      // console.log('[SocketService] Received emergency cancel:', data);
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '✅ SOS CANCELLED',
          body: `${data.victimName || 'Someone'} is safe. False alarm.`,
          data: { incidentUserId: data.incidentUserId, type: 'emergency_cancelled' },
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: null,
      });

      // Emit event for UI updates
      const cancelNotif = {
        id: Date.now(),
        type: 'success',
        title: '✅ SOS CANCELLED',
        message: `${data.victimName || 'Someone'} is safe. False alarm.`,
        time: 'Just now',
        read: false,
        data: data
      };
      this.notifications.unshift(cancelNotif);
      DeviceEventEmitter.emit('new_notification', cancelNotif);
    });

    this.socket.on('disconnect', () => {
      // console.log('[SocketService] Disconnected from backend');
    });
  }

  triggerEmergency(victimId: string, victimName: string, guardianIds: string[], location?: any, battery?: number, videoUrl?: string) {
    if (this.socket && this.socket.connected) {
      this.socket.emit('trigger_emergency', {
        victimId,
        victimName,
        guardianIds,
        location,
        battery,
        videoUrl
      });
      // console.log('[SocketService] Sent emergency trigger to socket server');
    } else {
      console.warn('[SocketService] Socket not connected, cannot trigger emergency via socket');
    }
  }

  cancelEmergency(victimId: string, victimName: string, guardianIds: string[]) {
    if (this.socket && this.socket.connected) {
      this.socket.emit('cancel_emergency', {
        victimId,
        victimName,
        guardianIds
      });
      // console.log('[SocketService] Sent cancel emergency to socket server');
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.currentUserId = null;
  }
}

export const socketService = new SocketService();
