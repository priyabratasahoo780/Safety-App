import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  useWindowDimensions,
  Platform,
  Animated,
  Pressable,
  Alert,
  DeviceEventEmitter,
  Linking,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter, useNavigation } from 'expo-router';
import { DrawerActions } from '@react-navigation/native';
import * as Location from 'expo-location';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import LiveMap from '@/components/LiveMap';
import {
  Bell,
  UserRound,
  ShieldCheck,
  Navigation,
  MapPinned,
  Bot,
  UsersRound,
  Lightbulb,
  ChevronRight,
  Sun,
  Phone,
  CloudSun,
  Battery,
  Wifi,
  HeartPulse,
  MapPin,
  Database,
  PhoneCall,
  MessageSquareShare,
  Menu,
  AlertOctagon,
} from 'lucide-react-native';
import { auth } from '../../../../src/config/firebaseConfig';
import { FirebaseGuardianRepository } from '@/features/guardian/repositories/FirebaseGuardianRepository';


const COLORS = {
  bg: '#EBF0F9', // Matched to the image's cool blue-gray
  textPrimary: '#111638',
  textSecondary: '#69708A',
  purplePrimary: '#6D35E8',
  purpleDark: '#5523C8',
  purpleLight: '#EEE7FF',
  green: '#12B76A',
  greenLight: '#E4F8EE',
  red: '#F04438',
  redDark: '#D92D20',
  redLight: '#FDE8E7',
  orange: '#F79009',
  orangeLight: '#FFF2DC',
  blue: '#2E90FA',
  blueLight: '#E5F2FF',
  pink: '#E835A1',
  pinkLight: '#FDECF6',
  cyan: '#06B6D4',
  cyanLight: '#E0F2FE',
  highlight: '#FFFFFF', // Pure white for perfect highlight
  shadow: 'rgba(163, 177, 198, 0.55)', // Deeper, softer shadow
  insetShadow: 'rgba(163, 177, 198, 0.3)',
};

// ==========================================
// Reusable Neumorphic Components
// ==========================================

const NeumorphicCard = ({ children, style, rounded = 24, padding = 20, isPressed = false }: any) => {
  return (
    <View
      style={[
        neuStyles.outer,
        { borderRadius: rounded, shadowOpacity: isPressed ? 0.3 : 1, elevation: isPressed ? 1 : 4 },
        style,
      ]}
    >
      <View
        style={[
          neuStyles.inner,
          { borderRadius: rounded, padding },
          isPressed && neuStyles.innerPressed,
        ]}
      >
        {children}
      </View>
    </View>
  );
};

const NeumorphicButton = ({ children, style, onPress, rounded = 24, padding = 16 }: any) => {
  const scale = useRef(new Animated.Value(1)).current;
  const [isPressed, setIsPressed] = useState(false);

  const handlePressIn = () => {
    setIsPressed(true);
    Animated.spring(scale, { toValue: 0.97, useNativeDriver: true }).start();
  };

  const handlePressOut = () => {
    setIsPressed(false);
    Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();
  };

  return (
    <Pressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        if (onPress) onPress();
      }}
    >
      <Animated.View style={[{ transform: [{ scale }] }]}>
        <NeumorphicCard rounded={rounded} padding={padding} isPressed={isPressed} style={style}>
          {children}
        </NeumorphicCard>
      </Animated.View>
    </Pressable>
  );
};

const NeumorphicInset = ({ children, style, rounded = 16, padding = 16 }: any) => {
  return (
    <View style={[neuStyles.inset, { borderRadius: rounded, padding }, style]}>
      {children}
    </View>
  );
};

// ==========================================
// Special UI Components
// ==========================================

const PulseDot = ({ color }: { color: string }) => {
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(scale, { toValue: 1.8, duration: 1200, useNativeDriver: true }),
          Animated.timing(scale, { toValue: 1, duration: 1200, useNativeDriver: true })
        ]),
        Animated.sequence([
          Animated.timing(opacity, { toValue: 0.3, duration: 1200, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 1, duration: 1200, useNativeDriver: true })
        ])
      ])
    ).start();
  }, []);

  return (
    <View style={styles.pulseDotContainer}>
      <Animated.View style={[styles.activeDot, { backgroundColor: color, transform: [{ scale }], opacity, position: 'absolute' }]} />
      <View style={[styles.activeDot, { backgroundColor: color }]} />
    </View>
  );
};

