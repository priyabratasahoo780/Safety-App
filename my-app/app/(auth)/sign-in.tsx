import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useSignIn, useOAuth } from '@clerk/clerk-expo';
import * as Linking from 'expo-linking';

export default function SignInScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signIn, setActive, isLoaded } = useSignIn();
  const { startOAuthFlow } = useOAuth({ strategy: 'oauth_google' });

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const { createdSessionId, setActive: setActiveSession } = await startOAuthFlow({
        redirectUrl: Linking.createURL('/oauth-native-callback', { scheme: 'myapp' }),
      });
      if (createdSessionId) {
        await setActiveSession!({ session: createdSessionId });
      }
    } catch (error: any) {
      Alert.alert('Google Sign-In Error', error.errors?.[0]?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter your email and password');
      return;
    }
    if (!isLoaded) return;
    setLoading(true);
    try {
      // Sign in with Clerk (passes route guards)
      const result = await signIn.create({
        identifier: email,
        password: password,
      });

      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
      } else {
        console.warn("Clerk sign-in status not complete:", result.status);
      }
    } catch (error: any) {
      Alert.alert('Login Failed', error.errors?.[0]?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    Alert.alert('Reset Password', 'Password reset email can be requested via the Clerk web dashboard.');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar style="dark" />

      {/* Top Header */}
      <View style={styles.topRow}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Feather name="arrow-left" size={24} color="#1F2937" />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.content}
      >
        {/* Logo and Brand Header */}
        <View style={styles.headerContainer}>
          <Image
            source={require('@/assets/images/safesphere_logo.jpg')}
            style={styles.logo}
            contentFit="contain"
          />
          <Text style={styles.brandTitle}>SafeSphere <Text style={{ color: '#F34E62' }}>AI</Text></Text>
          <Text style={styles.brandSubtitle}>Your intelligent personal safety companion</Text>
        </View>

        {/* Navigation Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity style={[styles.tab, styles.activeTab]} onPress={() => { }}>
            <Feather name="log-in" size={16} color="#F34E62" style={styles.tabIcon} />
            <Text style={[styles.tabText, styles.activeTabText]}>Log In</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.tab} onPress={() => router.push('/(auth)/sign-up')}>
            <Feather name="user-plus" size={16} color="#6B7280" style={styles.tabIcon} />
            <Text style={styles.tabText}>Sign Up</Text>
          </TouchableOpacity>
        </View>

        {/* Form */}
        <View style={styles.formContainer}>
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
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeButton}>
                <Feather name={showPassword ? 'eye-off' : 'eye'} size={18} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity style={styles.forgotContainer} onPress={handleForgotPassword}>
            <Text style={styles.forgotText}>Forgot Password?</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.primaryButton}
            activeOpacity={0.9}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Text style={styles.primaryButtonText}>Log In</Text>
                <Feather name="chevron-right" size={20} color="#FFFFFF" style={styles.buttonArrow} />
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Divider */}
        <View style={styles.dividerContainer}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Google Button */}
        <TouchableOpacity
          style={styles.socialButton}
          onPress={handleGoogleSignIn}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#F34E62" />
          ) : (
            <>
              <Ionicons name="logo-google" size={18} color="#EA4335" style={styles.socialIcon} />
              <Text style={styles.socialButtonText}>Continue with Google</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Footer */}
        <View style={styles.footerContainer}>
          <View style={styles.footerIconWrapper}>
            <Feather name="shield" size={16} color="#F34E62" />
          </View>
          <Text style={styles.footerText}>
            Your data is secure and encrypted.{'\n'}We never share your information.
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF', paddingHorizontal: 20 },
  topRow: { paddingTop: 8, marginBottom: 4 },
  backButton: { padding: 4 },
  content: { flex: 1, justifyContent: 'center' },
  headerContainer: { alignItems: 'center', marginBottom: 20 },
  logo: { width: 72, height: 72, marginBottom: 8 },
  brandTitle: { fontSize: 22, fontWeight: '800', color: '#1F2937' },
  brandSubtitle: { fontSize: 12, color: '#6B7280', marginTop: 3, textAlign: 'center' },
  tabsContainer: {
    flexDirection: 'row', borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6', marginBottom: 20,
  },
  tab: {
    flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    paddingVertical: 12, borderBottomWidth: 2, borderBottomColor: 'transparent',
  },
  activeTab: { borderBottomColor: '#F34E62' },
  tabIcon: { marginRight: 5 },
  tabText: { fontSize: 13, fontWeight: '600', color: '#6B7280' },
  activeTabText: { color: '#F34E62' },
  formContainer: { width: '100%', marginBottom: 16 },
  inputGroup: { marginBottom: 14 },
  inputLabel: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 6 },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center', borderWidth: 1,
    borderColor: '#E5E7EB', borderRadius: 12, paddingHorizontal: 12,
    height: 50, backgroundColor: '#FAFAFA',
  },
  inputIcon: { marginRight: 10 },
  textInput: { flex: 1, fontSize: 15, color: '#1F2937' },
  eyeButton: { padding: 6 },
  forgotContainer: { alignSelf: 'flex-end', marginBottom: 14 },
  forgotText: { fontSize: 13, color: '#F34E62', fontWeight: '600' },
  primaryButton: {
    flexDirection: 'row', width: '100%', height: 52, backgroundColor: '#F34E62',
    borderRadius: 14, justifyContent: 'center', alignItems: 'center',
    shadowColor: '#F34E62', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2, shadowRadius: 10, elevation: 4,
  },
  primaryButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  buttonArrow: { marginLeft: 6 },
  dividerContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#E5E7EB' },
  dividerText: { marginHorizontal: 12, color: '#9CA3AF', fontSize: 13 },
  socialButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12,
    height: 50, backgroundColor: '#FFFFFF', marginBottom: 16,
  },
  socialIcon: { marginRight: 10 },
  socialButtonText: { fontSize: 14, fontWeight: '600', color: '#374151' },
  footerContainer: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 10,
  },
  footerIconWrapper: {
    width: 30, height: 30, borderRadius: 15, backgroundColor: '#FFF0F2',
    justifyContent: 'center', alignItems: 'center', marginRight: 10,
  },
  footerText: { fontSize: 11, color: '#6B7280', lineHeight: 16 },
});
