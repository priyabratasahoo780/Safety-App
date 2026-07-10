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
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Top Header Row */}
      <View style={styles.topRow}>
        <TouchableOpacity style={styles.skipButton} onPress={() => router.push('/(auth)/sign-in')}>
          <Text style={styles.skipText}>Skip </Text>
          <Feather name="chevron-right" size={16} color="#8E8E93" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Main Illustration */}
        <View style={styles.illustrationContainer}>
          <Image
            source={require('@/assets/images/safesphere_illustration.png')}
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
          <Text style={styles.subtitleText}>
            {"We're here to protect, guide, and empower you every step of the way."}
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
          {/* Card 1: Instant SOS */}
          <View style={styles.card}>
            <View style={[styles.iconWrapper, { backgroundColor: '#FFF0F2' }]}>
              <MaterialCommunityIcons name="alarm-light-outline" size={24} color="#F34E62" />
            </View>
            <View style={styles.cardContent}>
              <Text style={[styles.cardTitle, { color: '#F34E62' }]}>Instant SOS</Text>
              <Text style={styles.cardDescription}>
                One tap to alert your trusted contacts and share your location.
              </Text>
            </View>
          </View>

          {/* Card 2: Live Tracking */}
          <View style={styles.card}>
            <View style={[styles.iconWrapper, { backgroundColor: '#F3E8FF' }]}>
              <Feather name="map-pin" size={20} color="#9061F9" />
            </View>
            <View style={styles.cardContent}>
              <Text style={[styles.cardTitle, { color: '#9061F9' }]}>Live Tracking</Text>
              <Text style={styles.cardDescription}>
                Share your live location with trusted people in real time.
              </Text>
            </View>
          </View>

          {/* Card 3: AI Safety Score */}
          <View style={styles.card}>
            <View style={[styles.iconWrapper, { backgroundColor: '#DEF7EC' }]}>
              <Feather name="shield" size={20} color="#0E9F6E" />
            </View>
            <View style={styles.cardContent}>
              <Text style={[styles.cardTitle, { color: '#0E9F6E' }]}>AI Safety Score</Text>
              <Text style={styles.cardDescription}>
                Get AI-powered safety scores & smarter suggestions.
              </Text>
            </View>
          </View>

          {/* Card 4: Community Help */}
          <View style={styles.card}>
            <View style={[styles.iconWrapper, { backgroundColor: '#FEF3C7' }]}>
              <Feather name="users" size={20} color="#D97706" />
            </View>
            <View style={styles.cardContent}>
              <Text style={[styles.cardTitle, { color: '#D97706' }]}>Community Help</Text>
              <Text style={styles.cardDescription}>
                Report incidents and help build a safer community together.
              </Text>
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

        {/* AI Voice Engine Debug */}
        <TouchableOpacity 
          style={{ marginTop: 20, alignItems: 'center' }} 
          onPress={() => router.push('/test-ai-voice')}
        >
          <Text style={{ color: '#0E9F6E', fontWeight: 'bold' }}>Test AI Voice Engine (Debug)</Text>
        </TouchableOpacity>
      </ScrollView>
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
    paddingTop: 20,
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
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  illustrationContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  illustration: {
    width: '100%',
    height: width * 0.75,
  },
  welcomeContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
  },
  brandText: {
    fontSize: 28,
    fontWeight: '800',
    color: '#F34E62',
    marginBottom: 8,
  },
  subtitleText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 10,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 30,
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
    marginBottom: 30,
  },
  card: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 16,
  },
  getStartedButton: {
    backgroundColor: '#F34E62',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 30,
    marginBottom: 20,
    shadowColor: '#F34E62',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  getStartedText: {
    color: '#FFFFFF',
    fontSize: 18,
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
  },
  loginText: {
    fontSize: 15,
    color: '#6B7280',
  },
  loginLink: {
    fontSize: 15,
    color: '#111827',
    fontWeight: '700',
  },
});

