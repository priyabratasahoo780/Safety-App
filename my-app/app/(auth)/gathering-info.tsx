import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Feather, FontAwesome5 } from '@expo/vector-icons';
import { authService } from '../../src/services/authService';
import { GOOGLE_CLIENT_IDS } from '../../src/config/firebaseConfig';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import * as AuthSession from 'expo-auth-session';

WebBrowser.maybeCompleteAuthSession();

export default function GatheringInfoScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const [fullName, setFullName] = useState((params.fullName as string) || '');
  const [email, setEmail] = useState((params.email as string) || '');
  const [password, setPassword] = useState((params.password as string) || '');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [dob, setDob] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDobChange = (text: string) => {
    // Simple mask for MM/DD/YYYY
    let cleaned = text.replace(/[^0-9]/g, '');
    if (cleaned.length > 8) cleaned = cleaned.substring(0, 8);
    
    let formatted = cleaned;
    if (cleaned.length > 2) {
      formatted = cleaned.substring(0, 2) + '/' + cleaned.substring(2);
    }
    if (cleaned.length > 4) {
      formatted = formatted.substring(0, 5) + '/' + cleaned.substring(4);
    }
    setDob(formatted);
  };

  const handleNext = async () => {
    if (password !== confirmPassword && !params.password) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }
    // If we came from sign-up with password, they didn't have to fill confirm password.
    // If they typed it here, they do. We'll enforce password match if they type it here.
    const finalPassword = password || (params.password as string);
    if (!finalPassword) {
      Alert.alert("Error", "Please enter a password");
      return;
    }

    setLoading(true);
    try {
      await authService.signUp(email, finalPassword, fullName);
      router.push('/(auth)/safety-info');
    } catch (error: any) {
      Alert.alert("Sign up Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: GOOGLE_CLIENT_IDS.webClientId,
    responseType: 'id_token',
    redirectUri: AuthSession.makeRedirectUri({ useProxy: true }),
  });

  React.useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params;
      authService.loginWithGoogleCredential(id_token).then(() => {
        router.replace('/(tabs)/home');
      }).catch(error => {
        Alert.alert('Google Sign-In Error', error.message);
      });
    }
  }, [response]);

  const handleGoogleSignIn = async () => {
    promptAsync();
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

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header Texts */}
          <View style={styles.headerContainer}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>{"Let's set up your SafeSphere AI account"}</Text>
          </View>

          {/* Progress Stepper */}
          <View style={styles.stepperContainer}>
            <View style={styles.step}>
              <View style={[styles.stepIconContainer, styles.activeStepIcon]}>
                <Feather name="user" size={20} color="#F34E62" />
              </View>
              <Text style={[styles.stepText, styles.activeStepText]}>Account</Text>
            </View>

            <View style={styles.stepperLine} />

            <View style={styles.step}>
              <View style={styles.stepIconContainer}>
                <Feather name="shield" size={18} color="#9CA3AF" />
              </View>
              <Text style={styles.stepText}>Safety Info</Text>
            </View>

            <View style={styles.stepperLine} />

            <View style={styles.step}>
              <View style={styles.stepIconContainer}>
                <Feather name="users" size={18} color="#9CA3AF" />
              </View>
              <Text style={styles.stepText}>Trusted Contacts</Text>
            </View>

            <View style={styles.stepperLine} />

            <View style={styles.step}>
              <View style={styles.stepIconContainer}>
                <Feather name="check" size={18} color="#9CA3AF" />
              </View>
              <Text style={styles.stepText}>Complete</Text>
            </View>
          </View>

          {/* Form Fields */}
          <View style={styles.formContainer}>
            
            {/* Full Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Full Name</Text>
              <View style={styles.inputWrapper}>
                <Feather name="user" size={18} color="#F34E62" style={styles.inputIconLeft} />
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter your full name"
                  placeholderTextColor="#9CA3AF"
                  value={fullName}
                  onChangeText={setFullName}
                />
              </View>
            </View>

            {/* Email Address */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email Address</Text>
              <View style={styles.inputWrapper}>
                <Feather name="mail" size={18} color="#F34E62" style={styles.inputIconLeft} />
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter your email address"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>
            </View>

            {/* Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Password</Text>
              <View style={styles.inputWrapper}>
                <Feather name="lock" size={18} color="#F34E62" style={styles.inputIconLeft} />
                <TextInput
                  style={styles.textInput}
                  placeholder="Create a strong password"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.inputIconRight}>
                  <Feather name={showPassword ? "eye" : "eye-off"} size={18} color="#6B7280" />
                </TouchableOpacity>
              </View>
              <Text style={styles.helperText}>
                At least 8 characters with uppercase, lowercase, number & symbol
              </Text>
            </View>

            {/* Confirm Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Confirm Password</Text>
              <View style={styles.inputWrapper}>
                <Feather name="lock" size={18} color="#F34E62" style={styles.inputIconLeft} />
                <TextInput
                  style={styles.textInput}
                  placeholder="Confirm your password"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry={!showConfirmPassword}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                />
                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.inputIconRight}>
                  <Feather name={showConfirmPassword ? "eye" : "eye-off"} size={18} color="#6B7280" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Date of Birth */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Date of Birth</Text>
              <View style={styles.inputWrapper}>
                <Feather name="calendar" size={18} color="#F34E62" style={styles.inputIconLeft} />
                <TextInput
                  style={[styles.textInput, { color: '#1F2937' }]}
                  placeholder="MM/DD/YYYY"
                  placeholderTextColor="#9CA3AF"
                  editable={true}
                  keyboardType="numeric"
                  value={dob}
                  onChangeText={handleDobChange}
                  maxLength={10}
                />
                <Feather name="calendar" size={20} color="#6B7280" style={styles.inputIconRight} />
              </View>
            </View>
            
          </View>

          {/* Next Button */}
          <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
            <Text style={styles.nextButtonText}>Next</Text>
            <Feather name="chevron-right" size={20} color="#FFFFFF" style={styles.buttonArrow} />
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Social Sign Up */}
          <View style={styles.socialContainer}>
            <TouchableOpacity style={styles.socialButton} onPress={handleGoogleSignIn}>
              <FontAwesome5 name="google" size={18} color="#DB4437" style={styles.socialIcon} />
              <Text style={styles.socialButtonText}>Sign up with Google</Text>
            </TouchableOpacity>


            <TouchableOpacity style={styles.socialButton} onPress={() => router.push('/(auth)/otp-verify')}>
              <Feather name="phone" size={18} color="#6D28D9" style={styles.socialIcon} />
              <Text style={styles.socialButtonText}>Sign up with Phone Number</Text>
            </TouchableOpacity>
          </View>

          {/* Security Footer */}
          <View style={styles.securityFooter}>
            <Feather name="shield" size={18} color="#F34E62" />
            <View style={styles.securityTextContainer}>
              <Text style={styles.securityText}>Your data is secure and encrypted.</Text>
              <Text style={styles.securityText}>We never share your information.</Text>
            </View>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
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
    backgroundColor: '#FFF0F2',
    borderColor: '#F34E62',
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
  formContainer: {
    gap: 18,
    marginBottom: 24,
  },
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F3F4F6',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    height: 56,
  },
  inputIconLeft: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    color: '#111827',
  },
  inputIconRight: {
    padding: 4,
  },
  helperText: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: -4,
  },
  nextButton: {
    backgroundColor: '#F34E62',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    borderRadius: 12,
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
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#F3F4F6',
  },
  dividerText: {
    paddingHorizontal: 16,
    color: '#9CA3AF',
    fontSize: 14,
  },
  socialContainer: {
    gap: 12,
    marginBottom: 32,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#F3F4F6',
    borderRadius: 12,
    height: 52,
    backgroundColor: '#FFFFFF',
  },
  socialIcon: {
    marginRight: 12,
  },
  socialButtonText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#374151',
  },
  securityFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  securityTextContainer: {
    alignItems: 'flex-start',
  },
  securityText: {
    fontSize: 12,
    color: '#9CA3AF',
    lineHeight: 18,
  },
});