const SOSButton = ({ isActive, onActivate }: any) => {
  const scale = useRef(new Animated.Value(1)).current;
  const progress = useRef(new Animated.Value(0)).current;
  const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const warningTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isHeldSuccessfully = useRef(false);

  useEffect(() => {
    if (!isActive) {
      Animated.timing(progress, { toValue: 0, duration: 300, useNativeDriver: false }).start();
    }
  }, [isActive]);

  const startHold = () => {
    if (isActive) return;
    isHeldSuccessfully.current = false;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Animated.parallel([
      Animated.spring(scale, { toValue: 0.92, useNativeDriver: true }),
      Animated.timing(progress, { toValue: 1, duration: 2500, useNativeDriver: false }),
    ]).start();

    warningTimer.current = setTimeout(() => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }, 1500);

    holdTimer.current = setTimeout(() => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      isHeldSuccessfully.current = true;
      onActivate();
    }, 2500);
  };

  const endHold = () => {
    if (isActive) return;
    if (holdTimer.current) clearTimeout(holdTimer.current);
    if (warningTimer.current) clearTimeout(warningTimer.current);
    holdTimer.current = null;
    warningTimer.current = null;

    Animated.parallel([
      Animated.spring(scale, { toValue: 1, useNativeDriver: true }),
      Animated.timing(progress, { toValue: 0, duration: 300, useNativeDriver: false }),
    ]).start();
  };

  const handlePress = () => {
    if (isActive || isHeldSuccessfully.current) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Alert.alert(
      "Hold to Activate",
      "Please press and hold the SOS button for 2.5 seconds to trigger emergency help.",
      [{ text: "OK" }]
    );
  };

  const progressHeight = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <Pressable
      onPressIn={startHold}
      onPressOut={endHold}
      onPress={handlePress}
      style={({ pressed }) => [styles.sosButtonWrapper, pressed && !isActive && { transform: [{ scale: 0.95 }] }]}
    >
      <View style={styles.sosOuterCircle}>
        <View style={styles.sosMiddleCircle}>
          <LinearGradient colors={['#F04438', '#D92D20']} style={styles.sosInnerCircle}>
            <Animated.View style={[styles.sosProgressFill, { height: progressHeight }]} />
            <Text style={styles.sosText}>{isActive ? 'SENT' : 'SOS'}</Text>
          </LinearGradient>
        </View>
      </View>
    </Pressable>
  );
};

// ==========================================
// Main Home Screen
// ==========================================

