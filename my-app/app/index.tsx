import React from 'react';

import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function OnboardingScreen() {
  const router = useRouter();

  // _layout.tsx will handle all auth routing

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar style="dark" />

      {/* Main Illustration */}
      <View style={styles.illustrationContainer}>
        <Image
          source={require('@/assets/images/safesphere_illustration.jpg')}
          style={styles.illustration}
          contentFit="contain"
        />
      </View>

      {/* Welcome Text */}
      <View style={styles.welcomeContainer}>
        <Text style={styles.welcomeText}>Welcome to</Text>
        <Text style={styles.brandText}>SafeSphere AI</Text>
        <Text style={styles.subtitleText}>
          Your intelligent personal safety companion.
        </Text>
      </View>

      {/* Dot Indicators */}
      <View style={styles.dotsContainer}>
        <View style={[styles.dot, styles.activeDot]} />
        <View style={styles.dot} />
        <View style={styles.dot} />
      </View>

      {/* Features 2x2 Grid */}
      <View style={styles.gridContainer}>
        <View style={styles.card}>
          <View style={[styles.iconWrapper, { backgroundColor: '#FFF0F2' }]}>
            <MaterialCommunityIcons name="alarm-light-outline" size={22} color="#F34E62" />
          </View>
          <Text style={[styles.cardTitle, { color: '#F34E62' }]}>Instant SOS</Text>
          <Text style={styles.cardDescription}>One tap to alert contacts & share location.</Text>
        </View>

        <View style={styles.card}>
          <View style={[styles.iconWrapper, { backgroundColor: '#F3E8FF' }]}>
            <Feather name="map-pin" size={20} color="#9061F9" />
          </View>
          <Text style={[styles.cardTitle, { color: '#9061F9' }]}>Live Tracking</Text>
          <Text style={styles.cardDescription}>Share your live location in real time.</Text>
        </View>

        <View style={styles.card}>
          <View style={[styles.iconWrapper, { backgroundColor: '#DEF7EC' }]}>
            <Feather name="shield" size={20} color="#0E9F6E" />
          </View>
          <Text style={[styles.cardTitle, { color: '#0E9F6E' }]}>AI Safety Score</Text>
          <Text style={styles.cardDescription}>AI-powered safety scores & smarter tips.</Text>
        </View>

        <View style={styles.card}>
          <View style={[styles.iconWrapper, { backgroundColor: '#FEF3C7' }]}>
            <Feather name="users" size={20} color="#D97706" />
          </View>
          <Text style={[styles.cardTitle, { color: '#D97706' }]}>Community Help</Text>
          <Text style={styles.cardDescription}>Report incidents & build safety together.</Text>
        </View>
      </View>

      {/* Action Button */}
      <TouchableOpacity
        style={styles.getStartedButton}
        activeOpacity={0.9}
        onPress={() => router.push('/(auth)/sign-up')}
      >
        <Text style={styles.getStartedText}>Get Started</Text>
        <Feather name="chevron-right" size={20} color="#FFFFFF" style={styles.buttonArrow} />
      </TouchableOpacity>

      {/* Login Redirect */}
      <View style={styles.loginContainer}>
        <Text style={styles.loginText}>Already have an account? </Text>
        <TouchableOpacity onPress={() => router.push('/(auth)/sign-in')}>
          <Text style={styles.loginLink}>Log In</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
  },
  illustrationContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  illustration: {
    width: '100%',
    height: width * 0.6,
  },
  welcomeContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
  },
  brandText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#F34E62',
    marginBottom: 4,
  },
  subtitleText: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 18,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#F34E62',
    width: 20,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  card: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 3,
  },
  cardDescription: {
    fontSize: 11,
    color: '#6B7280',
    lineHeight: 15,
  },
  getStartedButton: {
    backgroundColor: '#F34E62',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 30,
    marginBottom: 16,
    shadowColor: '#F34E62',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  getStartedText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
  buttonArrow: {
    marginLeft: 8,
    marginTop: 2,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  loginText: {
    fontSize: 14,
    color: '#6B7280',
  },
  loginLink: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '700',
  },
});
