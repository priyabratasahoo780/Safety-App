import { useEffect, useRef } from 'react';
import { Accelerometer } from 'expo-sensors';
import { useRouter, usePathname } from 'expo-router';
import { EmergencyStatus } from '../../emergency/types/emergency.types';
import { ServiceLocator } from '../../voice-sos/utils/ServiceLocator';

const SHAKE_THRESHOLD = 3.5; // Earth gravity is 1g. 3.5 is a deliberate hard shake.
const DEBOUNCE_TIME = 5000; // Wait 5 seconds between allowed triggers to avoid loops

export const useShakeToSOS = (isActive: boolean = true) => {
  const router = useRouter();
  const pathname = usePathname();
  const lastShakeTime = useRef<number>(0);

  useEffect(() => {
    if (!isActive) return;

    // Set update interval. 400ms is efficient enough for battery life while detecting shakes.
    Accelerometer.setUpdateInterval(400);

    const subscription = Accelerometer.addListener(({ x, y, z }) => {
      // Calculate total acceleration magnitude
      const acceleration = Math.sqrt(x * x + y * y + z * z);
      
      if (acceleration > SHAKE_THRESHOLD) {
        const now = Date.now();
        if (now - lastShakeTime.current > DEBOUNCE_TIME) {
          lastShakeTime.current = now;
          
          // Ensure we aren't already on the SOS screen or actively in an emergency
          const emergencyService = ServiceLocator.getInstance().emergency;
          const current = emergencyService.getCurrentEmergency();
          const isAlreadyInEmergency = current && current.status === EmergencyStatus.EMERGENCY;
          
          if (!isAlreadyInEmergency && pathname !== '/sos/active') {
            // console.log('[ShakeToSOS] Shake detected! Navigating to SOS active screen...');
            router.push('/sos/active');
          }
        }
      }
    });

    return () => {
      subscription.remove();
    };
  }, [isActive, pathname, router]);
};