export default function HomeScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  // Responsive calculations
  const horizontalPadding = 20;
  const columnGap = 16;
  const cardWidth = (width - (horizontalPadding * 2) - columnGap) / 2;

  // Bottom spacing for absolute floating tab bar
  const TAB_BAR_HEIGHT = Platform.OS === 'ios' ? 88 : 68;
  const bottomContentPadding = TAB_BAR_HEIGHT + insets.bottom + 20;

  const [locationStatus, setLocationStatus] = useState('Checking...');
  const [sosActive, setSosActive] = useState(false);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [address, setAddress] = useState<string>('Locating...');

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          setLocationStatus('Access enabled');
          const loc = await Location.getCurrentPositionAsync({});
          setLocation(loc);

          // Reverse geocode
          const geocode = await Location.reverseGeocodeAsync({
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude
          });

          if (geocode && geocode.length > 0) {
            const place = geocode[0];
            const street = place.street || place.name || '';
            const city = place.city || place.subregion || '';
            setAddress(`${street ? street + ', ' : ''}${city}`.trim() || 'Location secured');
          } else {
            setAddress('Location secured');
          }
        } else {
          setLocationStatus('Access required');
          setAddress('Permission needed');
        }
      } catch (e) {
        setLocationStatus('Unknown');
        setAddress('Unable to locate');
      }
    })();
  }, []);

  const handleSOSActivate = () => {
    setSosActive(true);
    router.push('/(drawer)/(tabs)/sos-placeholder');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="dark" backgroundColor={COLORS.bg} />

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomContentPadding }]}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. Header & Greeting */}
        <View style={styles.headerRow}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
            <NeumorphicButton
              rounded={20} padding={10}
              style={{ marginRight: 16, marginTop: 4 }}
              onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
            >
              <Menu size={22} color={COLORS.textPrimary} />
            </NeumorphicButton>

            <View>
              <View style={styles.greetingContainer}>
                <Image
                  source={require('@/assets/images/safesphere_logo.png')}
                  style={{ width: 18, height: 18, marginRight: 6 }}
                  contentFit="contain"
                />
                <Sun size={14} color={COLORS.orange} style={{ marginRight: 6 }} />
                <Text style={styles.greetingSmall}>Good Afternoon,</Text>
              </View>
              <Text style={styles.greetingName}>Stay Safe</Text>
              <Text style={styles.greetingSub}>Your safety is our priority.</Text>
            </View>
          </View>

          <View style={styles.headerActions}>
            <NeumorphicButton
              rounded={24} padding={10}
              onPress={() => router.push('/(drawer)/notifications')}
            >
              <Bell size={20} color={COLORS.textPrimary} />
            </NeumorphicButton>

            <View style={{ width: 12 }} />

            <NeumorphicButton
              rounded={24} padding={6}
              onPress={() => router.push('/(drawer)/profile')}
            >
              <Image
                source={{ uri: 'https://ui-avatars.com/api/?name=Priyabrata&background=6D35E8&color=fff' }}
                style={{ width: 28, height: 28, borderRadius: 14 }}
              />
            </NeumorphicButton>
          </View>
        </View>

        {/* 2. Illustration Banner */}
        <NeumorphicCard padding={0} style={{ marginBottom: 24, overflow: 'hidden' }}>
          <View style={styles.illustrationBanner}>
            <View style={styles.illustrationTextCol}>
              <Text style={styles.illustrationTitle}>Your Safety Companion</Text>
              <Text style={styles.illustrationSub}>Empowered with AI to keep you safe.</Text>
              <TouchableOpacity style={styles.illustrationBtn}>
                <Text style={styles.illustrationBtnText}>Explore Features</Text>
              </TouchableOpacity>
            </View>
            <Image
              source={require('@/assets/images/safe_girl.png')}
              style={styles.illustrationImg}
              contentFit="contain"
            />
          </View>
        </NeumorphicCard>

        {/* 3. Safety Status Card */}
        <NeumorphicCard style={styles.statusCard}>
          <View style={styles.statusRow}>
            <View style={styles.shieldIconContainer}>
              <LinearGradient
                colors={[COLORS.purpleLight, '#FFFFFF']}
                style={[StyleSheet.absoluteFillObject, { borderRadius: 24 }]}
              />
              <ShieldCheck size={28} color={COLORS.purplePrimary} />
            </View>
            <View style={styles.statusTextCol}>
              <Text style={styles.statusTitle}>You're Protected</Text>
              <Text style={styles.statusSub}>SafeSphereAI is actively supporting your safety.</Text>
            </View>
          </View>
          <View style={styles.statusBadgeRow}>
            <PulseDot color={COLORS.green} />
            <Text style={styles.statusBadgeText}>Safety tools are active</Text>
            <View style={{ flex: 1 }} />
            <NeumorphicInset rounded={12} padding={6} style={styles.protectedBadge}>
              <Text style={styles.protectedBadgeText}>Secure</Text>
            </NeumorphicInset>
          </View>
        </NeumorphicCard>

        {/* Local Risk Widget */}
        <NeumorphicCard style={styles.riskCard} padding={16}>
          <View style={styles.riskHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <CloudSun size={18} color={COLORS.blue} style={{ marginRight: 8 }} />
              <Text style={styles.riskTitle}>Local Environment Risk</Text>
            </View>
            <View style={styles.riskBadge}>
              <Text style={styles.riskBadgeText}>LOW</Text>
            </View>
          </View>
          <Text style={styles.riskDesc}>Weather is clear. Area is generally safe for outdoor travel.</Text>
        </NeumorphicCard>

        {/* 3. Main SOS Emergency Card */}
        <NeumorphicCard style={styles.sosCard}>
          <View style={styles.sosHeader}>
            <Text style={styles.sectionTitle}>Emergency Help</Text>
            <Text style={styles.sosSub}>Press and hold SOS if you need immediate assistance.</Text>
          </View>
          <View style={styles.sosContainer}>
            <SOSButton isActive={sosActive} onActivate={handleSOSActivate} />
          </View>

          <NeumorphicButton
            padding={14}
            rounded={20}
            style={{ marginTop: 16, alignSelf: 'center', width: '80%' }}
            onPress={() => {
              setSosActive(false);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              DeviceEventEmitter.emit('stop_sos');
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldCheck size={18} color={COLORS.green} style={{ marginRight: 8 }} />
              <Text style={{ fontSize: 15, fontWeight: '800', color: COLORS.green }}>I am safe</Text>
            </View>
          </NeumorphicButton>
        </NeumorphicCard>

        {/* Emergency Quick Dial */}
        <View style={styles.quickDialContainer}>
          <Pressable style={styles.quickDialItem} onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            Linking.openURL('tel:100');
          }}>
            <NeumorphicInset rounded={24} padding={14} style={styles.quickDialIcon}>
              <Phone size={22} color={COLORS.blue} />
            </NeumorphicInset>
            <Text style={styles.quickDialText}>Police</Text>
          </Pressable>
          <Pressable style={styles.quickDialItem} onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            Linking.openURL('tel:102');
          }}>
            <NeumorphicInset rounded={24} padding={14} style={styles.quickDialIcon}>
              <Phone size={22} color={COLORS.red} />
            </NeumorphicInset>
            <Text style={styles.quickDialText}>Ambulance</Text>
          </Pressable>
          <Pressable style={styles.quickDialItem} onPress={async () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            const user = auth.currentUser;
            if (user) {
              const repo = new FirebaseGuardianRepository();
              const guardians = await repo.getRegisteredGuardians(user.uid);
              if (guardians.length > 0 && guardians[0].phone) {
                Linking.openURL(`tel:${guardians[0].phone}`);
              } else {
                Alert.alert('No Guardian', 'Please register a guardian in your profile to use quick dial.');
              }
            } else {
              Alert.alert('Not Logged In', 'Please log in to use this feature.');
            }
          }}>
            <NeumorphicInset rounded={24} padding={14} style={styles.quickDialIcon}>
              <Phone size={22} color={COLORS.purplePrimary} />
            </NeumorphicInset>
            <Text style={styles.quickDialText}>Guardian</Text>
          </Pressable>
        </View>

        {/* Live Active Journey Image Card */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Active Journey</Text>
        </View>
        <Pressable onPress={() => router.push('/(drawer)/(tabs)/live-tracking')}>
          <NeumorphicCard padding={0} style={{ overflow: 'hidden', marginBottom: 28 }}>
            <View style={{ height: 160, width: '100%' }}>
              <View pointerEvents="none" style={{ width: '100%', height: '100%' }}>
                <LiveMap location={location} />
              </View>
              <LinearGradient
                colors={['transparent', 'rgba(17,22,56,0.85)']}
                style={StyleSheet.absoluteFillObject}
                pointerEvents="none"
              />
              <View style={styles.journeyOverlay} pointerEvents="none">
                <View style={styles.journeyPulse}>
                  <PulseDot color={COLORS.green} />
                  <Text style={styles.journeyOverlayTitle}>Live Tracking Active</Text>
                </View>
                <Text style={styles.journeyOverlaySub}>Sharing your location securely...</Text>
              </View>
            </View>
          </NeumorphicCard>
        </Pressable>

        {/* Current Location Address Card */}
        <NeumorphicCard padding={12} style={{ marginBottom: 28 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.purpleLight, justifyContent: 'center', alignItems: 'center', marginRight: 12 }}>
              <MapPin size={18} color={COLORS.purplePrimary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 11, color: COLORS.textSecondary, textTransform: 'uppercase', fontWeight: '700' }}>Current Location</Text>
              <Text style={{ fontSize: 14, fontWeight: '700', color: COLORS.textPrimary, marginTop: 2 }}>{address}</Text>
            </View>
          </View>
        </NeumorphicCard>

        {/* 4. Quick Safety Actions */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Quick Safety Actions</Text>
          <Text style={styles.seeAllText}>View All</Text>
        </View>

        <View style={styles.gridContainer}>
          <NeumorphicButton style={{ width: cardWidth, marginBottom: columnGap }} onPress={() => router.push('/(drawer)/(tabs)/navigate')}>
            <View style={[styles.iconBox, { backgroundColor: COLORS.purpleLight }]}>
              <Navigation size={22} color={COLORS.purplePrimary} />
            </View>
            <Text style={styles.actionTitle}>Safe Route</Text>
            <Text style={styles.actionSub}>Find a safer route</Text>
            <ChevronRight size={16} color={COLORS.textSecondary} style={styles.actionArrow} />
          </NeumorphicButton>

          <NeumorphicButton style={{ width: cardWidth, marginBottom: columnGap }} onPress={() => router.push('/(drawer)/(tabs)/live-tracking')}>
            <View style={[styles.iconBox, { backgroundColor: COLORS.greenLight }]}>
              <MapPinned size={22} color={COLORS.green} />
            </View>
            <Text style={styles.actionTitle}>Live Tracking</Text>
            <Text style={styles.actionSub}>Share location</Text>
            <ChevronRight size={16} color={COLORS.textSecondary} style={styles.actionArrow} />
          </NeumorphicButton>

          <NeumorphicButton style={{ width: cardWidth, marginBottom: columnGap }} onPress={() => router.push('/(drawer)/ai-assistant')}>
            <View style={[styles.iconBox, { backgroundColor: COLORS.blueLight }]}>
              <Bot size={22} color={COLORS.blue} />
            </View>
            <Text style={styles.actionTitle}>AI Assistant</Text>
            <Text style={styles.actionSub}>Ask Ananya AI</Text>
            <ChevronRight size={16} color={COLORS.textSecondary} style={styles.actionArrow} />
          </NeumorphicButton>

          <NeumorphicButton style={{ width: cardWidth, marginBottom: columnGap }} onPress={() => Alert.alert('Data Vault', 'Secure local storage opened.')}>
            <View style={[styles.iconBox, { backgroundColor: 'transparent' }]}>
              <Database size={24} color={COLORS.blue} strokeWidth={2.5} />
            </View>
            <Text style={styles.actionTitle}>Data Vault</Text>
            <Text style={styles.actionSub}>Secure storage</Text>
            <ChevronRight size={16} color={COLORS.textSecondary} style={styles.actionArrow} />
          </NeumorphicButton>

          <NeumorphicButton style={{ width: cardWidth, marginBottom: columnGap }} onPress={() => router.push('/(drawer)/(tabs)/safety-analysis')}>
            <View style={[styles.iconBox, { backgroundColor: COLORS.orangeLight }]}>
              <ShieldCheck size={22} color={COLORS.orange} />
            </View>
            <Text style={styles.actionTitle}>Safety Analysis</Text>
            <Text style={styles.actionSub}>View safety score</Text>
            <ChevronRight size={16} color={COLORS.textSecondary} style={styles.actionArrow} />
          </NeumorphicButton>

          <NeumorphicButton style={{ width: cardWidth, marginBottom: columnGap }} onPress={() => router.push('/(drawer)/fake-call')}>
            <View style={[styles.iconBox, { backgroundColor: COLORS.purpleLight }]}>
              <PhoneCall size={22} color={COLORS.purpleDark} />
            </View>
            <Text style={styles.actionTitle}>Fake Call</Text>
            <Text style={styles.actionSub}>Simulate a call</Text>
            <ChevronRight size={16} color={COLORS.textSecondary} style={styles.actionArrow} />
          </NeumorphicButton>

          <NeumorphicButton style={{ width: cardWidth, marginBottom: columnGap }} onPress={() => router.push('/(drawer)/community')}>
            <View style={[styles.iconBox, { backgroundColor: COLORS.pinkLight }]}>
              <UsersRound size={22} color={COLORS.pink} />
            </View>
            <Text style={styles.actionTitle}>Community</Text>
            <Text style={styles.actionSub}>Local reports</Text>
            <ChevronRight size={16} color={COLORS.textSecondary} style={styles.actionArrow} />
          </NeumorphicButton>

          <NeumorphicButton style={{ width: cardWidth, marginBottom: columnGap }} onPress={() => router.push('/(drawer)/crime-rate')}>
            <View style={[styles.iconBox, { backgroundColor: COLORS.cyanLight }]}>
              <AlertOctagon size={22} color={COLORS.cyan} />
            </View>
            <Text style={styles.actionTitle}>Crime Rate</Text>
            <Text style={styles.actionSub}>Check area safety</Text>
            <ChevronRight size={16} color={COLORS.textSecondary} style={styles.actionArrow} />
          </NeumorphicButton>

          <NeumorphicButton style={{ width: cardWidth, marginBottom: columnGap }} onPress={() => Linking.openURL('tel:112')}>
            <View style={[styles.iconBox, { backgroundColor: COLORS.redLight }]}>
              <Phone size={22} color={COLORS.redDark} />
            </View>
            <Text style={styles.actionTitle}>Emergency 112</Text>
            <Text style={styles.actionSub}>Call authorities</Text>
            <ChevronRight size={16} color={COLORS.textSecondary} style={styles.actionArrow} />
          </NeumorphicButton>

          <NeumorphicButton style={{ width: cardWidth }} onPress={() => Linking.openURL('sms:?body=I feel unsafe. My current location is: ' + address)}>
            <View style={[styles.iconBox, { backgroundColor: COLORS.greenLight }]}>
              <MessageSquareShare size={22} color={COLORS.green} />
            </View>
            <Text style={styles.actionTitle}>Quick SMS</Text>
            <Text style={styles.actionSub}>Share location</Text>
            <ChevronRight size={16} color={COLORS.textSecondary} style={styles.actionArrow} />
          </NeumorphicButton>
        </View>

        {/* Emergency Services Dialer */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Emergency Services</Text>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 28, paddingHorizontal: 2 }}>
          <NeumorphicButton padding={12} style={{ flex: 1, marginRight: 8, alignItems: 'center' }}>
            <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.redLight, justifyContent: 'center', alignItems: 'center', marginBottom: 8 }}>
              <Phone size={20} color={COLORS.red} />
            </View>
            <Text style={{ fontSize: 13, fontWeight: '700', color: COLORS.textPrimary }}>Police</Text>
            <Text style={{ fontSize: 11, color: COLORS.textSecondary, marginTop: 2 }}>100</Text>
          </NeumorphicButton>

          <NeumorphicButton padding={12} style={{ flex: 1, marginHorizontal: 4, alignItems: 'center' }}>
            <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.orangeLight, justifyContent: 'center', alignItems: 'center', marginBottom: 8 }}>
              <Phone size={20} color={COLORS.orange} />
            </View>
            <Text style={{ fontSize: 13, fontWeight: '700', color: COLORS.textPrimary }}>Ambulance</Text>
            <Text style={{ fontSize: 11, color: COLORS.textSecondary, marginTop: 2 }}>102</Text>
          </NeumorphicButton>

          <NeumorphicButton padding={12} style={{ flex: 1, marginLeft: 8, alignItems: 'center' }}>
            <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.purpleLight, justifyContent: 'center', alignItems: 'center', marginBottom: 8 }}>
              <Phone size={20} color={COLORS.purplePrimary} />
            </View>
            <Text style={{ fontSize: 13, fontWeight: '700', color: COLORS.textPrimary }}>Women Help</Text>
            <Text style={{ fontSize: 11, color: COLORS.textSecondary, marginTop: 2 }}>1091</Text>
          </NeumorphicButton>
        </View>

        {/* Community & News Banner */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 28, marginHorizontal: -20, paddingHorizontal: 20 }}>
          <NeumorphicCard padding={14} rounded={16} style={{ width: 260, marginRight: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Image source={require('@/assets/images/weather_alert_cartoon.png')} style={{ width: 60, height: 60, borderRadius: 12, marginRight: 12 }} />
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 13, fontWeight: '800', color: COLORS.blue }}>Weather Alert</Text>
                <Text style={{ fontSize: 12, color: COLORS.textPrimary, marginTop: 2 }}>Heavy rain expected tonight.</Text>
              </View>
            </View>
          </NeumorphicCard>

          <NeumorphicCard padding={14} rounded={16} style={{ width: 260, marginRight: 40 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Image source={require('@/assets/images/community_safe_cartoon.png')} style={{ width: 60, height: 60, borderRadius: 12, marginRight: 12 }} />
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 13, fontWeight: '800', color: COLORS.green }}>Community Update</Text>
                <Text style={{ fontSize: 12, color: COLORS.textPrimary, marginTop: 2 }}>New safe zone added nearby.</Text>
              </View>
            </View>
          </NeumorphicCard>
        </ScrollView>

        {/* 5. AI Safety Score Card */}
        <NeumorphicCard style={styles.scoreCard}>
          <View style={styles.scoreHeader}>
            <Text style={styles.sectionTitle}>AI Safety Score</Text>
            <Pressable onPress={() => router.push('/(drawer)/(tabs)/safety-analysis')}>
              <Text style={styles.seeAllText}>View Analysis</Text>
            </Pressable>
          </View>

          <View style={styles.scoreContent}>
            <View style={styles.scoreCircleWrapper}>
              <View style={styles.scoreRingOuter}>
                <View style={styles.scoreRingInner}>
                  <Text style={styles.scoreValue}>78<Text style={styles.scoreMax}>/100</Text></Text>
                  <Text style={styles.scoreStatusText}>Good</Text>
                </View>
              </View>
            </View>

            <View style={styles.scoreDetails}>
              <Text style={styles.demoDataLabel}>Demo safety score</Text>

              <View style={styles.catRow}>
                <Text style={styles.catLabel}>Lifestyle</Text>
                <Text style={styles.catValue}>75%</Text>
              </View>
              <View style={styles.catRow}>
                <Text style={styles.catLabel}>Travel</Text>
                <Text style={styles.catValue}>82%</Text>
              </View>
              <View style={styles.catRow}>
                <Text style={styles.catLabel}>Home</Text>
                <Text style={styles.catValue}>70%</Text>
              </View>
              <View style={styles.catRow}>
                <Text style={styles.catLabel}>Digital</Text>
                <Text style={styles.catValue}>85%</Text>
              </View>
            </View>
          </View>
        </NeumorphicCard>

        {/* Device Health */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Device Health</Text>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 28 }}>
          <NeumorphicCard style={{ flex: 1, marginRight: 8, padding: 16 }} padding={0}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.greenLight, justifyContent: 'center', alignItems: 'center', marginRight: 10 }}>
                <Battery size={18} color={COLORS.green} />
              </View>
              <View>
                <Text style={{ fontSize: 12, color: COLORS.textSecondary }}>Battery</Text>
                <Text style={{ fontSize: 16, fontWeight: '800', color: COLORS.textPrimary }}>84%</Text>
              </View>
            </View>
          </NeumorphicCard>
          <NeumorphicCard style={{ flex: 1, marginLeft: 8, padding: 16 }} padding={0}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.blueLight, justifyContent: 'center', alignItems: 'center', marginRight: 10 }}>
                <Wifi size={18} color={COLORS.blue} />
              </View>
              <View>
                <Text style={{ fontSize: 12, color: COLORS.textSecondary }}>Network</Text>
                <Text style={{ fontSize: 16, fontWeight: '800', color: COLORS.textPrimary }}>Strong</Text>
              </View>
            </View>
          </NeumorphicCard>
        </View>

        {/* 6. Live Safety Status */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Live Safety Status</Text>
        </View>

        <NeumorphicCard style={styles.liveStatusCard}>
          <View style={styles.liveStatusItem}>
            <Text style={styles.liveStatusLabel}>Location</Text>
            <Text style={[styles.liveStatusValue, { color: locationStatus.includes('enabled') ? COLORS.green : COLORS.orange }]}>{locationStatus}</Text>
          </View>
          <View style={styles.liveDivider} />
          <View style={styles.liveStatusItem}>
            <Text style={styles.liveStatusLabel}>Trusted</Text>
            <Text style={styles.liveStatusValue}>Add contacts</Text>
          </View>
          <View style={styles.liveDivider} />
          <View style={styles.liveStatusItem}>
            <Text style={styles.liveStatusLabel}>SOS</Text>
            <Text style={[styles.liveStatusValue, { color: sosActive ? COLORS.red : COLORS.green }]}>
              {sosActive ? 'Active' : 'Ready'}
            </Text>
          </View>
        </NeumorphicCard>

        {/* 7. Trusted Contacts Preview */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Trusted Contacts</Text>
          <Pressable onPress={() => router.push('/(drawer)/profile')}>
            <Text style={styles.seeAllText}>Manage</Text>
          </Pressable>
        </View>

        <NeumorphicCard style={styles.emptyContactsCard}>
          <View style={{ flexDirection: 'row', marginBottom: 16 }}>
            <Image
              source={{ uri: 'https://ui-avatars.com/api/?name=R&background=random&color=fff' }}
              style={{ width: 48, height: 48, borderRadius: 24, borderWidth: 2, borderColor: COLORS.bg, zIndex: 3 }}
            />
            <Image
              source={{ uri: 'https://ui-avatars.com/api/?name=M&background=random&color=fff' }}
              style={{ width: 48, height: 48, borderRadius: 24, borderWidth: 2, borderColor: COLORS.bg, marginLeft: -16, zIndex: 2 }}
            />
            <Image
              source={{ uri: 'https://ui-avatars.com/api/?name=S&background=random&color=fff' }}
              style={{ width: 48, height: 48, borderRadius: 24, borderWidth: 2, borderColor: COLORS.bg, marginLeft: -16, zIndex: 1 }}
            />
            <View style={{ width: 48, height: 48, borderRadius: 24, borderWidth: 2, borderColor: COLORS.bg, marginLeft: -16, backgroundColor: COLORS.purpleLight, justifyContent: 'center', alignItems: 'center' }}>
              <Text style={{ fontSize: 16, fontWeight: '700', color: COLORS.purplePrimary }}>+</Text>
            </View>
          </View>
          <Text style={styles.emptyContactsTitle}>Build your safety network</Text>
          <Text style={styles.emptyContactsSub}>Add trusted people who can help during an emergency.</Text>
          <NeumorphicButton
            padding={12}
            rounded={16}
            style={styles.addContactBtn}
            onPress={() => router.push('/(drawer)/add-contact')}
          >
            <Text style={styles.addContactBtnText}>Add Contact</Text>
          </NeumorphicButton>
        </NeumorphicCard>

        {/* 8. Recent Safety Activity */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <Text style={styles.seeAllText}>See All</Text>
        </View>

        <NeumorphicCard style={{ marginBottom: 28, padding: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Image
              source={{ uri: 'https://ui-avatars.com/api/?name=AI&background=6D35E8&color=fff' }}
              style={{ width: 40, height: 40, borderRadius: 20, marginRight: 12 }}
            />
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 14, fontWeight: '700', color: COLORS.textPrimary }}>Ananya AI</Text>
              <Text style={{ fontSize: 12, color: COLORS.textSecondary }}>Analyzed your recent route</Text>
            </View>
            <Text style={{ fontSize: 11, color: COLORS.textSecondary }}>2h ago</Text>
          </View>
        </NeumorphicCard>

        {/* 9. Safety Tip of the Day */}
        <NeumorphicCard style={styles.tipCardWrapper} rounded={24} padding={0}>
          <LinearGradient colors={['#F5F3FF', '#EDE9FE']} style={styles.tipCardGradient}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ flex: 1, paddingRight: 10 }}>
                <View style={styles.tipHeader}>
                  <Lightbulb size={24} color={COLORS.purplePrimary} />
                  <Text style={styles.tipTitle}>Daily Tip</Text>
                </View>
                <Text style={styles.tipText}>
                  Share your travel plans with someone you trust, especially when alone.
                </Text>

                <Pressable
                  style={styles.moreTipsBtn}
                  onPress={() => router.push('/(drawer)/ai-assistant')}
                >
                  <Text style={styles.moreTipsText}>Ask AI Assistant</Text>
                  <ChevronRight size={16} color={COLORS.purplePrimary} />
                </Pressable>
              </View>
              <Image
                source={require('@/assets/images/safesphere_illustration.png')}
                style={{ width: 100, height: 100 }}
                contentFit="contain"
              />
            </View>
          </LinearGradient>
        </NeumorphicCard>

        {/* Medical ID Preview */}
        <NeumorphicCard style={{ marginBottom: 28, padding: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.redLight, justifyContent: 'center', alignItems: 'center', marginRight: 16 }}>
              <HeartPulse size={24} color={COLORS.red} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 15, fontWeight: '800', color: COLORS.textPrimary }}>Medical ID</Text>
              <Text style={{ fontSize: 12, color: COLORS.textSecondary, marginTop: 2 }}>O+ Blood • No Allergies</Text>
            </View>
            <NeumorphicButton padding={8} rounded={12} onPress={() => router.push('/(drawer)/profile')}>
              <Text style={{ fontSize: 12, fontWeight: '700', color: COLORS.purplePrimary }}>View</Text>
            </NeumorphicButton>
          </View>
        </NeumorphicCard>

        {/* Safety Guides & Articles */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Safety Guides</Text>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 40, marginHorizontal: -20, paddingHorizontal: 20 }}>
          <NeumorphicCard padding={0} rounded={16} style={{ width: 220, marginRight: 16, overflow: 'hidden' }}>
            <Image source={{ uri: 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=400&h=200&fit=crop' }} style={{ width: '100%', height: 100 }} />
            <View style={{ padding: 12 }}>
              <Text style={{ fontSize: 13, fontWeight: '800', color: COLORS.textPrimary }}>Night Safety Guide</Text>
              <Text style={{ fontSize: 11, color: COLORS.textSecondary, marginTop: 4 }}>5 essential tips for walking alone at night.</Text>
            </View>
          </NeumorphicCard>

          <NeumorphicCard padding={0} rounded={16} style={{ width: 220, marginRight: 16, overflow: 'hidden' }}>
            <Image source={{ uri: 'https://images.unsplash.com/photo-1584515933487-779824d29309?w=400&h=200&fit=crop' }} style={{ width: '100%', height: 100 }} />
            <View style={{ padding: 12 }}>
              <Text style={{ fontSize: 13, fontWeight: '800', color: COLORS.textPrimary }}>First Aid Basics</Text>
              <Text style={{ fontSize: 11, color: COLORS.textSecondary, marginTop: 4 }}>Learn how to handle minor medical emergencies.</Text>
            </View>
          </NeumorphicCard>

          <NeumorphicCard padding={0} rounded={16} style={{ width: 220, marginRight: 40, overflow: 'hidden' }}>
            <Image source={{ uri: 'https://images.unsplash.com/photo-1563206767-5b18f218e8de?w=400&h=200&fit=crop' }} style={{ width: '100%', height: 100 }} />
            <View style={{ padding: 12 }}>
              <Text style={{ fontSize: 13, fontWeight: '800', color: COLORS.textPrimary }}>Digital Privacy</Text>
              <Text style={{ fontSize: 11, color: COLORS.textSecondary, marginTop: 4 }}>How to secure your personal tracking data.</Text>
            </View>
          </NeumorphicCard>
        </ScrollView>

      </ScrollView>
    </SafeAreaView>
  );
}

