import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { DrawerToggleButton } from '@react-navigation/drawer';

const { width, height } = Dimensions.get('window');

export default function HomeScreen() {
  const router = useRouter();
  const [fakeCallVisible, setFakeCallVisible] = useState(false);
  const [isCalling, setIsCalling] = useState(false);
  const [currentAddress, setCurrentAddress] = useState('Fetching real location...');

  React.useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setCurrentAddress('Location permission denied');
          return;
        }

        const location = await Location.getCurrentPositionAsync({});
        const geocode = await Location.reverseGeocodeAsync({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });

        if (geocode && geocode.length > 0) {
          const place = geocode[0];
          const formattedAddress = [place.name, place.street, place.city, place.region]
            .filter(Boolean)
            .join(', ');
          setCurrentAddress(formattedAddress || 'Location found');
        } else {
          setCurrentAddress('Unknown Location');
        }
      } catch (error) {
        setCurrentAddress('Unable to fetch location');
      }
    })();
  }, []);

  const startFakeCall = () => {
    setFakeCallVisible(true);
    setIsCalling(true);
  };

  const endFakeCall = () => {
    setFakeCallVisible(false);
    setIsCalling(false);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="dark" />
      
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Header */}
        <View style={styles.header}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <DrawerToggleButton tintColor="#1F2937" />
            <View>
              <Text style={styles.headerGreeting}>Hello, Ananya (Voice Active)</Text>
              <Text style={styles.headerSub}>You are in a monitored safe area</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.notificationBtn}>
            <Feather name="bell" size={20} color="#1F2937" />
            <View style={styles.badge} />
          </TouchableOpacity>
        </View>

        {/* Map Card Section */}
        <View style={styles.mapCard}>
          {/* Simulated Map Grid Visuals */}
          <View style={styles.simulatedMap}>
            {/* Grid lines */}
            <View style={[styles.mapGridLine, { top: '30%', left: 0, right: 0 }]} />
            <View style={[styles.mapGridLine, { top: '65%', left: 0, right: 0 }]} />
            <View style={[styles.mapGridLine, { left: '35%', top: 0, bottom: 0 }]} />
            <View style={[styles.mapGridLine, { left: '70%', top: 0, bottom: 0 }]} />
            
            {/* Green safe zone overlay */}
            <View style={styles.mapSafeOverlay} />
            
            {/* User Pin */}
            <View style={styles.userPinContainer}>
              <View style={styles.userPinRipple} />
              <View style={styles.userPin}>
                <Feather name="user" size={12} color="#FFFFFF" />
              </View>
            </View>

            {/* Nearby safe havens indicators */}
            <View style={[styles.havenMarker, { top: '25%', left: '20%' }]}>
              <MaterialCommunityIcons name="shield-check" size={16} color="#16A34A" />
            </View>
            <View style={[styles.havenMarker, { top: '55%', left: '75%' }]}>
              <MaterialCommunityIcons name="shield-check" size={16} color="#16A34A" />
            </View>
          </View>

          {/* Safety Score Floating Badge */}
          <TouchableOpacity 
            style={styles.safetyScoreBadge}
            activeOpacity={0.9}
            onPress={() => router.push('/safety-analysis')}
          >
            <View style={styles.safetyScoreCircle}>
              <Text style={styles.safetyScoreValue}>87</Text>
            </View>
            <View style={styles.safetyScoreTextContainer}>
              <Text style={styles.safetyScoreTitle}>Safety Score</Text>
              <Text style={styles.safetyScoreDesc}>Safe Zone</Text>
            </View>
          </TouchableOpacity>

          {/* Map Info Bar */}
          <View style={styles.mapInfoBar}>
            <Feather name="map-pin" size={16} color="#6D28D9" />
            <Text style={styles.mapAddress}>{currentAddress}</Text>
          </View>
        </View>

        {/* Quick Access Actions Header */}
        <Text style={styles.sectionTitle}>Quick Assistance</Text>

        {/* Horizontal scroll of quick services */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.quickServicesScroll}
        >
          {/* Tile 1: Fake Call */}
          <TouchableOpacity style={styles.serviceTile} onPress={startFakeCall}>
            <View style={[styles.tileIconWrapper, { backgroundColor: '#F3E8FF' }]}>
              <Feather name="phone-call" size={20} color="#6D28D9" />
            </View>
            <Text style={styles.tileTitle}>Fake Call</Text>
            <Text style={styles.tileDesc}>Exit situations</Text>
          </TouchableOpacity>

          {/* Tile 2: Nearby Police */}
          <TouchableOpacity style={styles.serviceTile}>
            <View style={[styles.tileIconWrapper, { backgroundColor: '#E0F2FE' }]}>
              <MaterialCommunityIcons name="police-badge-outline" size={22} color="#0284C7" />
            </View>
            <Text style={styles.tileTitle}>Police Station</Text>
            <Text style={styles.tileDesc}>Locate nearby</Text>
          </TouchableOpacity>

          {/* Tile 3: Medical Help */}
          <TouchableOpacity style={styles.serviceTile}>
            <View style={[styles.tileIconWrapper, { backgroundColor: '#FEE2E2' }]}>
              <MaterialCommunityIcons name="hospital-marker" size={22} color="#EF4444" />
            </View>
            <Text style={styles.tileTitle}>Hospitals</Text>
            <Text style={styles.tileDesc}>Emergency care</Text>
          </TouchableOpacity>

          {/* Tile 4: Safe Havens */}
          <TouchableOpacity style={styles.serviceTile}>
            <View style={[styles.tileIconWrapper, { backgroundColor: '#DEF7EC' }]}>
              <Feather name="shield" size={20} color="#0E9F6E" />
            </View>
            <Text style={styles.tileTitle}>Safe Havens</Text>
            <Text style={styles.tileDesc}>Verified shops</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Trusted Contacts Section */}
        <View style={styles.contactsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Trusted Guardians</Text>
            <TouchableOpacity onPress={() => router.push('/(drawer)/(tabs)/profile')}>
              <Text style={styles.seeAllText}>Manage</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.contactsRow}>
            {/* Contact 1 */}
            <View style={styles.contactItem}>
              <View style={[styles.avatar, { backgroundColor: '#FCA5A5' }]}>
                <Text style={styles.avatarText}>RB</Text>
                <View style={styles.onlineBadge} />
              </View>
              <Text style={styles.contactName}>Rajesh (Dad)</Text>
            </View>

            {/* Contact 2 */}
            <View style={styles.contactItem}>
              <View style={[styles.avatar, { backgroundColor: '#93C5FD' }]}>
                <Text style={styles.avatarText}>AN</Text>
                <View style={styles.onlineBadge} />
              </View>
              <Text style={styles.contactName}>Anjali</Text>
            </View>

            {/* Add Contact Button */}
            <TouchableOpacity 
              style={styles.addContactItem}
              onPress={() => router.push('/(drawer)/(tabs)/profile')}
            >
              <View style={styles.addAvatar}>
                <Feather name="plus" size={20} color="#9CA3AF" />
              </View>
              <Text style={styles.addContactName}>Add Guardian</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Start Journey Card */}
        <TouchableOpacity 
          style={styles.journeyCard}
          activeOpacity={0.9}
          onPress={() => router.push('/live-tracking')}
        >
          <View style={styles.journeyTextContent}>
            <Text style={styles.journeyTitle}>Planning a travel?</Text>
            <Text style={styles.journeyDesc}>
              Setup Journey Timer & notify your guardians on ETA.
            </Text>
          </View>
          <View style={styles.journeyBtn}>
            <Feather name="arrow-right" size={20} color="#FFFFFF" />
          </View>
        </TouchableOpacity>

      </ScrollView>

      {/* Floating Action Button (FAB) for Gemini AI Assistant */}
      <TouchableOpacity 
        style={styles.assistantFab}
        activeOpacity={0.9}
        onPress={() => router.push('/assistant')}
      >
        <MaterialCommunityIcons name="robot" size={26} color="#FFFFFF" />
        <Text style={styles.assistantFabText}>Ask AI</Text>
      </TouchableOpacity>

      {/* Fake Incoming Call Modal Screen */}
      <Modal
        visible={fakeCallVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={endFakeCall}
      >
        <SafeAreaView style={styles.callScreen}>
          <StatusBar style="light" />
          <View style={styles.callHeader}>
            <Feather name="shield" size={24} color="#A78BFA" />
            <Text style={styles.callSecureText}>SafeSphere Secure Call</Text>
          </View>

          <View style={styles.callerInfoContainer}>
            <View style={styles.callerAvatar}>
              <Feather name="user" size={60} color="#D1D5DB" />
            </View>
            <Text style={styles.callerName}>Mom</Text>
            <Text style={styles.callStatus}>
              {isCalling ? 'Incoming Call...' : '0:03'}
            </Text>
          </View>

          {isCalling ? (
            /* Incoming Actions */
            <View style={styles.callActionsContainer}>
              <TouchableOpacity 
                style={[styles.callBtn, styles.declineBtn]}
                onPress={endFakeCall}
              >
                <Feather name="phone-off" size={28} color="#FFFFFF" />
                <Text style={styles.callBtnText}>Decline</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.callBtn, styles.acceptBtn]}
                onPress={() => setIsCalling(false)}
              >
                <Feather name="phone" size={28} color="#FFFFFF" />
                <Text style={styles.callBtnText}>Accept</Text>
              </TouchableOpacity>
            </View>
          ) : (
            /* Active Call actions */
            <View style={styles.activeCallGrid}>
              <View style={styles.activeCallRow}>
                <TouchableOpacity style={styles.circleCallAction}>
                  <Feather name="mic-off" size={20} color="#FFFFFF" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.circleCallAction}>
                  <Feather name="grid" size={20} color="#FFFFFF" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.circleCallAction}>
                  <Feather name="volume-2" size={20} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
              
              <TouchableOpacity 
                style={[styles.callBtn, styles.declineBtn, { alignSelf: 'center', marginTop: 40 }]}
                onPress={endFakeCall}
              >
                <Feather name="phone-off" size={28} color="#FFFFFF" />
                <Text style={styles.callBtnText}>End Call</Text>
              </TouchableOpacity>
            </View>
          )}
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF9FC',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 110,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerGreeting: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1F2937',
  },
  headerSub: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  notificationBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  badge: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#DC2626',
  },
  mapCard: {
    height: height * 0.32,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 16,
    elevation: 3,
    marginBottom: 20,
  },
  simulatedMap: {
    flex: 1,
    backgroundColor: '#E8F5E9',
    position: 'relative',
  },
  mapGridLine: {
    position: 'absolute',
    backgroundColor: '#C8E6C9',
    height: 1,
    width: '100%',
  },
  mapSafeOverlay: {
    position: 'absolute',
    top: '15%',
    left: '10%',
    width: '80%',
    height: '70%',
    borderRadius: 100,
    backgroundColor: 'rgba(76, 175, 80, 0.08)',
    borderWidth: 2,
    borderColor: 'rgba(76, 175, 80, 0.15)',
    borderStyle: 'dashed',
  },
  userPinContainer: {
    position: 'absolute',
    top: '45%',
    left: '48%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userPinRipple: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(109, 40, 217, 0.2)',
  },
  userPin: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#6D28D9',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  havenMarker: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
    padding: 6,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  safetyScoreBadge: {
    position: 'absolute',
    top: 15,
    left: 15,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  safetyScoreCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#16A34A', // safety.safe (green)
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  safetyScoreValue: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },
  safetyScoreTextContainer: {
    justifyContent: 'center',
  },
  safetyScoreTitle: {
    fontSize: 10,
    color: '#9CA3AF',
    fontWeight: '600',
  },
  safetyScoreDesc: {
    fontSize: 12,
    fontWeight: '800',
    color: '#16A34A',
  },
  mapInfoBar: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    backgroundColor: '#FFFFFF',
  },
  mapAddress: {
    fontSize: 13,
    color: '#4B5563',
    fontWeight: '500',
    marginLeft: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 12,
  },
  quickServicesScroll: {
    paddingBottom: 20,
    gap: 12,
  },
  serviceTile: {
    width: width * 0.32,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 1,
  },
  tileIconWrapper: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  tileTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1F2937',
  },
  tileDesc: {
    fontSize: 10,
    color: '#9CA3AF',
    marginTop: 2,
  },
  contactsSection: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  seeAllText: {
    fontSize: 13,
    color: '#6D28D9',
    fontWeight: '700',
  },
  contactsRow: {
    flexDirection: 'row',
    gap: 16,
  },
  contactItem: {
    alignItems: 'center',
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  avatarText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
  onlineBadge: {
    position: 'absolute',
    bottom: 0,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  contactName: {
    fontSize: 11,
    color: '#4B5563',
    fontWeight: '600',
    marginTop: 6,
  },
  addContactItem: {
    alignItems: 'center',
  },
  addAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addContactName: {
    fontSize: 11,
    color: '#9CA3AF',
    fontWeight: '600',
    marginTop: 6,
  },
  journeyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#6D28D9', // primary.600
    borderRadius: 20,
    padding: 18,
    marginBottom: 20,
    shadowColor: '#6D28D9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 3,
  },
  journeyTextContent: {
    flex: 1,
    marginRight: 10,
  },
  journeyTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  journeyDesc: {
    color: '#E9D5FF',
    fontSize: 11,
    marginTop: 4,
    lineHeight: 16,
  },
  journeyBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  assistantFab: {
    position: 'absolute',
    bottom: 110,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6D28D9',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 28,
    shadowColor: '#6D28D9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  assistantFabText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
    marginLeft: 8,
  },
  /* Call Screen Mock styling */
  callScreen: {
    flex: 1,
    backgroundColor: '#111827',
    justifyContent: 'space-between',
    padding: 20,
  },
  callHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  callSecureText: {
    color: '#A78BFA',
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 6,
  },
  callerInfoContainer: {
    alignItems: 'center',
    marginTop: height * 0.1,
  },
  callerAvatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#374151',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  callerName: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '700',
  },
  callStatus: {
    color: '#9CA3AF',
    fontSize: 16,
    marginTop: 10,
  },
  callActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: height * 0.1,
  },
  callBtn: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 76,
    height: 76,
    borderRadius: 38,
  },
  declineBtn: {
    backgroundColor: '#DC2626',
  },
  acceptBtn: {
    backgroundColor: '#16A34A',
  },
  callBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 8,
    position: 'absolute',
    bottom: -22,
    width: 100,
    textAlign: 'center',
  },
  activeCallGrid: {
    width: '100%',
    marginBottom: height * 0.08,
  },
  activeCallRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  circleCallAction: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

