import React, { useState, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert, SafeAreaView } from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft, History, Navigation as NavIcon, Shield } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import * as Haptics from 'expo-haptics';

import { useLiveLocation } from '../hooks/useLiveLocation';
import { LocationInputCard } from '../components/LocationInputCard';
import { SafeRouteMap, MapHandle } from '../components/SafeRouteMap';
import { RouteCard } from '../components/RouteCard';
import { RouteSafetySummary } from '../components/RouteSafetySummary';
import { DestinationLocation, RouteOption, RouteSafetyData, NavigationStatus, LocationCoordinates } from '../types/location.types';

export const SafeRouteScreen = () => {
  const { permission, location, address, isDetecting, initLocation } = useLiveLocation();
  const [destination, setDestination] = useState<DestinationLocation | null>(null);
  const [routes, setRoutes] = useState<RouteOption[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<RouteOption | null>(null);
  const [navigationStatus, setNavigationStatus] = useState<NavigationStatus>('idle');
  const mapRef = useRef<MapHandle>(null);

  // Helper to generate demo routes
  const generateDemoRoutes = (start: LocationCoordinates, end: LocationCoordinates) => {
    // Generate some slightly curved paths for demo purposes
    const generatePath = (curveOffset: number) => {
      return [
        start,
        { latitude: start.latitude + (end.latitude - start.latitude) * 0.3 + curveOffset, longitude: start.longitude + (end.longitude - start.longitude) * 0.3 },
        { latitude: start.latitude + (end.latitude - start.latitude) * 0.7 - curveOffset, longitude: start.longitude + (end.longitude - start.longitude) * 0.7 },
        end
      ];
    };

    const demoRoutes: RouteOption[] = [
      {
        id: 'recommended',
        title: 'Recommended Route',
        theme: 'green',
        description: 'Safest available demo route',
        duration: '18 min',
        distance: '3.4 km',
        tags: ['Well Lit', 'Low Traffic', 'CCTV Active'],
        coordinates: generatePath(0.002)
      },
      {
        id: 'moderate',
        title: 'Moderate Route',
        theme: 'orange',
        description: 'Moderate-risk demo route',
        duration: '21 min',
        distance: '3.7 km',
        tags: ['Crowded Area', 'Moderate Traffic'],
        coordinates: generatePath(-0.003)
      },
      {
        id: 'shorter',
        title: 'Shorter Route',
        theme: 'red',
        description: 'Shorter high-risk demo route',
        duration: '16 min',
        distance: '2.8 km',
        tags: ['Poor Lighting', 'High Risk Area'],
        coordinates: generatePath(0)
      }
    ];

    setRoutes(demoRoutes);
    setSelectedRoute(demoRoutes[0]);
  };

  const handleLongPressMap = async (e: any) => {
    const coords = e.nativeEvent.coordinate;
    try {
      const geocoded = await Location.reverseGeocodeAsync({
        latitude: coords.latitude,
        longitude: coords.longitude
      });
      
      let destAddress = `${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}`;
      if (geocoded.length > 0) {
        const place = geocoded[0];
        destAddress = [place.name || place.street, place.city || place.subregion].filter(Boolean).join(', ');
      }
      
      setDestination({
        latitude: coords.latitude,
        longitude: coords.longitude,
        address: destAddress
      });

      if (location) {
        generateDemoRoutes(location, coords);
      }
      
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (err) {
      console.warn("Failed to reverse geocode destination", err);
    }
  };

  const handleRouteSelect = (route: RouteOption) => {
    setSelectedRoute(route);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const getSafetyData = (): RouteSafetyData => {
    if (!selectedRoute) return { score: 0, wellLit: 0, cctv: 0, crowd: 'Low' };
    
    switch (selectedRoute.id) {
      case 'recommended':
        return { score: 85, wellLit: 78, cctv: 92, crowd: 'Low' };
      case 'moderate':
        return { score: 65, wellLit: 45, cctv: 50, crowd: 'Moderate' };
      case 'shorter':
        return { score: 40, wellLit: 20, cctv: 30, crowd: 'High' };
      default:
        return { score: 0, wellLit: 0, cctv: 0, crowd: 'Low' };
    }
  };

  const handleStartNavigation = () => {
    if (permission !== 'granted') {
      Alert.alert("Permission Denied", "Location permission is required.");
      return;
    }
    if (!location) {
      Alert.alert("Location Not Ready", "Still detecting your location.");
      return;
    }
    if (!destination) {
      Alert.alert("Destination Required", "Long press on the map to select a destination first.");
      return;
    }
    if (!selectedRoute) {
      Alert.alert("Route Required", "Please select a route.");
      return;
    }
    
    setNavigationStatus('active');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleHistory = () => {
    Alert.alert("Coming Soon", "Route history will be available soon.");
  };

  if (permission === 'denied') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Location Access Required</Text>
          <Text style={styles.errorMessage}>Allow location access to view your current position and use Safe Route.</Text>
          <Pressable style={styles.retryButton} onPress={initLocation}>
            <Text style={styles.retryText}>Try Again</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} bounces={false}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={24} color="#10153A" />
          </Pressable>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Safe Route</Text>
            <Text style={styles.headerSubtitle}>Find the safest route to your destination</Text>
          </View>
          <Pressable style={styles.historyButton} onPress={handleHistory}>
            <History size={20} color="#6D35E8" />
            <Text style={styles.historyText}>History</Text>
          </Pressable>
        </View>

        {/* Input Card */}
        <View style={styles.inputCardWrapper}>
          <LocationInputCard 
            currentAddress={address} 
            destinationAddress={destination?.address || null}
            isDetecting={isDetecting}
          />
        </View>

        {/* Map */}
        <View style={{ height: 350, width: '100%', marginTop: -40, zIndex: -1 }}>
          <SafeRouteMap 
            ref={mapRef}
            currentLocation={location}
            destination={destination}
            routes={routes}
            selectedRoute={selectedRoute}
            onLongPressMap={handleLongPressMap}
          />
        </View>

        {/* Bottom Content Area */}
        <View style={styles.bottomContent}>
          {destination && routes.length > 0 && (
            <>
              <View style={styles.sectionHeader}>
                <Shield size={24} color="#12B76A" />
                <View style={styles.sectionTitleContainer}>
                  <Text style={styles.sectionTitle}>Recommended Routes</Text>
                  <Text style={styles.sectionSubtitle}>Routes are ranked based on demo safety analysis</Text>
                </View>
              </View>

              <View style={styles.routesList}>
                {routes.map((route) => (
                  <RouteCard 
                    key={route.id}
                    route={route}
                    isSelected={selectedRoute?.id === route.id}
                    onSelect={handleRouteSelect}
                  />
                ))}
              </View>

              {selectedRoute && (
                <RouteSafetySummary safetyData={getSafetyData()} />
              )}
            </>
          )}

          {/* Navigation Button */}
          <Pressable 
            onPress={handleStartNavigation}
            accessibilityRole="button"
            accessibilityLabel={navigationStatus === 'active' ? "Navigation Active" : "Start Navigation"}
          >
            <LinearGradient
              colors={['#8B5CF6', '#6D35E8']}
              style={styles.navButton}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <NavIcon size={24} color="#FFFFFF" style={{ marginRight: 8 }} />
              <View>
                <Text style={styles.navButtonTitle}>
                  {navigationStatus === 'active' ? 'Navigation Active' : 'Start Navigation'}
                </Text>
                <Text style={styles.navButtonSubtitle}>Navigate safely with real-time updates</Text>
              </View>
            </LinearGradient>
          </Pressable>
          <View style={{height: 40}} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FC',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    zIndex: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#10153A',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#596080',
    marginTop: 2,
  },
  historyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    width: 80,
  },
  historyText: {
    color: '#6D35E8',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  inputCardWrapper: {
    zIndex: 10,
    backgroundColor: 'transparent',
  },
  bottomContent: {
    padding: 20,
    backgroundColor: '#F8F9FC',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitleContainer: {
    marginLeft: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#10153A',
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#596080',
  },
  routesList: {
    marginBottom: 12,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    shadowColor: '#6D35E8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  navButtonTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  navButtonSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 2,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#10153A',
    marginBottom: 10,
  },
  errorMessage: {
    fontSize: 14,
    color: '#596080',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#6D35E8',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  }
});