// ==========================================
// Styles
// ==========================================

const neuStyles = StyleSheet.create({
  outer: {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 10, height: 10 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 8,
    backgroundColor: COLORS.bg,
  },
  inner: {
    shadowColor: COLORS.highlight,
    shadowOffset: { width: -10, height: -10 },
    shadowOpacity: 1,
    shadowRadius: 20,
    backgroundColor: COLORS.bg,
    overflow: 'hidden',
    borderTopWidth: Platform.OS === 'android' ? 1 : 0,
    borderLeftWidth: Platform.OS === 'android' ? 1 : 0,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  innerPressed: {
    backgroundColor: '#EAEFF5',
    borderTopWidth: 0,
    borderLeftWidth: 0,
  },
  inset: {
    backgroundColor: '#E5E9F0',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
    shadowColor: COLORS.insetShadow,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
  }
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 120,
  },

  // Header
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  greetingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  greetingSmall: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  greetingName: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  greetingSub: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  headerActions: {
    flexDirection: 'row',
  },

  // Status Card
  statusCard: {
    marginBottom: 16,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  shieldIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    overflow: 'hidden',
  },
  statusTextCol: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  statusSub: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  statusBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pulseDotContainer: {
    width: 12,
    height: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusBadgeText: {
    fontSize: 13,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  protectedBadge: {
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  protectedBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.green,
  },

  // Risk Card
  riskCard: {
    marginBottom: 28,
  },
  riskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  riskTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  riskBadge: {
    backgroundColor: COLORS.green,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  riskBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '800',
  },
  riskDesc: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },

  // SOS Card
  sosCard: {
    marginBottom: 24,
  },
  sosButtonWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  sosContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  sosMiddleCircle: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: COLORS.bg,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: -4, height: -4 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
  },
  sosHeader: {
    alignItems: 'center',
    marginBottom: 10,
  },
  sosTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.redDark,
    marginBottom: 6,
  },
  sosSub: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  sosContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 12,
  },
  sosButtonWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  sosMiddleCircle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  sosOuterCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: COLORS.bg,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 8, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 4,
    borderColor: COLORS.bg,
  },
  sosInnerCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  sosProgressFill: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.redDark,
  },
  sosText: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFFFFF',
    zIndex: 10,
  },

  // Quick Dial
  quickDialContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
    paddingHorizontal: 10,
  },
  quickDialItem: {
    alignItems: 'center',
  },
  quickDialIcon: {
    marginBottom: 8,
  },
  quickDialText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },

  // Active Journey Map Card
  journeyOverlay: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
  },
  journeyPulse: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  journeyOverlayTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  journeyOverlaySub: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    fontWeight: '500',
  },

  // Sections
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.purplePrimary,
    marginBottom: 2,
  },

  // Grid
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  actionSub: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  actionArrow: {
    position: 'absolute',
    bottom: 16,
    right: 16,
  },

  // Score Card
  scoreCard: {
    marginBottom: 28,
  },
  scoreHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  scoreContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scoreCircleWrapper: {
    marginRight: 20,
  },
  scoreRingOuter: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.bg,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 8,
    borderColor: COLORS.purpleLight,
    borderLeftColor: COLORS.purplePrimary,
    borderTopColor: COLORS.purplePrimary,
    borderRightColor: COLORS.purplePrimary,
  },
  scoreRingInner: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: COLORS.bg,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 2,
  },
  scoreValue: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.textPrimary,
  },
  scoreMax: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  scoreStatusText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.green,
    marginTop: 2,
  },
  scoreDetails: {
    flex: 1,
  },
  demoDataLabel: {
    fontSize: 11,
    color: COLORS.orange,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  catRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  catLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  catValue: {
    fontSize: 13,
    color: COLORS.textPrimary,
    fontWeight: '700',
  },

  // Live Status
  liveStatusCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 16,
    marginBottom: 28,
  },
  liveStatusItem: {
    flex: 1,
    alignItems: 'center',
  },
  liveDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(163, 177, 198, 0.3)',
  },
  liveStatusLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '500',
    marginBottom: 4,
  },
  liveStatusValue: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },

  // Empty Contacts
  emptyContactsCard: {
    alignItems: 'center',
    paddingVertical: 32,
    marginBottom: 28,
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.bg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.6)',
  },
  emptyContactsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  emptyContactsSub: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  addContactBtn: {
    paddingHorizontal: 32,
  },
  addContactBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.purplePrimary,
  },

  // Recent Activity
  activityCard: {
    paddingVertical: 24,
    alignItems: 'center',
    marginBottom: 28,
  },
  emptyActivityText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },

  // Tip Card
  tipCardWrapper: {
    marginBottom: 20,
  },
  tipCardGradient: {
    padding: 20,
    borderRadius: 24,
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.purpleDark,
    marginLeft: 10,
  },
  tipText: {
    fontSize: 14,
    color: COLORS.textPrimary,
    lineHeight: 22,
    marginBottom: 16,
  },
  moreTipsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  moreTipsText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.purplePrimary,
    marginRight: 4,
  },

  // Illustration Banner
  illustrationBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.purpleLight,
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  illustrationTextCol: {
    flex: 1,
    paddingRight: 10,
  },
  illustrationTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.purpleDark,
    marginBottom: 6,
  },
  illustrationSub: {
    fontSize: 12,
    color: COLORS.textPrimary,
    lineHeight: 18,
    marginBottom: 12,
  },
  illustrationBtn: {
    backgroundColor: COLORS.purplePrimary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  illustrationBtnText: {
    color: COLORS.highlight,
    fontSize: 12,
    fontWeight: '700',
  },
  illustrationImg: {
    width: 100,
    height: 120,
  },
});
