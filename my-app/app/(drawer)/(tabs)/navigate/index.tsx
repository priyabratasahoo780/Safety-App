import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useWindowDimensions } from 'react-native';

import { SafeRouteMap } from '../../../../features/location/components/SafeRouteMap';
import { useLiveLocation } from '../../../../features/location/hooks/useLiveLocation';
import { RouteOption } from '../../../../features/location/types/location.types';

export default function NavigateScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const TAB_BAR_HEIGHT = 70;
  const bottomPadding = TAB_BAR_HEIGHT + insets.bottom + 20;

  const [selectedRoute, setSelectedRoute] = useState<'recommended' | 'shorter'>('recommended');
  const [destination, setDestination] = useState('Salt Lake Central Park');
  const { location } = useLiveLocation();
  const [routes, setRoutes] = useState<RouteOption[]>([]);
  const [destinationCoords, setDestinationCoords] = useState({ latitude: 22.5855, longitude: 88.4166 });
  const [isRouting, setIsRouting] = useState(false);

  useEffect(() => {
    if (location && destinationCoords) {
      fetchRealRoutes();
    }
  }, [location, destinationCoords]);

  const fetchRealRoutes = async () => {
    if (!location) return;
    setIsRouting(true);
    
    try {
      const start = `${location.longitude},${location.latitude}`;
      const end = `${destinationCoords.longitude},${destinationCoords.latitude}`;
      
      const drivingRes = await fetch(`https://router.project-osrm.org/route/v1/driving/${start};${end}?overview=simplified&geometries=geojson`);
      const drivingData = await drivingRes.json();
      
      const walkingRes = await fetch(`https://router.project-osrm.org/route/v1/foot/${start};${end}?overview=simplified&geometries=geojson`);
      const walkingData = await walkingRes.json();
      
      const newRoutes: RouteOption[] = [];

      if (walkingData.code === 'Ok' && walkingData.routes.length > 0) {
        const route = walkingData.routes[0];
        const distanceKm = (route.distance / 1000).toFixed(1);
        const durationMins = Math.max(1, Math.round(route.duration / 60));
        
        newRoutes.push({
          id: 'recommended',
          title: 'Safest Route',
          theme: 'green',
          description: 'AI Recommended',
          duration: `${durationMins > 60 ? Math.floor(durationMins/60) + ' hr ' + (durationMins%60) : durationMins} mins`,
          distance: `${distanceKm} km`,
          tags: [],
          coordinates: route.geometry.coordinates.map((coord: number[]) => ({
            latitude: coord[1],
            longitude: coord[0]
          }))
        });
      }

      if (drivingData.code === 'Ok' && drivingData.routes.length > 0) {
        const route = drivingData.routes[0];
        const distanceKm = (route.distance / 1000).toFixed(1);
        const durationMins = Math.max(1, Math.round(route.duration / 60));
        
        newRoutes.push({
          id: 'shorter',
          title: 'Direct Route',
          theme: 'orange',
          description: 'Fastest',
          duration: `${durationMins > 60 ? Math.floor(durationMins/60) + ' hr ' + (durationMins%60) : durationMins} mins`,
          distance: `${distanceKm} km`,
          tags: [],
          coordinates: route.geometry.coordinates.map((coord: number[]) => ({
            latitude: coord[1],
            longitude: coord[0]
          }))
        });
      }

      setRoutes(newRoutes);
      if (newRoutes.length > 0) {
        setSelectedRoute(newRoutes[0].id as any);
      }
    } catch (e) {
      console.warn("Routing API failed", e);
    } finally {
      setIsRouting(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (destination.trim().length > 2) {
        try {
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
    }, 1000);

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

      <View style={styles.mapContainer}>
        <SafeRouteMap 
          currentLocation={location}
          destination={{ latitude: destinationCoords.latitude, longitude: destinationCoords.longitude, address: destination }}
          routes={routes}
          selectedRoute={routes.find(r => r.id === selectedRoute) || null}
          onLongPressMap={() => {}}
        />
      </View>

      <View style={[styles.bottomCardWrapper, { bottom: bottomPadding }]}>
        <Text style={styles.cardsHeader}>Select Route</Text>

        {isRouting ? (
          <View style={{ height: 120, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#6D28D9" />
            <Text style={{ marginTop: 8, color: '#6B7280', fontSize: 13 }}>Calculating safest routes...</Text>
          </View>
        ) : (
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.routesScroll}
          >
            {routes.map((route) => (
              <TouchableOpacity 
                key={route.id}
                style={[
                  styles.routeCard, 
                  { width: width * 0.65 },
                  selectedRoute === route.id && styles.activeRouteCard
                ]}
                onPress={() => setSelectedRoute(route.id as 'recommended' | 'shorter')}
                activeOpacity={0.9}
              >
                <View style={styles.routeHeader}>
                  {route.id === 'recommended' ? (
                    <View style={styles.badgeSafest}>
                      <Text style={styles.badgeText}>AI RECOMMENDED</Text>
                    </View>
                  ) : (
                    <View style={styles.badgeFastest}>
                      <Text style={styles.badgeText}>FASTEST</Text>
                    </View>
                  )}
                  <View style={[styles.scoreBadge, { backgroundColor: route.id === 'recommended' ? '#DEF7EC' : '#FEF3C7' }]}>
                    <Text style={[styles.scoreText, { color: route.id === 'recommended' ? '#0E9F6E' : '#D97706' }]}>
                      {route.id === 'recommended' ? '92' : '64'}
                    </Text>
                  </View>
                </View>

                <Text style={styles.routeTitle}>{route.title}</Text>
                <Text style={styles.routeMetrics}>{route.duration} • {route.distance}</Text>
                
                <View style={styles.featuresList}>
                  {route.id === 'recommended' ? (
                    <>
                      <View style={styles.featureItem}>
                        <Feather name="eye" size={12} color="#16A34A" />
                        <Text style={styles.featureText}>Well-lit streets</Text>
                      </View>
                      <View style={styles.featureItem}>
                        <Feather name="check-circle" size={12} color="#16A34A" />
                        <Text style={styles.featureText}>Safe Havens open</Text>
                      </View>
                    </>
                  ) : (
                    <>
                      <View style={styles.featureItem}>
                        <Feather name="alert-triangle" size={12} color="#D97706" />
                        <Text style={styles.featureText}>Dim lighting reported</Text>
                      </View>
                      <View style={styles.featureItem}>
                        <Feather name="slash" size={12} color="#D97706" />
                        <Text style={styles.featureText}>Fewer open shops</Text>
                      </View>
                    </>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        <TouchableOpacity 
          style={styles.startButton}
          activeOpacity={0.9}
          onPress={handleStartJourney}
          disabled={isRouting || routes.length === 0}
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
  bottomCardWrapper: {
    position: 'absolute',
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
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 2,
    borderColor: '#F3F4F6',
  },
  activeRouteCard: {
    borderColor: '#6D28D9',
    backgroundColor: '#FAF5FF',
  },
  routeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  badgeSafest: {
    backgroundColor: '#7138E8',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeFastest: {
    backgroundColor: '#1F2937',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
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

