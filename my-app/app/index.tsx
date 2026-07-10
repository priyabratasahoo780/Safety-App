import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
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

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar style="dark" />

      {/* Top Header Row */}
      <View style={styles.topRow}>
        <TouchableOpacity style={styles.skipButton} onPress={() => router.push('/(auth)/sign-in')}>
          <Text style={styles.skipText}>Skip </Text>
          <Feather name="chevron-right" size={16} color="#8E8E93" />
        </TouchableOpacity>
      </View>

      <View style={styles.mainContent}>
        {/* Main Illustration */}
        <View style={styles.illustrationContainer}>
          <Text style={styles.welcomeToText}>Welcome to</Text>
          <Image
            source={require('@/assets/images/safesphere_illustration.png')}
            style={styles.illustration}
            contentFit="contain"
          />
        </View>

        <View style={styles.bottomSection}>
          {/* Welcome Text */}
          <View style={styles.welcomeContainer}>
            <Text style={styles.welcomeTitle}>Empowering Your Safety</Text>
            <Text style={styles.welcomeSubtitle}>
              Experience next-generation personal security. Get AI-powered incident prediction, real-time guardian tracking, and instant one-tap emergency SOS dispatches.
            </Text>
          </View>
          {/* Features 2x2 Grid */}
          <View style={styles.gridContainer}>
            {/* Card 1: Instant SOS */}
            <View style={styles.card}>
              <View style={[styles.iconWrapper, { backgroundColor: '#FFF0F2' }]}>
                <MaterialCommunityIcons name="alarm-light-outline" size={18} color="#F34E62" />
              </View>
              <View style={styles.cardContent}>
                <Text style={[styles.cardTitle, { color: '#F34E62' }]}>Instant SOS</Text>
                <Text style={styles.cardDescription}>One tap alert</Text>
              </View>
            </View>

            {/* Card 2: Live Tracking */}
            <View style={styles.card}>
              <View style={[styles.iconWrapper, { backgroundColor: '#F3E8FF' }]}>
                <Feather name="map-pin" size={16} color="#9061F9" />
              </View>
              <View style={styles.cardContent}>
                <Text style={[styles.cardTitle, { color: '#9061F9' }]}>Live Tracking</Text>
                <Text style={styles.cardDescription}>Share location</Text>
              </View>
            </View>

            {/* Card 3: AI Safety */}
            <View style={styles.card}>
              <View style={[styles.iconWrapper, { backgroundColor: '#DEF7EC' }]}>
                <Feather name="shield" size={16} color="#0E9F6E" />
              </View>
              <View style={styles.cardContent}>
                <Text style={[styles.cardTitle, { color: '#0E9F6E' }]}>AI Safety</Text>
                <Text style={styles.cardDescription}>Smart scores</Text>
              </View>
            </View>

            {/* Card 4: Community */}
            <View style={styles.card}>
              <View style={[styles.iconWrapper, { backgroundColor: '#FEF3C7' }]}>
                <Feather name="users" size={16} color="#D97706" />
              </View>
              <View style={styles.cardContent}>
                <Text style={[styles.cardTitle, { color: '#D97706' }]}>Community</Text>
                <Text style={styles.cardDescription}>Help together</Text>
              </View>
            </View>
          </View>

          {/* Action Button - Navigates to Features page */}
          <TouchableOpacity
            style={styles.getStartedButton}
            activeOpacity={0.9}
            onPress={() => router.push('/features')}
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
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  skipButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  skipText: {
    fontSize: 16,
    color: '#8E8E93',
    fontWeight: '500',
  },
  mainContent: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  illustrationContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  welcomeToText: {
    fontSize: 26,
    fontWeight: '800',
    color: '#111827',
    marginBottom: -5,
  },
  illustration: {
    width: '100%',
    height: '100%', // Flexible height
    maxHeight: 250, // Cap height much smaller to make room for text
  },
  bottomSection: {
    justifyContent: 'flex-end',
  },
  welcomeContainer: {
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 10,
  },
  welcomeTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 4,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 18,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  card: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 10,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardContent: {
    flex: 1,
    marginLeft: 8,
  },
  cardTitle: {
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 14,
  },
  cardDescription: {
    fontSize: 10,
    color: '#6B7280',
    lineHeight: 12,
    marginTop: 1,
  },
  getStartedButton: {
    backgroundColor: '#F34E62',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14, // Reduced padding
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
    fontSize: 16,
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
    marginBottom: 10,
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

