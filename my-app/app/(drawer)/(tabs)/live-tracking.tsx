import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Dimensions,
  Image,
  Platform
} from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Feather, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { LiveMap } from '../../../features/location/components/LiveMap';

const { width } = Dimensions.get('window');

export default function LiveTrackingScreen() {
  const router = useRouter();

  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let locationSubscription: Location.LocationSubscription | null = null;

    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      locationSubscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 5000,
          distanceInterval: 5,
        },
        (loc) => {
          setLocation(loc);
        }
      );
    })();

    return () => {
      if (locationSubscription) {
        locationSubscription.remove();
      }
    };
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => router.back()}>
          <Feather name="arrow-left" size={24} color="#1F2937" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Live Tracking</Text>
          <View style={styles.headerSubtitleRow}>
            <MaterialCommunityIcons name="shield-check" size={14} color="#10B981" />
            <Text style={styles.headerSubtitle}>You are being protected</Text>
          </View>
        </View>
        <View style={[styles.iconBtn, { opacity: 0 }]}>
          <Feather name="more-horizontal" size={24} color="#1F2937" />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Sharing Location Banner */}
        <View style={styles.bannerContainer}>
          <View style={styles.bannerIconBox}>
            <Feather name="check" size={18} color="#FFFFFF" />
          </View>
          <View style={styles.bannerTextContainer}>
            <Text style={styles.bannerTitle}>Sharing your live location</Text>
            <Text style={styles.bannerDesc}>Your trusted contacts can see your location in real time.</Text>
          </View>
          <TouchableOpacity style={styles.stopBtn}>
            <Text style={styles.stopBtnText}>Stop Sharing</Text>
          </TouchableOpacity>
        </View>

        {/* Map Section */}
        <View style={styles.mapCard}>
          <LiveMap location={location} errorMsg={errorMsg} />
        </View>

        {/* Live Status Row */}
        <View style={styles.statsCard}>
          <View style={styles.statsHeaderRow}>
            <Text style={styles.statsCardTitle}>Live Status</Text>
            <View style={styles.activeStatusRow}>
              <View style={styles.activeDot} />
              <Text style={styles.activeStatusText}>Active</Text>
            </View>
          </View>
          
          <View style={styles.statsGrid}>
            <View style={styles.statColumn}>
              <View style={[styles.statIconBox, { backgroundColor: '#F3E8FF' }]}>
                <Feather name="clock" size={18} color="#8B5CF6" />
              </View>
              <Text style={styles.statLabel}>Session Duration</Text>
              <Text style={[styles.statValue, { color: '#8B5CF6' }]}>00:35:42</Text>
            </View>
            
            <View style={styles.statDivider} />
            
            <View style={styles.statColumn}>
              <View style={[styles.statIconBox, { backgroundColor: '#E0F2FE' }]}>
                <Feather name="map-pin" size={18} color="#0EA5E9" />
              </View>
              <Text style={styles.statLabel}>Distance Traveled</Text>
              <Text style={[styles.statValue, { color: '#0EA5E9' }]}>2.8 km</Text>
            </View>
            
            <View style={styles.statDivider} />
            
            <View style={styles.statColumn}>
              <View style={[styles.statIconBox, { backgroundColor: '#DCFCE7' }]}>
                <MaterialCommunityIcons name="shield-check-outline" size={20} color="#10B981" />
              </View>
              <Text style={styles.statLabel}>Safety Score</Text>
              <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                <Text style={[styles.statValue, { color: '#10B981' }]}>72</Text>
                <Text style={styles.statValueSmall}> /100</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Trusted Contacts Live View */}
        <View style={styles.contactsCard}>
          <View style={styles.contactsHeaderRow}>
            <Text style={styles.contactsCardTitle}>Trusted Contacts Live View</Text>
            <Text style={styles.contactsActiveText}>3 Active</Text>
          </View>

          {/* Contact 1 */}
          <View style={styles.contactRow}>
            <View style={styles.contactAvatar}>
              <Image source={{ uri: 'https://i.pravatar.cc/100?img=5' }} style={styles.avatarImg} />
            </View>
            <View style={styles.contactInfo}>
              <View style={styles.contactNameRow}>
                <Text style={styles.contactName}>Ananya Sharma</Text>
                <View style={styles.primaryTag}>
                  <Text style={styles.primaryTagText}>Primary</Text>
                </View>
              </View>
              <Text style={[styles.contactTime, { color: '#10B981' }]}>Last updated: Just now</Text>
            </View>
            <View style={styles.contactStatusRow}>
              <Feather name="eye" size={14} color="#10B981" />
              <Text style={styles.contactStatusText}>Watching</Text>
              <Feather name="chevron-right" size={16} color="#9CA3AF" style={{ marginLeft: 8 }} />
            </View>
          </View>

          <View style={styles.listDivider} />

          {/* Contact 2 */}
          <View style={styles.contactRow}>
            <View style={styles.contactAvatar}>
              <Image source={{ uri: 'https://i.pravatar.cc/100?img=11' }} style={styles.avatarImg} />
            </View>
            <View style={styles.contactInfo}>
              <Text style={styles.contactName}>Rahul Sharma</Text>
              <Text style={styles.contactTime}>Last updated: 10 sec ago</Text>
            </View>
            <View style={styles.contactStatusRow}>
              <Feather name="eye" size={14} color="#10B981" />
              <Text style={styles.contactStatusText}>Watching</Text>
              <Feather name="chevron-right" size={16} color="#9CA3AF" style={{ marginLeft: 8 }} />
            </View>
          </View>

          <View style={styles.listDivider} />

          {/* Contact 3 */}
          <View style={styles.contactRow}>
            <View style={styles.contactAvatar}>
              <Image source={{ uri: 'https://i.pravatar.cc/100?img=9' }} style={styles.avatarImg} />
            </View>
            <View style={styles.contactInfo}>
              <Text style={styles.contactName}>Meera Iyer</Text>
              <Text style={styles.contactTime}>Last updated: 15 sec ago</Text>
            </View>
            <View style={styles.contactStatusRow}>
              <Feather name="eye" size={14} color="#10B981" />
              <Text style={styles.contactStatusText}>Watching</Text>
              <Feather name="chevron-right" size={16} color="#9CA3AF" style={{ marginLeft: 8 }} />
            </View>
          </View>

          <View style={styles.listDivider} />
          
          <TouchableOpacity style={styles.viewAllBtn}>
            <Text style={styles.viewAllBtnText}>View All Contacts</Text>
            <Feather name="chevron-right" size={16} color="#6D28D9" />
          </TouchableOpacity>
        </View>

        {/* Privacy Card */}
        <View style={styles.privacyCard}>
          <View style={styles.privacyIconBox}>
            <Feather name="lock" size={24} color="#8B5CF6" />
          </View>
          <View style={styles.privacyContent}>
            <Text style={styles.privacyTitle}>Your Privacy is Protected</Text>
            <Text style={styles.privacyDesc}>
              Your location is end-to-end encrypted and only visible to your trusted contacts.
            </Text>
          </View>
          <TouchableOpacity>
            <Text style={styles.learnMoreText}>Learn More</Text>
          </TouchableOpacity>
        </View>

        {/* Extra spacing for bottom elevated tab */}
        <View style={{ height: 100 }} />

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF9FC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FAF9FC',
  },
  iconBtn: {
    padding: 8,
  },
  headerTitleContainer: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1F2937',
  },
  headerSubtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    gap: 4,
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '600',
  },
  scrollContent: {
    padding: 16,
  },
  bannerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#DCFCE7',
    borderRadius: 16,
    padding: 12,
    marginBottom: 20,
  },
  bannerIconBox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  bannerTextContainer: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1F2937',
  },
  bannerDesc: {
    fontSize: 11,
    color: '#4B5563',
    marginTop: 2,
    lineHeight: 14,
  },
  stopBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FEE2E2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginLeft: 8,
  },
  stopBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#EF4444',
  },
  mapCard: {
    height: 280,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  simulatedMap: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    position: 'relative',
  },
  mapGridLine: {
    position: 'absolute',
    backgroundColor: '#F1F5F9',
    height: 1,
    width: '100%',
  },
  streetLine1: {
    position: 'absolute',
    top: '30%',
    left: '-10%',
    width: '120%',
    height: 12,
    backgroundColor: '#FFFFFF',
    transform: [{ rotate: '-15deg' }],
  },
  streetLine2: {
    position: 'absolute',
    top: '-10%',
    left: '40%',
    width: 12,
    height: '120%',
    backgroundColor: '#FFFFFF',
    transform: [{ rotate: '20deg' }],
  },
  mapLabel: {
    position: 'absolute',
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  poiMarker: {
    position: 'absolute',
    top: '20%',
    left: '40%',
    flexDirection: 'row',
    alignItems: 'center',
  },
  poiIconBox: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 4,
  },
  poiLabel: {
    fontSize: 11,
    color: '#3B82F6',
    fontWeight: '600',
  },
  userLocationMarker: {
    position: 'absolute',
    top: '45%',
    left: '45%',
    alignItems: 'center',
    justifyContent: 'center',
    width: 100,
    height: 100,
  },
  userLocationTooltip: {
    position: 'absolute',
    top: -30,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    zIndex: 10,
  },
  userLocationTooltipText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1F2937',
  },
  userLocationTooltipArrow: {
    position: 'absolute',
    bottom: -4,
    alignSelf: 'center',
    width: 8,
    height: 8,
    backgroundColor: '#FFFFFF',
    transform: [{ rotate: '45deg' }],
  },
  userPinCenter: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#3B82F6',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    zIndex: 2,
  },
  userPinRipple1: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
  },
  userPinRipple2: {
    position: 'absolute',
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
  },
  userPinRipple3: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(59, 130, 246, 0.05)',
  },
  mapControls: {
    position: 'absolute',
    right: 12,
    top: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  mapControlBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapControlDivider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    width: '100%',
  },
  statsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    marginBottom: 20,
  },
  statsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statsCardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1F2937',
  },
  activeStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
    marginRight: 6,
  },
  activeStatusText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#10B981',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statColumn: {
    flex: 1,
    alignItems: 'center',
  },
  statIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 10,
    color: '#6B7280',
    marginBottom: 4,
    fontWeight: '500',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '800',
  },
  statValueSmall: {
    fontSize: 11,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#F3F4F6',
  },
  contactsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    paddingBottom: 10,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    marginBottom: 20,
  },
  contactsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  contactsCardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1F2937',
  },
  contactsActiveText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6D28D9',
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  contactAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
    backgroundColor: '#E5E7EB',
    marginRight: 12,
  },
  avatarImg: {
    width: '100%',
    height: '100%',
  },
  contactInfo: {
    flex: 1,
  },
  contactNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contactName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2937',
  },
  primaryTag: {
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 8,
  },
  primaryTagText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#F59E0B',
  },
  contactTime: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 4,
  },
  contactStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contactStatusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10B981',
    marginLeft: 4,
  },
  listDivider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 12,
  },
  viewAllBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
  },
  viewAllBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6D28D9',
    marginRight: 4,
  },
  privacyCard: {
    flexDirection: 'row',
    backgroundColor: '#FAF5FF',
    borderWidth: 1,
    borderColor: '#F3E8FF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  privacyIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F3E8FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  privacyContent: {
    flex: 1,
    paddingRight: 8,
  },
  privacyTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1F2937',
  },
  privacyDesc: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
    lineHeight: 16,
  },
  learnMoreText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6D28D9',
  },
});
