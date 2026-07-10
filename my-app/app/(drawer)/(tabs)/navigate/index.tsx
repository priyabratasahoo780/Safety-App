import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

import { SafeRouteMap } from '../../../../features/location/components/SafeRouteMap';
import { useLiveLocation } from '../../../../features/location/hooks/useLiveLocation';
import { RouteOption } from '../../../../features/location/types/location.types';

const { width, height } = Dimensions.get('window');

export default function NavigateScreen() {
  const router = useRouter();
  const [selectedRoute, setSelectedRoute] = useState<'recommended' | 'shorter'>('recommended');
  const [destination, setDestination] = useState('Salt Lake Central Park');
  const { location } = useLiveLocation();
  const [routes, setRoutes] = useState<RouteOption[]>([]);
  const [destinationCoords, setDestinationCoords] = useState({ latitude: 22.5855, longitude: 88.4166 });

  React.useEffect(() => {
    if (location) {
      const start = { latitude: location.latitude, longitude: location.longitude };
      const end = destinationCoords;
      
      // Calculate straight-line distance in km (Haversine)
      const toRad = (value: number) => (value * Math.PI) / 180;
      const R = 6371; // Earth's radius in km
      const dLat = toRad(end.latitude - start.latitude);
      const dLon = toRad(end.longitude - start.longitude);
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(start.latitude)) * Math.cos(toRad(end.latitude)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distanceKm = R * c;
      
      // Direct Route is roughly 1.3x straight-line distance due to roads
      const directDist = distanceKm * 1.3;
      // Safest route might be slightly longer, say 1.5x
      const safeDist = distanceKm * 1.5;
      
      // Assume average speed in city is 30 km/h (0.5 km/min)
      const directMins = Math.max(1, Math.round(directDist / 0.5));
      const safeMins = Math.max(1, Math.round(safeDist / 0.5));

      const generatePath = (curveOffset: number) => [
        start,
        { latitude: start.latitude + (end.latitude - start.latitude) * 0.3 + curveOffset, longitude: start.longitude + (end.longitude - start.longitude) * 0.3 },
        { latitude: start.latitude + (end.latitude - start.latitude) * 0.7 - curveOffset, longitude: start.longitude + (end.longitude - start.longitude) * 0.7 },
        end
      ];

      setRoutes([
        {
          id: 'recommended',
          title: 'Safest Route',
          theme: 'green',
          description: 'AI Recommended',
          duration: `${safeMins > 60 ? Math.floor(safeMins/60) + ' hr ' + (safeMins%60) : safeMins} mins`,
          distance: `${safeDist.toFixed(1)} km`,
          tags: [],
          coordinates: generatePath(0.002)
        },
        {
          id: 'shorter',
          title: 'Direct Route',
          theme: 'orange',
          description: 'Fastest',
          duration: `${directMins > 60 ? Math.floor(directMins/60) + ' hr ' + (directMins%60) : directMins} mins`,
          distance: `${directDist.toFixed(1)} km`,
          tags: [],
          coordinates: generatePath(-0.003)
        }
      ]);
    }
  }, [location, destinationCoords]);

  React.useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (destination.trim().length > 2) {
        try {
          // Use Open-Meteo Geocoding API (completely free, no restrictions)
          const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(destination)}&count=1&language=en&format=json`);
          const data = await res.json();
          if (data && data.results && data.results.length > 0) {
            setDestinationCoords({ 
              latitude: data.results[0].latitude, 
              longitude: data.results[0].longitude 
            });
          }
        } catch (e) {
          console.warn("Geocoding failed", e);
        }
      }
    }, 1000); // 1s debounce

    return () => clearTimeout(delayDebounceFn);
  }, [destination]);

  const handleStartJourney = () => {
    const route = routes.find(r => r.id === selectedRoute);
    let mins = 25;
    if (route) {
       if (route.duration.includes('hr')) {
         const parts = route.duration.split('hr');
         const h = parseInt(parts[0].trim());
         const m = parseInt(parts[1].replace('mins', '').trim()) || 0;
         mins = (h * 60) + m;
       } else {
         mins = parseInt(route.duration.replace('mins', '').trim()) || 25;
       }
    }

    router.push({
      pathname: '/journey/new',
      params: { destination, selectedRoute, estMins: mins }
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="dark" />
      
      {/* Route Map Header and Search inputs */}
      <View style={styles.searchHeader}>
        <Text style={styles.title}>Safe Navigation</Text>
        
        <View style={styles.inputsWrapper}>
          <View style={styles.inputRow}>
            <View style={styles.iconDotContainer}>
              <View style={styles.startDot} />
              <View style={styles.dashLine} />
              <View style={styles.endDot} />
            </View>
            
            <View style={styles.textInputsContainer}>
              <View style={styles.singleInput}>
                <TextInput
                  style={styles.textInput}
                  value="Current Location"
                  editable={false}
                  placeholderTextColor="#9CA3AF"
                />
                <MaterialCommunityIcons name="crosshairs-gps" size={16} color="#6D28D9" />
              </View>
              
              <View style={styles.divider} />
              
              <View style={styles.singleInput}>
                <TextInput
                  style={styles.textInput}
                  value={destination}
                  onChangeText={setDestination}
                  placeholder="Where to?"
                  placeholderTextColor="#9CA3AF"
                />
                <TouchableOpacity onPress={() => setDestination('')}>
                  <Feather name="x" size={16} color="#9CA3AF" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* Main Map Visualization */}
      <View style={styles.mapContainer}>
        <SafeRouteMap 
          currentLocation={location}
          destination={{ latitude: destinationCoords.latitude, longitude: destinationCoords.longitude, address: destination }}
          routes={routes}
          selectedRoute={routes.find(r => r.id === selectedRoute) || null}
          onLongPressMap={() => {}}
        />
      </View>

      {/* Route Cards Scroll Container */}
      <View style={styles.bottomCardWrapper}>
        <Text style={styles.cardsHeader}>Select Route</Text>

        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.routesScroll}
        >
          {/* Route 1: Safest Route (Violet/Green) */}
          <TouchableOpacity 
            style={[
              styles.routeCard, 
              selectedRoute === 'recommended' && styles.activeRouteCard
            ]}
            onPress={() => setSelectedRoute('recommended')}
          >
            <View style={styles.routeHeader}>
              <View style={styles.badgeSafest}>
                <Text style={styles.badgeText}>AI RECOMMENDED</Text>
              </View>
              <View style={[styles.scoreBadge, { backgroundColor: '#DEF7EC' }]}>
                <Text style={[styles.scoreText, { color: '#0E9F6E' }]}>92</Text>
              </View>
            </View>

            <Text style={styles.routeTitle}>Safest Route</Text>
            <Text style={styles.routeMetrics}>16 mins • 4.2 km</Text>
            
            <View style={styles.featuresList}>
              <View style={styles.featureItem}>
                <Feather name="eye" size={12} color="#16A34A" />
                <Text style={styles.featureText}>Well-lit streets</Text>
              </View>
              <View style={styles.featureItem}>
                <Feather name="check-circle" size={12} color="#16A34A" />
                <Text style={styles.featureText}>Safe Havens open</Text>
              </View>
            </View>
          </TouchableOpacity>

          {/* Route 2: Fastest Route (Orange) */}
          <TouchableOpacity 
            style={[
              styles.routeCard, 
              selectedRoute === 'shorter' && styles.activeRouteCard
            ]}
            onPress={() => setSelectedRoute('shorter')}
          >
            <View style={styles.routeHeader}>
              <View style={styles.badgeFastest}>
                <Text style={styles.badgeText}>FASTEST</Text>
              </View>
              <View style={[styles.scoreBadge, { backgroundColor: '#FEF3C7' }]}>
                <Text style={[styles.scoreText, { color: '#D97706' }]}>64</Text>
              </View>
            </View>

            <Text style={styles.routeTitle}>Direct Route</Text>
            <Text style={styles.routeMetrics}>12 mins • 3.1 km</Text>
            
            <View style={styles.featuresList}>
              <View style={styles.featureItem}>
                <Feather name="alert-triangle" size={12} color="#D97706" />
                <Text style={styles.featureText}>Dim lighting reported</Text>
              </View>
              <View style={styles.featureItem}>
                <Feather name="slash" size={12} color="#D97706" />
                <Text style={styles.featureText}>Fewer open shops</Text>
              </View>
            </View>
          </TouchableOpacity>
        </ScrollView>

        {/* Start Button */}
        <TouchableOpacity 
          style={styles.startButton}
          activeOpacity={0.9}
          onPress={handleStartJourney}
        >
          <Text style={styles.startButtonText}>Configure Journey Timer</Text>
          <Feather name="chevron-right" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF9FC',
  },
  searchHeader: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 15,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 15,
  },
  inputsWrapper: {
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    padding: 12,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconDotContainer: {
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 48,
    marginRight: 12,
  },
  startDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#6D28D9',
  },
  dashLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#D1D5DB',
    marginVertical: 4,
  },
  endDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#DC2626',
  },
  textInputsContainer: {
    flex: 1,
  },
  singleInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 28,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '600',
    padding: 0,
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 8,
  },
  mapContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  simulatedMap: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    position: 'relative',
    overflow: 'hidden',
  },
  roadLine: {
    position: 'absolute',
    height: 36,
    width: '120%',
    backgroundColor: '#E5E7EB',
    left: '-10%',
  },
  fastestPathLine: {
    position: 'absolute',
    top: '50%',
    left: '25%',
    width: '50%',
    height: 4,
    backgroundColor: '#F59E0B',
    borderRadius: 2,
    borderStyle: 'dashed',
    transform: [{ rotate: '-35deg' }],
  },
  safestPathLine: {
    position: 'absolute',
    top: '55%',
    left: '25%',
    width: '58%',
    height: 6,
    backgroundColor: '#10B981',
    borderRadius: 3,
    transform: [{ rotate: '-10deg' }],
  },
  pin: {
    position: 'absolute',
    zIndex: 10,
  },
  startPinCore: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#6D28D9',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  dangerOverlay: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    borderColor: '#FCA5A5',
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  dangerLabel: {
    color: '#B91C1C',
    fontSize: 10,
    fontWeight: '700',
    marginLeft: 4,
  },
  bottomCardWrapper: {
    position: 'absolute',
    bottom: 90,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 10,
  },
  cardsHeader: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 12,
  },
  routesScroll: {
    gap: 12,
    paddingBottom: 12,
  },
  routeCard: {
    width: width * 0.65,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#F3F4F6',
    borderRadius: 18,
    padding: 16,
  },
  activeRouteCard: {
    borderColor: '#6D28D9',
    backgroundColor: '#F9F7FD',
  },
  routeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  badgeSafest: {
    backgroundColor: '#EDE9FE',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  badgeFastest: {
    backgroundColor: '#FEF3C7',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#6D28D9',
  },
  scoreBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreText: {
    fontSize: 13,
    fontWeight: '800',
  },
  routeTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1F2937',
  },
  routeMetrics: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
    fontWeight: '500',
  },
  featuresList: {
    marginTop: 10,
    gap: 6,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureText: {
    fontSize: 11,
    color: '#4B5563',
    fontWeight: '600',
    marginLeft: 6,
  },
  startButton: {
    flexDirection: 'row',
    backgroundColor: '#6D28D9',
    borderRadius: 16,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    shadowColor: '#6D28D9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  startButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
    marginRight: 6,
  },
});

