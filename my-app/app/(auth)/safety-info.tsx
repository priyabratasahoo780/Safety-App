import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { Feather, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { authService } from '../../src/services/authService';
import { useUser } from '@clerk/clerk-expo';
import * as Location from 'expo-location';

export default function SafetyInfoScreen() {
  const router = useRouter();
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [medicalConditions, setMedicalConditions] = useState('');
  const [pushEnabled, setPushEnabled] = useState(true);
  const [smsEnabled, setSmsEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [locationGranted, setLocationGranted] = useState(false);

  const requestLocationPermission = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Location access is required for emergency features.');
      return;
    }
    setLocationGranted(true);
  };

  const handleNext = async () => {
    if (!age || !gender) {
      Alert.alert("Missing Information", "Please enter your age and gender.");
      return;
    }
    
    if (!user) {
      Alert.alert("Error", "You must be logged in to update your profile.");
      return;
    }
    
    setLoading(true);
    try {
      await authService.updateUserProfile(user.id, {
        age,
        gender,
        safetyPreferences: {
          pushEnabled,
          smsEnabled,
          emailEnabled,
          medicalConditions,
        }
      });
      router.push('/(auth)/trusted-contacts');
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Top Header Row */}
      <View style={styles.topRow}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Feather name="arrow-left" size={24} color="#111827" />
        </TouchableOpacity>
        <View style={styles.loginRedirectContainer}>
          <Text style={styles.loginRedirectText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/sign-in')}>
            <Text style={styles.loginRedirectLink}>Log In</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Texts */}
        <View style={styles.headerContainer}>
          <Text style={styles.title}>Tell us about you</Text>
          <Text style={styles.subtitle}>
            This helps us personalize your safety experience and recommendations.
          </Text>
        </View>

        {/* Progress Stepper */}
        <View style={styles.stepperContainer}>
          {/* Step 1: Complete */}
          <View style={styles.step}>
            <View style={[styles.stepIconContainer, styles.completedStepIcon]}>
              <Feather name="user" size={20} color="#F34E62" />
              <View style={styles.completedBadge}>
                <Feather name="check" size={10} color="#FFFFFF" />
              </View>
            </View>
            <Text style={[styles.stepText, styles.activeStepText]}>Account</Text>
          </View>

          <View style={styles.stepperLine} />

          {/* Step 2: Active */}
          <View style={styles.step}>
            <View style={[styles.stepIconContainer, styles.activeStepIcon]}>
              <Feather name="shield" size={18} color="#F34E62" />
            </View>
            <Text style={[styles.stepText, styles.activeStepText]}>Safety Info</Text>
          </View>

          <View style={styles.stepperLine} />

          {/* Step 3: Pending */}
          <View style={styles.step}>
            <View style={styles.stepIconContainer}>
              <Feather name="users" size={18} color="#9CA3AF" />
            </View>
            <Text style={styles.stepText}>Trusted Contacts</Text>
          </View>

          <View style={styles.stepperLine} />

          {/* Step 4: Pending */}
          <View style={styles.step}>
            <View style={styles.stepIconContainer}>
              <Feather name="check" size={18} color="#9CA3AF" />
            </View>
            <Text style={styles.stepText}>Complete</Text>
          </View>
        </View>

        {/* Section 1: Age & Gender */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.cardIconWrapper, { backgroundColor: '#FFF0F2' }]}>
              <Feather name="user" size={18} color="#F34E62" />
            </View>
            <Text style={styles.cardTitle}>Age & Gender</Text>
          </View>
          
          <View style={styles.rowInputs}>
            <View style={styles.halfInputWrapper}>
              <Feather name="calendar" size={16} color="#F34E62" style={styles.inputIconLeft} />
              <TextInput
                style={[styles.textInput, { color: '#111827' }]}
                placeholder="Enter age"
                placeholderTextColor="#9CA3AF"
                value={age}
                onChangeText={setAge}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.halfInputWrapper}>
              <MaterialCommunityIcons name="gender-male-female" size={18} color="#F34E62" style={styles.inputIconLeft} />
              <TextInput
                style={[styles.textInput, { color: '#111827' }]}
                placeholder="Enter gender"
                placeholderTextColor="#9CA3AF"
                value={gender}
                onChangeText={setGender}
              />
            </View>
          </View>
        </View>

        {/* Section 2: Emergency Location Access */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.cardIconWrapper, { backgroundColor: '#F3E8FF' }]}>
              <Feather name="map-pin" size={18} color="#9061F9" />
            </View>
            <Text style={styles.cardTitle}>Emergency Location Access</Text>
          </View>
          <Text style={styles.cardDescription}>
            We need location access to share your location during emergencies and provide safety alerts.
          </Text>
          <TouchableOpacity 
            style={[styles.locationButton, locationGranted && { backgroundColor: '#DEF7EC', borderColor: '#0E9F6E' }]} 
            onPress={requestLocationPermission}
            disabled={locationGranted}
          >
            <View style={styles.locationButtonLeft}>
              {locationGranted ? (
                <Feather name="check-circle" size={16} color="#0E9F6E" />
              ) : (
                <Feather name="navigation" size={16} color="#9061F9" style={{ transform: [{ rotate: '45deg' }] }} />
              )}
              <Text style={[styles.locationButtonText, locationGranted && { color: '#0E9F6E' }]}>
                {locationGranted ? 'Location Access Enabled' : 'Enable Location Access'}
              </Text>
            </View>
            {!locationGranted && <Feather name="chevron-right" size={18} color="#9061F9" />}
          </TouchableOpacity>
        </View>

        {/* Section 3: Health Information */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.cardIconWrapper, { backgroundColor: '#DEF7EC' }]}>
              <MaterialCommunityIcons name="heart-pulse" size={20} color="#0E9F6E" />
            </View>
            <Text style={styles.cardTitle}>Health Information (Optional)</Text>
          </View>
          <Text style={styles.cardDescription}>
            This information will only be used in emergencies.
          </Text>
          <View style={styles.fullInputWrapper}>
            <FontAwesome5 name="briefcase-medical" size={14} color="#0E9F6E" style={styles.inputIconLeft} />
            <TextInput
              style={[styles.textInput, { color: '#111827', flex: 1 }]}
              placeholder="Any medical conditions?"
              placeholderTextColor="#9CA3AF"
              value={medicalConditions}
              onChangeText={setMedicalConditions}
            />
            <Text style={styles.optionalText}>(Optional)</Text>
          </View>
        </View>

        {/* Section 4: Notification Preferences */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.cardIconWrapper, { backgroundColor: '#FEF3C7' }]}>
              <Feather name="bell" size={18} color="#D97706" />
            </View>
            <Text style={styles.cardTitle}>Notification Preferences</Text>
          </View>
          <Text style={styles.cardDescription}>
            Choose how you want to receive alerts and updates.
          </Text>

          <View style={styles.notificationGrid}>
            {/* Push Notifications */}
            <TouchableOpacity 
              style={[styles.notificationBox, pushEnabled && styles.notificationBoxActive]}
              onPress={() => setPushEnabled(!pushEnabled)}
            >
              <View style={[styles.notificationIconWrap, { backgroundColor: '#FFF0F2' }]}>
                <Feather name="bell" size={22} color="#F34E62" />
              </View>
              <Text style={styles.notificationText}>Push</Text>
              <Text style={styles.notificationText}>Notifications</Text>
              {pushEnabled && (
                <View style={styles.checkbox}>
                  <Feather name="check" size={12} color="#FFFFFF" />
                </View>
              )}
            </TouchableOpacity>

            {/* SMS Alerts */}
            <TouchableOpacity 
              style={[styles.notificationBox, smsEnabled && styles.notificationBoxActive]}
              onPress={() => setSmsEnabled(!smsEnabled)}
            >
              <View style={[styles.notificationIconWrap, { backgroundColor: '#FEF3C7' }]}>
                <MaterialCommunityIcons name="message-processing-outline" size={22} color="#D97706" />
              </View>
              <Text style={styles.notificationText}>SMS</Text>
              <Text style={styles.notificationText}>Alerts</Text>
              {smsEnabled && (
                <View style={styles.checkbox}>
                  <Feather name="check" size={12} color="#FFFFFF" />
                </View>
              )}
            </TouchableOpacity>

            {/* Email Updates */}
            <TouchableOpacity 
              style={[styles.notificationBox, emailEnabled && styles.notificationBoxActive]}
              onPress={() => setEmailEnabled(!emailEnabled)}
            >
              <View style={[styles.notificationIconWrap, { backgroundColor: '#E0F2FE' }]}>
                <Feather name="mail" size={22} color="#0284C7" />
              </View>
              <Text style={styles.notificationText}>Email</Text>
              <Text style={styles.notificationText}>Updates</Text>
              {emailEnabled && (
                <View style={styles.checkbox}>
                  <Feather name="check" size={12} color="#FFFFFF" />
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Next Button */}
        <TouchableOpacity style={styles.nextButton} onPress={handleNext} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <>
              <Text style={styles.nextButtonText}>Next</Text>
              <Feather name="chevron-right" size={20} color="#FFFFFF" style={styles.buttonArrow} />
            </>
          )}
        </TouchableOpacity>

        {/* Pagination Dots */}
        <View style={styles.paginationDots}>
          <View style={styles.dot} />
          <View style={[styles.dot, styles.activeDot]} />
          <View style={styles.dot} />
          <View style={styles.dot} />
        </View>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
  },
  backButton: {
    padding: 4,
  },
  loginRedirectContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loginRedirectText: {
    fontSize: 14,
    color: '#6B7280',
  },
  loginRedirectLink: {
    fontSize: 14,
    color: '#F34E62',
    fontWeight: '600',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    paddingTop: 10,
  },
  headerContainer: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    color: '#6B7280',
    lineHeight: 22,
  },
  stepperContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 32,
    paddingHorizontal: 4,
  },
  step: {
    alignItems: 'center',
    width: 65,
  },
  stepIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 8,
  },
  activeStepIcon: {
    backgroundColor: '#FFFFFF',
    borderColor: '#F34E62',
  },
  completedStepIcon: {
    backgroundColor: '#FFF0F2',
    borderColor: '#FFF0F2',
  },
  completedBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#F34E62',
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  stepText: {
    fontSize: 11,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  activeStepText: {
    color: '#F34E62',
    fontWeight: '600',
  },
  stepperLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
    marginTop: 25,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 1,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F3F4F6',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  cardDescription: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
    marginBottom: 16,
  },
  rowInputs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  halfInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F3F4F6',
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    height: 48,
  },
  fullInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F3F4F6',
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    height: 48,
  },
  inputIconLeft: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
  },
  optionalText: {
    fontSize: 13,
    color: '#9CA3AF',
    marginRight: 8,
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F5F3FF',
    borderRadius: 10,
    paddingHorizontal: 16,
    height: 52,
  },
  locationButtonLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationButtonText: {
    marginLeft: 12,
    color: '#9061F9',
    fontWeight: '600',
    fontSize: 14,
  },
  notificationGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  notificationBox: {
    flex: 1,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F3F4F6',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 4,
    backgroundColor: '#FFFFFF',
  },
  notificationBoxActive: {
    borderColor: '#F34E62',
    backgroundColor: '#FFFFFF',
  },
  notificationIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  notificationText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
  },
  checkbox: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 18,
    height: 18,
    borderRadius: 4,
    backgroundColor: '#F34E62',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  nextButton: {
    backgroundColor: '#F34E62',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    borderRadius: 12,
    marginTop: 8,
    marginBottom: 24,
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonArrow: {
    marginLeft: 8,
  },
  paginationDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E5E7EB',
  },
  activeDot: {
    backgroundColor: '#F34E62',
  },
});

