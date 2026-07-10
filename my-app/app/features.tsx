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
          <Feather name="chevron-right" size={16} color="#F34E62" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Welcome Text */}
        <View style={styles.welcomeContainer}>
          <Text style={styles.welcomeText}>Your Safety,</Text>
          <Text style={styles.brandText}>Our Priority</Text>
          <Text style={styles.subtitleText}>
            SafeSphere AI is here to protect,
          </Text>
          <Text style={styles.subtitleText}>
            guide and empower you.
          </Text>
        </View>

        {/* Main Illustration */}
        <View style={styles.illustrationContainer}>
          <Image
            source={require('@/assets/images/safesphere_illustration.png')}
            style={styles.illustration}
            contentFit="contain"
          />
        </View>

        {/* Vertical Features List */}
        <View style={styles.featuresContainer}>
          {/* Feature 1: Instant SOS */}
          <View style={styles.featureCard}>
            <View style={[styles.iconWrapper, { backgroundColor: '#FFF0F2' }]}>
              <MaterialCommunityIcons name="alarm-light-outline" size={24} color="#F34E62" />
            </View>
            <View style={styles.featureContent}>
              <Text style={[styles.featureTitle, { color: '#F34E62' }]}>Instant SOS</Text>
              <Text style={styles.featureDescription}>
                One tap to alert your trusted contacts and share your location.
              </Text>
            </View>
            <Feather name="chevron-right" size={20} color="#F34E62" />
          </View>

          {/* Feature 2: Live Tracking */}
          <View style={styles.featureCard}>
            <View style={[styles.iconWrapper, { backgroundColor: '#EEF2FF' }]}>
              <Feather name="map-pin" size={20} color="#5A67D8" />
            </View>
            <View style={styles.featureContent}>
              <Text style={[styles.featureTitle, { color: '#5A67D8' }]}>Live Tracking</Text>
              <Text style={styles.featureDescription}>
                Share live location and let your trusted people track you in real-time.
              </Text>
            </View>
            <Feather name="chevron-right" size={20} color="#5A67D8" />
          </View>

          {/* Feature 3: AI Safety Score */}
          <View style={styles.featureCard}>
            <View style={[styles.iconWrapper, { backgroundColor: '#DEF7EC' }]}>
              <Feather name="shield" size={20} color="#0E9F6E" />
            </View>
            <View style={styles.featureContent}>
              <Text style={[styles.featureTitle, { color: '#0E9F6E' }]}>AI Safety Score</Text>
              <Text style={styles.featureDescription}>
                Get AI-powered safety scores and smart risk predictions.
              </Text>
            </View>
            <Feather name="chevron-right" size={20} color="#0E9F6E" />
          </View>

          {/* Feature 4: Community Support */}
          <View style={styles.featureCard}>
            <View style={[styles.iconWrapper, { backgroundColor: '#FEF3C7' }]}>
              <Feather name="users" size={20} color="#D97706" />
            </View>
            <View style={styles.featureContent}>
              <Text style={[styles.featureTitle, { color: '#D97706' }]}>Community Support</Text>
              <Text style={styles.featureDescription}>
                Report incidents, help others and build a safer community.
              </Text>
            </View>
            <Feather name="chevron-right" size={20} color="#D97706" />
          </View>

          {/* Feature 5: AI Assistant */}
          <View style={styles.featureCard}>
            <View style={[styles.iconWrapper, { backgroundColor: '#E0F2FE' }]}>
              <Feather name="message-square" size={20} color="#0284C7" />
            </View>
            <View style={styles.featureContent}>
              <Text style={[styles.featureTitle, { color: '#0284C7' }]}>AI Assistant</Text>
              <Text style={styles.featureDescription}>
                Get instant guidance, safety tips and emotional support with AI.
              </Text>
            </View>
            <Feather name="chevron-right" size={20} color="#0284C7" />
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
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  skipButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  skipText: {
    fontSize: 16,
    color: '#F34E62',
    fontWeight: '500',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  welcomeContainer: {
    marginTop: 10,
    marginBottom: 24,
  },
  welcomeText: {
    fontSize: 32,
    fontWeight: '800',
    color: '#111827',
    lineHeight: 40,
  },
  brandText: {
    fontSize: 32,
    fontWeight: '800',
    color: '#F34E62',
    lineHeight: 40,
    marginBottom: 12,
  },
  subtitleText: {
    fontSize: 15,
    color: '#6B7280',
    lineHeight: 22,
  },
  illustrationContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  illustration: {
    width: '100%',
    height: width * 0.75,
  },
  featuresContainer: {
    gap: 16,
    marginBottom: 32,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F3F4F6',
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  featureContent: {
    flex: 1,
    paddingRight: 16,
  },
  featureTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
  },
  getStartedButton: {
    backgroundColor: '#F34E62',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 30,
    marginBottom: 24,
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

