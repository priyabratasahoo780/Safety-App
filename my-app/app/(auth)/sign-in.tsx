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
import { Image } from 'expo-image';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { Feather, Ionicons, FontAwesome } from '@expo/vector-icons';
import { authService } from '../../src/services/authService';
import { GOOGLE_CLIENT_IDS } from '../../src/config/firebaseConfig';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import * as AuthSession from 'expo-auth-session';

WebBrowser.maybeCompleteAuthSession();

export default function SignInScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter your email and password');
      return;
    }
    setLoading(true);
    try {
      await authService.login(email, password);
      router.replace('/(drawer)/(tabs)/home');
    } catch (error: any) {
      Alert.alert('Login Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      Alert.alert('Reset Password', 'Please enter your email address first.');
      return;
    }
    try {
      await authService.resetPassword(email);
      Alert.alert('Success', 'Password reset email sent. Check your inbox.');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: GOOGLE_CLIENT_IDS.webClientId,
    responseType: 'id_token',
    redirectUri: AuthSession.makeRedirectUri(),
  });

  React.useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params;
      authService.loginWithGoogleCredential(id_token).then(() => {
        router.replace('/(drawer)/(tabs)/home');
      }).catch(error => {
        Alert.alert('Google Sign-In Error', error.message);
      });
    }
  }, [response]);

  const handleGoogleSignIn = async () => {
    if (Platform.OS === 'web') {
      try {
        Alert.alert('Google Sign-In', 'Web sign-in is not implemented yet.');
      } catch (error: any) {
        Alert.alert('Google Sign-In Error', error.message);
      }
    } else {
      promptAsync();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Top Header Row */}
      <View style={styles.topRow}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Feather name="arrow-left" size={24} color="#1F2937" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.languageButton} onPress={() => Alert.alert('Language', 'Language selection coming soon.')}>
          <Feather name="globe" size={16} color="#4B5563" style={styles.globeIcon} />
          <Text style={styles.languageText}>English</Text>
          <Feather name="chevron-down" size={14} color="#4B5563" />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo and Brand Header */}
          <View style={styles.headerContainer}>
            <Image
              source={require('@/assets/images/safesphere_logo.png')}
              style={styles.logo}
              contentFit="contain"
            />
            <Text style={styles.brandTitle}>SafeSphere <Text style={{ color: '#F34E62' }}>AI</Text></Text>
            <Text style={styles.brandSubtitle}>Your intelligent personal safety companion</Text>
          </View>

          {/* Navigation Tabs */}
          <View style={styles.tabsContainer}>
            {/* Log In Tab */}
            <TouchableOpacity
              style={[styles.tab, styles.activeTab]}
              onPress={() => {}}
            >
              <Feather name="log-in" size={16} color="#F34E62" style={styles.tabIcon} />
              <Text style={[styles.tabText, styles.activeTabText]}>Log In</Text>
            </TouchableOpacity>

            {/* Sign Up Tab */}
            <TouchableOpacity
              style={styles.tab}
              onPress={() => router.push('/(auth)/sign-up')}
            >
              <Feather name="user-plus" size={16} color="#6B7280" style={styles.tabIcon} />
              <Text style={styles.tabText}>Sign Up</Text>
            </TouchableOpacity>

            {/* Login with OTP Tab */}
            <TouchableOpacity
              style={styles.tab}
              onPress={() => router.push('/(auth)/otp-verify')}
            >
              <Feather name="smartphone" size={16} color="#6B7280" style={styles.tabIcon} />
              <Text style={styles.tabText}>Login with OTP</Text>
            </TouchableOpacity>
          </View>

          {/* Email Login Form */}
          <View style={styles.formContainer}>
            {/* Email Address Field */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email Address</Text>
              <View style={styles.inputWrapper}>
                <Feather name="mail" size={18} color="#9CA3AF" style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter your email"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>
            </View>

            {/* Password Field */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Password</Text>
              <View style={styles.inputWrapper}>
                <Feather name="lock" size={18} color="#9CA3AF" style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter your password"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeButton}
                >
                  <Feather
                    name={showPassword ? 'eye-off' : 'eye'}
                    size={18}
                    color="#9CA3AF"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Forgot Password Link */}
            <TouchableOpacity style={styles.forgotContainer} onPress={handleForgotPassword}>
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </TouchableOpacity>

            {/* Primary Action Button */}
            <TouchableOpacity 
              style={styles.primaryButton}
              activeOpacity={0.9}
              onPress={handleLogin}
            >
              <Text style={styles.primaryButtonText}>Log In</Text>
              <Feather name="chevron-right" size={20} color="#FFFFFF" style={styles.buttonArrow} />
            </TouchableOpacity>
          </View>

          {/* Social Logins Divider */}
          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Social Login Buttons */}
          <View style={styles.socialContainer}>
            {/* Google */}
            <TouchableOpacity style={styles.socialButton} onPress={handleGoogleSignIn}>
              <Ionicons name="logo-google" size={18} color="#EA4335" style={styles.socialIcon} />
              <Text style={styles.socialButtonText}>Continue with Google</Text>
            </TouchableOpacity>


            {/* Phone */}
            <TouchableOpacity style={styles.socialButton} onPress={() => router.push('/(auth)/otp-verify')}>
              <Feather name="phone" size={18} color="#6B21A8" style={styles.socialIcon} />
              <Text style={styles.socialButtonText}>Continue with Phone</Text>
            </TouchableOpacity>
          </View>

          {/* Security Disclaimer Footer */}
          <View style={styles.footerContainer}>
            <View style={styles.footerIconWrapper}>
              <Feather name="shield" size={18} color="#F34E62" />
            </View>
            <Text style={styles.footerText}>
              Your data is secure and encrypted.{'\n'}We never share your information.
            </Text>
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
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 5,
  },
  backButton: {
    padding: 5,
  },
  languageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  globeIcon: {
    marginRight: 6,
  },
  languageText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
    marginRight: 4,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  headerContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  logo: {
    width: 90,
    height: 90,
    marginBottom: 10,
  },
  brandTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1F2937',
  },
  brandSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
    textAlign: 'center',
  },
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#F34E62',
  },
  tabIcon: {
    marginRight: 6,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
  },
  activeTabText: {
    color: '#F34E62',
  },
  formContainer: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 52,
    backgroundColor: '#FAFAFA',
  },
  inputIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    color: '#1F2937',
  },
  eyeButton: {
    padding: 8,
  },
  forgotContainer: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  forgotText: {
    fontSize: 13,
    color: '#F34E62',
    fontWeight: '600',
  },
  primaryButton: {
    flexDirection: 'row',
    width: '100%',
    height: 56,
    backgroundColor: '#F34E62',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 10,
    shadowColor: '#F34E62',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
  buttonArrow: {
    marginLeft: 6,
    marginTop: 2,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  dividerText: {
    marginHorizontal: 12,
    color: '#9CA3AF',
    fontSize: 14,
  },
  socialContainer: {
    gap: 12,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    height: 52,
    backgroundColor: '#FFFFFF',
  },
  socialIcon: {
    position: 'absolute',
    left: 20,
  },
  socialButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  footerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 30,
    paddingHorizontal: 10,
  },
  footerIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFF0F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  footerText: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 18,
  },
});

