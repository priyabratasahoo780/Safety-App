import { useState, useEffect, useRef } from 'react';
import * as Location from 'expo-location';
import { LiveLocationData, LocationPermissionState } from '../types/location.types';

export const useLiveLocation = () => {
  const [permission, setPermission] = useState<LocationPermissionState>('undetermined');
  const [location, setLocation] = useState<LiveLocationData | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [isDetecting, setIsDetecting] = useState<boolean>(true);
  
  const locationSubscription = useRef<Location.LocationSubscription | null>(null);

  const initLocation = async () => {
    setIsDetecting(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setPermission(status === 'granted' ? 'granted' : 'denied');
      
      if (status !== 'granted') {
        setIsDetecting(false);
        return;
      }

      const initialPos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const locData: LiveLocationData = {
        latitude: initialPos.coords.latitude,
        longitude: initialPos.coords.longitude,
        altitude: initialPos.coords.altitude,
        accuracy: initialPos.coords.accuracy,
        heading: initialPos.coords.heading,
        speed: initialPos.coords.speed,
        timestamp: initialPos.timestamp,
      };

      setLocation(locData);
      
      // Reverse geocode initial location
      const geocoded = await Location.reverseGeocodeAsync({
        latitude: locData.latitude,
        longitude: locData.longitude
      });
      
      if (geocoded.length > 0) {
        const place = geocoded[0];
        const formattedAddress = [place.name || place.street, place.city || place.subregion].filter(Boolean).join(', ');
        setAddress(formattedAddress || `${locData.latitude.toFixed(4)}, ${locData.longitude.toFixed(4)}`);
      } else {
        setAddress(`${locData.latitude.toFixed(4)}, ${locData.longitude.toFixed(4)}`);
      }

      // Start watching
      locationSubscription.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 3000,
          distanceInterval: 5,
        },
        (newPos) => {
          setLocation({
            latitude: newPos.coords.latitude,
            longitude: newPos.coords.longitude,
            altitude: newPos.coords.altitude,
            accuracy: newPos.coords.accuracy,
            heading: newPos.coords.heading,
            speed: newPos.coords.speed,
            timestamp: newPos.timestamp,
          });
        }
      );
    } catch (e) {
      console.warn("Location error:", e);
    } finally {
      setIsDetecting(false);
    }
  };

  useEffect(() => {
    initLocation();

    return () => {
      if (locationSubscription.current) {
        locationSubscription.current.remove();
        locationSubscription.current = null;
      }
    };
  }, []);

  return { permission, location, address, isDetecting, initLocation };
};
