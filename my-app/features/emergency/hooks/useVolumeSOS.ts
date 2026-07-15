import { useEffect, useRef } from 'react';
let VolumeManager: any = null;
try {
  VolumeManager = require('react-native-volume-manager').VolumeManager;
} catch (e) {
  console.warn("[VolumeSOS] react-native-volume-manager is not linked. This is expected in Expo Go. Volume SOS will be disabled until you build a custom dev client.");
}
import { useRouter, usePathname } from 'expo-router';
import { EmergencyStatus } from '../../emergency/types/emergency.types';
import { ServiceLocator } from '../../voice-sos/utils/ServiceLocator';
import { Platform } from 'react-native';

// Removed rapid click constants in favor of single Volume Up click

export const useVolumeSOS = (isActive: boolean = true) => {
  const router = useRouter();
  const pathname = usePathname();
  
  const clickTimestamps = useRef<number[]>([]);
  const lastVolume = useRef<number>(-1);

  useEffect(() => {
    if (!isActive || !VolumeManager) return;

    const volumeListener = VolumeManager.addVolumeListener((result: any) => {
      // result.volume is between 0 and 1
      const currentVolume = result.volume;
      
      // If we have a previous volume, and it INCREASED (Volume + button)
      if (lastVolume.current !== -1 && currentVolume > lastVolume.current) {
        
        const emergencyService = ServiceLocator.getInstance().emergency;
        const current = emergencyService.getCurrentEmergency();
        const isAlreadyInEmergency = current && current.status === EmergencyStatus.EMERGENCY;
        
        if (!isAlreadyInEmergency && pathname !== '/sos/active') {
          // console.log('[VolumeSOS] Volume Up (+) detected! Navigating to SOS active screen...');
          router.push('/sos/active');
        }
      }
      
      lastVolume.current = currentVolume;
    });

    return () => {
      volumeListener.remove();
    };
  }, [isActive, pathname, router]);
};
