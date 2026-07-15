import { useState, useEffect, useRef } from 'react';
import * as Location from 'expo-location';
import { LiveLocationData, LocationPermissionState } from '../types/location.types';
import { locationService } from '../../../src/services/locationService';

export const useLiveLocation = () => {
  const [permission, setPermission] = useState<LocationPermissionState>('undetermined');
  const [location, setLocation] = useState<LiveLocationData | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [isDetecting, setIsDetecting] = useState<boolean>(true);
  
  // Track last reverse geocoded coordinates to prevent spamming the geocoding API
  const lastGeocodedCoords = useRef<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    let isMounted = true;
    setIsDetecting(true);

    const handleLocationUpdate = async (newPos: Location.LocationObject) => {
      if (!isMounted) return;

      const locData: LiveLocationData = {
        latitude: newPos.coords.latitude,
        longitude: newPos.coords.longitude,
        altitude: newPos.coords.altitude,
        accuracy: newPos.coords.accuracy,
        heading: newPos.coords.heading,
        speed: newPos.coords.speed,
        timestamp: newPos.timestamp,
      };

      setLocation(locData);
      setPermission('granted');
      setIsDetecting(false);

      // Prevent reverse geocoding on every GPS update if we haven't moved significantly (> 100 meters)
      const last = lastGeocodedCoords.current;
      if (last) {
        const diffLat = Math.abs(last.lat - newPos.coords.latitude);
        const diffLng = Math.abs(last.lng - newPos.coords.longitude);
        if (diffLat < 0.001 && diffLng < 0.001) {
          return; // Skip geocoding
        }
      }

      try {
        lastGeocodedCoords.current = { lat: newPos.coords.latitude, lng: newPos.coords.longitude };
        const geocoded = await Location.reverseGeocodeAsync({
          latitude: newPos.coords.latitude,
          longitude: newPos.coords.longitude
        });
        
        if (geocoded.length > 0) {
          const place = geocoded[0];
          const formattedAddress = [place.name || place.street, place.city || place.subregion].filter(Boolean).join(', ');
          setAddress(formattedAddress || `${newPos.coords.latitude.toFixed(4)}, ${newPos.coords.longitude.toFixed(4)}`);
        } else {
          setAddress(`${newPos.coords.latitude.toFixed(4)}, ${newPos.coords.longitude.toFixed(4)}`);
        }
      } catch (e) {
        console.warn("Reverse geocode failed:", e);
      }
    };

    locationService.subscribe(handleLocationUpdate);

    return () => {
      isMounted = false;
      locationService.unsubscribe(handleLocationUpdate);
    };
  }, []);

  // For backward compatibility with screens that manually trigger it
  const initLocation = async () => {
    // It's handled automatically by the subscription now
  };

  return { permission, location, address, isDetecting, initLocation };
};
